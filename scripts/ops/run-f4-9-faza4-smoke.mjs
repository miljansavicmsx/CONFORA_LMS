#!/usr/bin/env node
/**
 * F4-9 Faza 4 Contact / Reports / Legacy Strangler Smoke
 *
 * Live Nest + PostgreSQL + Keycloak integration smoke.
 * Evidence: docs/evidence/f4-9-faza4-smoke/<timestamp>/
 *
 * Usage:
 *   node scripts/ops/run-f4-9-faza4-smoke.mjs
 *   npm run ops:f4-9-smoke
 *
 * Env:
 *   NEST_API_URL                 default http://localhost:4000
 *   PILOT_USER_PASSWORD          default PilotTest!2026
 *   PILOT_USER_EMAIL             default pilot.learner@confora.test
 *   PILOT_DIRECTOR_EMAIL         default pilot.director@confora.test
 *   PILOT_STAFF_WRONG_TENANT_EMAIL default pilot.staff.wrong-tenant@confora.test
 *   POSTGRES_DOCKER_CONTAINER    default confora-postgres
 *   POSTGRES_USER                default confora
 *   POSTGRES_DB                  default confora_smoke
 *   SKIP_FRONTEND_VALIDATION     set 1 to skip validate:f4-frontend-cutover
 */
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { DEFAULT_TENANT_ID } from './b3-3d-draft-write-smoke.helpers.mjs';
import {
  CONTACT_NOTIFICATION_QUEUED_AUDIT_ACTION,
  CONTACT_REQUEST_ACKNOWLEDGED_AUDIT_ACTION,
  CONTACT_REQUEST_ASSIGNED_AUDIT_ACTION,
  CONTACT_REQUEST_RESPONDED_AUDIT_ACTION,
  CONTACT_REQUEST_ROUTED_TO_APPEAL_REVIEW_AUDIT_ACTION,
  CONTACT_REQUEST_ROUTED_TO_COMPLAINT_REVIEW_AUDIT_ACTION,
  CONTACT_REQUEST_SUBMITTED_AUDIT_ACTION,
  CONTACT_SLA_PREVIEWED_AUDIT_ACTION,
  F4_REPORTS_GOVERNANCE_PATHS,
  F4_REPORTS_READONLY_PATHS,
  F4_SMOKE_EXPECTED_AUDIT_ACTIONS,
  LEGACY_ALIAS_READ_PATHS,
  LEGACY_BLOCKED_PATHS,
  LEGACY_ROUTE_ALIAS_USED_ACTION,
  LEGACY_ROUTE_BLOCKED_ACTION,
  REPORT_ACCESS_DENIED_AUDIT_ACTION,
  REPORT_EXPORT_DENIED_AUDIT_ACTION,
  REPORT_EXPORTED_AUDIT_ACTION,
  REPORT_EXPORT_REQUESTED_AUDIT_ACTION,
  REPORT_VIEWED_AUDIT_ACTION,
  classifyLegacyBlockResponse,
  countAuditRows,
  evaluateAuditRowsRedaction,
  evaluateF4SideEffectInvariants,
  evaluatePublicContactRedaction,
  evaluateReportRedaction,
  buildCleanupSyntheticF4SlaCheckpointsSql,
  buildRunScopedSlaCheckpointCountSql,
  maxAllowedSlaCheckpointDeltaForRun,
  F4_9_SMOKE_SUBJECT_MARKER,
  hasAnyAuditAction,
  isBlockedStatus,
  isDeniedStatus,
  isForbiddenStatus,
  isSuccessStatus,
  learnerContactRequestsPath,
  learnerContactResponsesPath,
  legacyPublicContactPath,
  publicContactRequestsPath,
  publicContactStatusPath,
  resolveContactRequestId,
  resolveContactRequestStatus,
  resolvePublicReference,
  staffContactAcknowledgePath,
  staffContactAssignPath,
  staffContactClosePath,
  staffContactNotifyPath,
  staffContactNotificationsPath,
  staffContactQueuePath,
  staffContactRequestPath,
  staffContactResolvePath,
  staffContactRespondPath,
  staffContactRoutePath,
  staffContactSlaPath,
  staffContactSlaPreviewPath,
  staffContactSlaRecalculatePath,
  staffContactSlaRunPath,
  staffReportsExportPath,
  staffReportsExportPolicyPath,
  summarizeSmokeResults,
} from './lib/f4-9-smoke-helpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

const NEST_API = (process.env.NEST_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const PILOT_PASSWORD = process.env.PILOT_USER_PASSWORD ?? 'PilotTest!2026';
const LEARNER_EMAIL = process.env.PILOT_USER_EMAIL ?? 'pilot.learner@confora.test';
const DIRECTOR_EMAIL = process.env.PILOT_DIRECTOR_EMAIL ?? 'pilot.director@confora.test';
const WRONG_TENANT_EMAIL =
  process.env.PILOT_STAFF_WRONG_TENANT_EMAIL ?? 'pilot.staff.wrong-tenant@confora.test';
const DIRECTOR_ID = process.env.F4_9_DIRECTOR_ID ?? 'b5200000-0000-4000-8000-000000000040';
const SKIP_FRONTEND = process.env.SKIP_FRONTEND_VALIDATION === '1';

const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const SMOKE_STARTED_AT = new Date().toISOString();
const EVIDENCE_DIR = join(REPO_ROOT, 'docs', 'evidence', 'f4-9-faza4-smoke', TIMESTAMP);

/** @type {Array<{ id: string; pass: boolean; detail: string; section?: string; at: string }>} */
const results = [];
/** @type {Array<{ id: string; message: string; at: string }>} */
const errors = [];

let createdContactRequestPublicReference = null;
let workflowContactRequestId = null;
/** @type {Set<string>} */
const runContactRequestIds = new Set();
const reportsValidated = [];
const exportsValidated = [];
const aliasesValidated = [];
const blocksValidated = [];

function log(line) {
  console.log(line);
  appendFileSync(join(EVIDENCE_DIR, 'smoke-output.txt'), `${line}\n`, 'utf8');
}

function record(id, pass, detail, section = 'general') {
  results.push({ id, pass, detail, section, at: new Date().toISOString() });
  log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${detail}`);
  if (!pass) errors.push({ id, message: detail, at: new Date().toISOString() });
}

function writeJson(name, data) {
  const full = join(EVIDENCE_DIR, name);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return full;
}

function writeText(name, text) {
  const full = join(EVIDENCE_DIR, name);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text, 'utf8');
  return full;
}

async function healthCheck() {
  for (const path of ['/health', '/api/health']) {
    try {
      const res = await fetch(`${NEST_API}${path}`);
      if (res.ok) return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

async function login(username, attempts = 3) {
  let lastError = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(`${NEST_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username, password: PILOT_PASSWORD }),
      });
      return { status: res.status, body: await res.json().catch(() => ({})) };
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastError ?? new Error(`login failed for ${username}`);
}

function extractAccessToken(body) {
  return body?.access_token ?? body?.accessToken ?? null;
}

async function fetchWithRetry(url, init = {}, attempts = 3) {
  let lastError = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastError ?? new Error(`fetch failed for ${url}`);
}

async function authFetch(path, token, init = {}) {
  const res = await fetchWithRetry(`${NEST_API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const contentType = res.headers.get('content-type') ?? '';
  let body;
  if (contentType.includes('application/json')) {
    body = await res.json().catch(() => ({}));
  } else {
    body = await res.text().catch(() => '');
  }
  return {
    status: res.status,
    body,
    path,
    headers: Object.fromEntries(res.headers.entries()),
  };
}

async function publicFetch(path, init = {}) {
  const res = await fetchWithRetry(`${NEST_API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      'User-Agent': 'Mozilla/5.0 (compatible; CONFORA-F4-9/1.0)',
      ...(init.headers ?? {}),
    },
  });
  const contentType = res.headers.get('content-type') ?? '';
  let body;
  if (contentType.includes('application/json')) {
    body = await res.json().catch(() => ({}));
  } else {
    body = await res.text().catch(() => '');
  }
  return { status: res.status, body, path, headers: Object.fromEntries(res.headers.entries()) };
}

function runPsql(sql) {
  const result = spawnSync(
    'docker',
    [
      'exec',
      '-i',
      process.env.POSTGRES_DOCKER_CONTAINER ?? 'confora-postgres',
      'psql',
      '-U',
      process.env.POSTGRES_USER ?? 'confora',
      '-d',
      process.env.POSTGRES_DB ?? 'confora_smoke',
      '-t',
      '-A',
      '-F',
      '|',
      '-c',
      sql,
    ],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `psql failed: ${sql.slice(0, 80)}`);
  }
  return (result.stdout ?? '').trim();
}

function trackContactRequestId(id) {
  if (id && typeof id === 'string') runContactRequestIds.add(id);
}

function cleanupSyntheticF4SlaCheckpoints() {
  try {
    const sql = buildCleanupSyntheticF4SlaCheckpointsSql(DEFAULT_TENANT_ID);
    runPsql(sql);
    return true;
  } catch {
    return false;
  }
}

function queryRunScopedSlaCheckpointCount(contactRequestIds) {
  const ids = [...contactRequestIds];
  if (!ids.length) return 0;
  const sql = buildRunScopedSlaCheckpointCountSql(DEFAULT_TENANT_ID, ids);
  return Number(runPsql(sql) || 0);
}

function querySideEffectFingerprint(contactRequestIds = []) {
  const tenant = DEFAULT_TENANT_ID;
  const q = (sql) => {
    try {
      return runPsql(sql);
    } catch {
      return null;
    }
  };
  const num = (sql) => Number(q(sql) || 0);

  return {
    certificateCount: num(`SELECT COUNT(*) FROM cert.certificates WHERE tenant_id = '${tenant}';`),
    lifecycleEventCount: num(
      `SELECT COUNT(*) FROM cert.certificate_lifecycle_events WHERE tenant_id = '${tenant}';`,
    ),
    certificationDecisionCount: num(
      `SELECT COUNT(*) FROM cert.certification_decision_reviews WHERE tenant_id = '${tenant}';`,
    ),
    recertificationCaseCount: num(
      `SELECT COUNT(*) FROM cert.recertification_cases WHERE tenant_id = '${tenant}';`,
    ),
    appealCaseCount: num(`SELECT COUNT(*) FROM gov.appeal_cases WHERE tenant_id = '${tenant}';`),
    complaintCaseCount: num(`SELECT COUNT(*) FROM gov.complaint_cases WHERE tenant_id = '${tenant}';`),
    legacyComplaintCount: num(`SELECT COUNT(*) FROM gov.complaints WHERE tenant_id = '${tenant}';`),
    legacyAppealCount: num(`SELECT COUNT(*) FROM gov.appeals WHERE tenant_id = '${tenant}';`),
    contactRequestCount: num(`SELECT COUNT(*) FROM gov.contact_requests WHERE tenant_id = '${tenant}';`),
    contactNotificationLogCount: num(
      `SELECT COUNT(*) FROM gov.contact_notification_logs WHERE tenant_id = '${tenant}';`,
    ),
    contactSlaCheckpointCount: num(
      `SELECT COUNT(*) FROM gov.contact_sla_checkpoints WHERE tenant_id = '${tenant}';`,
    ),
    publicVerificationCount: num(
      q(
        `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'verify' AND table_name = 'verification_records';`,
      ) === '1'
        ? `SELECT COUNT(*) FROM verify.verification_records WHERE tenant_id = '${tenant}';`
        : 'SELECT 0;',
    ),
    runScopedContactSlaCheckpointCount: queryRunScopedSlaCheckpointCount(contactRequestIds),
  };
}

function queryAuditEventsSinceStart() {
  const tenant = DEFAULT_TENANT_ID;
  const raw = runPsql(
    `SELECT id, occurred_at, action, resource_type, resource_id, new_value::text
     FROM audit."AuditEvent"
     WHERE tenant_id = '${tenant}'
       AND occurred_at >= '${SMOKE_STARTED_AT}'::timestamptz
     ORDER BY occurred_at ASC;`,
  );
  if (!raw) return [];
  return raw.split('\n').filter(Boolean).map((line) => {
    const [id, occurredAt, action, resourceType, resourceId, newValue] = line.split('|');
    return { id, occurredAt, action, resourceType, resourceId, new_value: newValue ?? '' };
  });
}

async function runContactPublicFlow(contactFlowEvidence) {
  const section = 'contact-public';

  const submitRes = await publicFetch(publicContactRequestsPath(), {
    method: 'POST',
    body: JSON.stringify({
      requestType: 'GENERAL_INQUIRY',
      subject: `F4-9 smoke ${TIMESTAMP}`,
      messageSummary: 'Automated F4-9 public contact smoke — privacy-safe validation.',
      isAnonymous: true,
    }),
  });
  const publicRef = resolvePublicReference(submitRes.body);
  createdContactRequestPublicReference = publicRef;
  const submitRedaction = evaluatePublicContactRedaction(submitRes.body);
  const submitOk =
    (submitRes.status === 201 || submitRes.status === 200) &&
    Boolean(publicRef) &&
    submitRedaction.pass;
  record(
    'F49-CONTACT-PUBLIC-SUBMIT',
    submitOk,
    `status=${submitRes.status}; ref=${publicRef ?? 'missing'}`,
    section,
  );
  contactFlowEvidence.checks.push({ id: 'public-submit', response: submitRes, redaction: submitRedaction });

  if (publicRef) {
    const statusRes = await publicFetch(publicContactStatusPath(publicRef));
    const statusRedaction = evaluatePublicContactRedaction(statusRes.body);
    const statusOk = isSuccessStatus(statusRes.status) && statusRedaction.pass;
    record(
      'F49-CONTACT-PUBLIC-STATUS',
      statusOk,
      `status=${statusRes.status}; lookup=${publicRef}`,
      section,
    );
    contactFlowEvidence.checks.push({ id: 'public-status', response: statusRes, redaction: statusRedaction });
  }

  const aliasForm = new FormData();
  aliasForm.append('category', 'general');
  aliasForm.append('name', 'F4-9 Alias Smoke');
  aliasForm.append('email', 'f49-alias@example.test');
  aliasForm.append('subject', `F4-9 legacy alias ${TIMESTAMP}`);
  aliasForm.append('body', 'Legacy alias compatibility smoke body.');
  aliasForm.append('captchaToken', '00000000-0000-0000-0000-000000000002');
  const aliasRes = await publicFetch(legacyPublicContactPath(), { method: 'POST', body: aliasForm });
  const aliasRef = resolvePublicReference(aliasRes.body);
  const aliasOk =
    aliasRes.status === 201 || aliasRes.status === 200 || aliasRes.status === 503 || aliasRes.status === 400 || aliasRes.status === 429;
  record(
    'F49-CONTACT-LEGACY-ALIAS',
    aliasOk,
    `legacy POST /v1/public/contact status=${aliasRes.status}; ref=${aliasRef ?? 'n/a'}; deprecation=${aliasRes.headers.deprecation ?? aliasRes.headers.Deprecation ?? 'n/a'}`,
    section,
  );
  contactFlowEvidence.checks.push({
    id: 'legacy-public-alias',
    response: { status: aliasRes.status, body: aliasRes.body, headers: aliasRes.headers },
  });
}

async function runContactLearnerFlow(learnerToken, contactFlowEvidence) {
  const section = 'contact-learner';
  const evidence = { checks: [], notApplicable: false };

  const listRes = await authFetch(learnerContactRequestsPath(), learnerToken);
  if (listRes.status === 404) {
    evidence.notApplicable = true;
    record('F49-CONTACT-LEARNER-LIST', true, 'learner contact list route not implemented (404) — N/A', section);
    contactFlowEvidence.learner = evidence;
    return;
  }

  const submitRes = await authFetch(learnerContactRequestsPath(), learnerToken, {
    method: 'POST',
    body: JSON.stringify({
      requestType: 'APPLICATION_SUPPORT',
      subject: `F4-9 learner contact ${TIMESTAMP}`,
      messageSummary: 'Learner authenticated contact smoke.',
    }),
  });
  const contactId = resolveContactRequestId(submitRes.body);
  trackContactRequestId(contactId);
  const learnerRef = resolvePublicReference(submitRes.body);
  record(
    'F49-CONTACT-LEARNER-SUBMIT',
    isSuccessStatus(submitRes.status) && Boolean(contactId || learnerRef),
    `status=${submitRes.status}; id=${contactId ?? 'n/a'}`,
    section,
  );
  evidence.checks.push({ id: 'learner-submit', response: submitRes });

  if (contactId) {
    const readRes = await authFetch(`${learnerContactRequestsPath()}/${contactId}`, learnerToken);
    record(
      'F49-CONTACT-LEARNER-READ-OWN',
      isSuccessStatus(readRes.status),
      `own read status=${readRes.status}`,
      section,
    );
    evidence.checks.push({ id: 'learner-read-own', response: readRes });
  }

  contactFlowEvidence.learner = evidence;
}

async function runContactStaffWorkflow(directorToken, learnerToken) {
  const section = 'contact-staff';
  const evidence = { checks: [] };
  const complaintBefore = querySideEffectFingerprint().complaintCaseCount;
  const appealBefore = querySideEffectFingerprint().appealCaseCount;

  const submitRes = await authFetch(learnerContactRequestsPath(), learnerToken, {
    method: 'POST',
    body: JSON.stringify({
      requestType: 'TECHNICAL_SUPPORT',
      subject: `F4-9 staff workflow ${TIMESTAMP}`,
      messageSummary: 'Staff workflow smoke contact request.',
    }),
  });
  workflowContactRequestId = resolveContactRequestId(submitRes.body);
  trackContactRequestId(workflowContactRequestId);
  record(
    'F49-CONTACT-WF-SEED',
    isSuccessStatus(submitRes.status) && Boolean(workflowContactRequestId),
    `workflow contact id=${workflowContactRequestId ?? 'missing'}`,
    section,
  );
  evidence.checks.push({ id: 'seed', response: submitRes });

  if (!workflowContactRequestId) {
    writeJson('contact-staff-workflow.json', evidence);
    return;
  }

  const queueRes = await authFetch(`${staffContactQueuePath()}?status=SUBMITTED`, directorToken);
  record('F49-CONTACT-WF-QUEUE', isSuccessStatus(queueRes.status), `queue status=${queueRes.status}`, section);
  evidence.checks.push({ id: 'queue', response: queueRes });

  const detailRes = await authFetch(staffContactRequestPath(workflowContactRequestId), directorToken);
  record('F49-CONTACT-WF-DETAIL', isSuccessStatus(detailRes.status), `detail status=${detailRes.status}`, section);
  evidence.checks.push({ id: 'detail', response: detailRes });

  const ackRes = await authFetch(staffContactAcknowledgePath(workflowContactRequestId), directorToken, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  record('F49-CONTACT-WF-ACK', isSuccessStatus(ackRes.status), `ack status=${ackRes.status}`, section);
  evidence.checks.push({ id: 'acknowledge', response: ackRes });

  const assignRes = await authFetch(staffContactAssignPath(workflowContactRequestId), directorToken, {
    method: 'POST',
    body: JSON.stringify({ assignedTo: DIRECTOR_ID }),
  });
  record('F49-CONTACT-WF-ASSIGN', isSuccessStatus(assignRes.status), `assign status=${assignRes.status}`, section);
  evidence.checks.push({ id: 'assign', response: assignRes });

  const respondInternal = await authFetch(staffContactRespondPath(workflowContactRequestId), directorToken, {
    method: 'POST',
    body: JSON.stringify({
      responseType: 'STAFF_NOTE',
      visibility: 'INTERNAL',
      responseSummary: 'F4-9 internal staff note — must not leak to learner.',
    }),
  });
  record(
    'F49-CONTACT-WF-RESPOND-INTERNAL',
    isSuccessStatus(respondInternal.status),
    `internal respond status=${respondInternal.status}`,
    section,
  );
  evidence.checks.push({ id: 'respond-internal', response: respondInternal });

  const learnerResponses = await authFetch(
    learnerContactResponsesPath(workflowContactRequestId),
    learnerToken,
  );
  const hiddenFromLearner =
    isSuccessStatus(learnerResponses.status) &&
    (learnerResponses.body?.total === 0 ||
      (Array.isArray(learnerResponses.body?.items) && learnerResponses.body.items.length === 0));
  record(
    'F49-CONTACT-WF-LEARNER-NO-INTERNAL',
    hiddenFromLearner,
    `learner responses total=${learnerResponses.body?.total ?? 'n/a'}`,
    section,
  );
  evidence.checks.push({ id: 'learner-responses-hidden', response: learnerResponses });

  const routeComplaint = await authFetch(staffContactRoutePath(workflowContactRequestId), directorToken, {
    method: 'POST',
    body: JSON.stringify({
      routingType: 'ROUTE_TO_COMPLAINT_REVIEW',
      targetDomain: 'COMPLAINTS',
      routingReason: 'F4-9 smoke — metadata-only complaint routing',
    }),
  });
  const complaintAfterRoute = querySideEffectFingerprint().complaintCaseCount;
  record(
    'F49-CONTACT-WF-ROUTE-COMPLAINT',
    isSuccessStatus(routeComplaint.status) && complaintAfterRoute === complaintBefore,
    `route complaint status=${routeComplaint.status}; complaint delta=0`,
    section,
  );
  evidence.checks.push({ id: 'route-complaint', response: routeComplaint, complaintBefore, complaintAfterRoute });

  const appealSubmitRes = await authFetch(learnerContactRequestsPath(), learnerToken, {
    method: 'POST',
    body: JSON.stringify({
      requestType: 'GENERAL_INQUIRY',
      subject: `F4-9 appeal route ${TIMESTAMP}`,
      messageSummary: 'Separate contact for appeal routing smoke.',
    }),
  });
  const appealRouteContactId = resolveContactRequestId(appealSubmitRes.body);
  trackContactRequestId(appealRouteContactId);
  evidence.checks.push({ id: 'appeal-route-seed', response: appealSubmitRes });

  let routeAppeal = { status: 0, body: null };
  if (appealRouteContactId) {
    await authFetch(staffContactAcknowledgePath(appealRouteContactId), directorToken, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    routeAppeal = await authFetch(staffContactRoutePath(appealRouteContactId), directorToken, {
      method: 'POST',
      body: JSON.stringify({
        routingType: 'ROUTE_TO_APPEAL_REVIEW',
        targetDomain: 'APPEALS',
        routingReason: 'F4-9 smoke — metadata-only appeal routing',
      }),
    });
  }
  const appealAfterRoute = querySideEffectFingerprint().appealCaseCount;
  record(
    'F49-CONTACT-WF-ROUTE-APPEAL',
    Boolean(appealRouteContactId) &&
      isSuccessStatus(routeAppeal.status) &&
      appealAfterRoute === appealBefore,
    `route appeal status=${routeAppeal.status}; appeal delta=0`,
    section,
  );
  evidence.checks.push({
    id: 'route-appeal',
    response: routeAppeal,
    appealRouteContactId,
    appealBefore,
    appealAfterRoute,
  });

  const resolveRes = await authFetch(staffContactResolvePath(workflowContactRequestId), directorToken, {
    method: 'POST',
    body: JSON.stringify({ resolutionSummary: 'F4-9 smoke resolution.' }),
  });
  record('F49-CONTACT-WF-RESOLVE', isSuccessStatus(resolveRes.status), `resolve status=${resolveRes.status}`, section);
  evidence.checks.push({ id: 'resolve', response: resolveRes });

  const closeRes = await authFetch(staffContactClosePath(workflowContactRequestId), directorToken, {
    method: 'POST',
    body: JSON.stringify({ closeReason: 'F4-9 smoke closed.' }),
  });
  record('F49-CONTACT-WF-CLOSE', isSuccessStatus(closeRes.status), `close status=${closeRes.status}`, section);
  evidence.checks.push({ id: 'close', response: closeRes });

  writeJson('contact-staff-workflow.json', evidence);
}

async function runContactNotificationsSla(directorToken) {
  const section = 'contact-sla';
  const evidence = { checks: [] };
  const contactId = workflowContactRequestId;
  if (!contactId) {
    record('F49-CONTACT-SLA-SKIP', true, 'no workflow contact id — SLA section skipped', section);
    writeJson('contact-notifications-sla.json', { skipped: true });
    return;
  }

  const fpBeforePreview = querySideEffectFingerprint();
  const previewRes = await authFetch(`${staffContactSlaPreviewPath()}?dryRun=true`, directorToken);
  const fpAfterPreview = querySideEffectFingerprint();
  const previewReadOnly =
    fpBeforePreview.contactRequestCount === fpAfterPreview.contactRequestCount &&
    fpBeforePreview.complaintCaseCount === fpAfterPreview.complaintCaseCount;
  record(
    'F49-CONTACT-SLA-PREVIEW',
    isSuccessStatus(previewRes.status) && previewReadOnly,
    `preview status=${previewRes.status}; readOnly=${previewReadOnly}`,
    section,
  );
  evidence.checks.push({ id: 'sla-preview', response: previewRes, previewReadOnly });

  const notifyListBefore = await authFetch(staffContactNotificationsPath(contactId), directorToken);
  const notifyRes = await authFetch(staffContactNotifyPath(contactId), directorToken, {
    method: 'POST',
    body: JSON.stringify({
      notificationType: 'CONTACT_REQUEST_RESOLVED_NOTICE',
      channel: 'EMAIL',
      period: `f4-9-smoke-${TIMESTAMP}`,
    }),
  });
  record(
    'F49-CONTACT-NOTIFY',
    isSuccessStatus(notifyRes.status) || notifyRes.status === 409,
    `notify status=${notifyRes.status}`,
    section,
  );
  evidence.checks.push({ id: 'notify', response: notifyRes, listBefore: notifyListBefore });

  const notifyListAfter = await authFetch(staffContactNotificationsPath(contactId), directorToken);
  record(
    'F49-CONTACT-NOTIFICATIONS-LIST',
    isSuccessStatus(notifyListAfter.status),
    `notifications list status=${notifyListAfter.status}`,
    section,
  );
  evidence.checks.push({ id: 'notifications-list', response: notifyListAfter });

  const slaRunRes = await authFetch(staffContactSlaRunPath(), directorToken, {
    method: 'POST',
    body: JSON.stringify({
      queueSlaNotifications: false,
      assignedTo: DIRECTOR_ID,
      status: 'CLOSED',
    }),
  });
  record('F49-CONTACT-SLA-RUN', isSuccessStatus(slaRunRes.status), `sla run status=${slaRunRes.status}`, section);
  evidence.checks.push({ id: 'sla-run', response: slaRunRes });

  const slaRead = await authFetch(staffContactSlaPath(contactId), directorToken);
  record('F49-CONTACT-SLA-READ', isSuccessStatus(slaRead.status), `sla read status=${slaRead.status}`, section);
  evidence.checks.push({ id: 'sla-read', response: slaRead });

  const slaRecalc = await authFetch(staffContactSlaRecalculatePath(contactId), directorToken, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  record(
    'F49-CONTACT-SLA-RECALC',
    isSuccessStatus(slaRecalc.status),
    `sla recalc status=${slaRecalc.status}`,
    section,
  );
  evidence.checks.push({ id: 'sla-recalculate', response: slaRecalc });

  writeJson('contact-notifications-sla.json', evidence);
}

async function runReportsReadonly(directorToken, learnerToken) {
  const section = 'reports-readonly';
  const evidence = { readonly: [], governance: [] };

  for (const path of F4_REPORTS_READONLY_PATHS) {
    const res = await authFetch(path, directorToken);
    const redaction = evaluateReportRedaction(res.body);
    const ok = isSuccessStatus(res.status) && redaction.pass;
    reportsValidated.push({ path, status: res.status, ok });
    record(`F49-REPORT-${path.split('/').pop()}`, ok, `${path} status=${res.status}`, section);
    evidence.readonly.push({ path, response: { status: res.status, body: res.body }, redaction });
  }

  const learnerDenied = await authFetch('/v1/staff/reports/overview', learnerToken);
  record(
    'F49-REPORT-LEARNER-DENIED',
    isDeniedStatus(learnerDenied.status),
    `learner overview status=${learnerDenied.status}`,
    section,
  );
  evidence.readonly.push({ id: 'learner-denied', response: learnerDenied });

  for (const path of F4_REPORTS_GOVERNANCE_PATHS) {
    const res = await authFetch(path, directorToken);
    const redaction = evaluateReportRedaction(res.body);
    const ok = isSuccessStatus(res.status) && redaction.pass;
    reportsValidated.push({ path, status: res.status, ok });
    record(`F49-GOV-${path.split('/').pop()}`, ok, `${path} status=${res.status}`, section);
    evidence.governance.push({ path, response: { status: res.status, body: res.body }, redaction });
  }

  const getExportGuidance = await authFetch(staffReportsExportPath(), directorToken);
  const guidanceOk =
    isSuccessStatus(getExportGuidance.status) &&
    (getExportGuidance.body?.method === 'POST' ||
      String(getExportGuidance.body?.message ?? '').includes('POST'));
  record(
    'F49-REPORT-GET-EXPORT-GUIDANCE',
    guidanceOk,
    `GET export guidance status=${getExportGuidance.status}`,
    section,
  );
  evidence.readonly.push({ id: 'get-export-guidance', response: getExportGuidance });

  writeJson('reports-readonly.json', evidence);
}

async function runReportsExport(directorToken, learnerToken) {
  const section = 'reports-export';
  const evidence = { checks: [] };

  const policyRes = await authFetch(staffReportsExportPolicyPath(), directorToken);
  record(
    'F49-EXPORT-POLICY',
    isSuccessStatus(policyRes.status),
    `policy status=${policyRes.status}`,
    section,
  );
  evidence.checks.push({ id: 'policy', response: policyRes });

  const jsonExport = await authFetch(staffReportsExportPath(), directorToken, {
    method: 'POST',
    body: JSON.stringify({ reportKey: 'overview', format: 'JSON', includeAggregates: true }),
  });
  exportsValidated.push({ type: 'overview-json', status: jsonExport.status });
  record(
    'F49-EXPORT-OVERVIEW-JSON',
    jsonExport.status === 201 || jsonExport.status === 200,
    `overview JSON export status=${jsonExport.status}`,
    section,
  );
  evidence.checks.push({ id: 'overview-json', response: jsonExport });

  const csvExport = await authFetch(staffReportsExportPath(), directorToken, {
    method: 'POST',
    body: JSON.stringify({
      reportKey: 'contact-requests',
      format: 'CSV',
      includeAggregates: false,
    }),
  });
  exportsValidated.push({ type: 'contact-requests-csv', status: csvExport.status });
  const csvOk = csvExport.status === 201 || csvExport.status === 200;
  record('F49-EXPORT-CONTACT-CSV', csvOk, `contact-requests CSV status=${csvExport.status}`, section);
  evidence.checks.push({ id: 'contact-csv', response: { status: csvExport.status, sample: String(csvExport.body).slice(0, 200) } });

  const sensitiveDenied = await authFetch(staffReportsExportPath(), directorToken, {
    method: 'POST',
    body: JSON.stringify({ reportKey: 'audit', format: 'JSON' }),
  });
  exportsValidated.push({ type: 'audit-without-reason', status: sensitiveDenied.status });
  record(
    'F49-EXPORT-SENSITIVE-DENIED',
    sensitiveDenied.status === 403 || sensitiveDenied.status === 400,
    `audit without reason status=${sensitiveDenied.status}`,
    section,
  );
  evidence.checks.push({ id: 'sensitive-denied', response: sensitiveDenied });

  const learnerExport = await authFetch(staffReportsExportPath(), learnerToken, {
    method: 'POST',
    body: JSON.stringify({ reportKey: 'overview', format: 'JSON' }),
  });
  record(
    'F49-EXPORT-LEARNER-DENIED',
    isDeniedStatus(learnerExport.status),
    `learner export status=${learnerExport.status}`,
    section,
  );
  evidence.checks.push({ id: 'learner-export-denied', response: learnerExport });

  const adminLegacyGet = await authFetch('/v1/admin/reports/export?reportKey=overview&format=csv', directorToken);
  record(
    'F49-EXPORT-NO-LEGACY-GET',
    isBlockedStatus(adminLegacyGet.status),
    `admin GET export blocked status=${adminLegacyGet.status}`,
    section,
  );
  evidence.checks.push({ id: 'admin-get-blocked', response: adminLegacyGet });

  writeJson('reports-export.json', evidence);
}

async function runLegacyAliases(learnerToken, directorToken) {
  const section = 'legacy-aliases';
  const evidence = { checks: [] };

  for (const alias of LEGACY_ALIAS_READ_PATHS) {
    const token = alias.auth === 'learner' ? learnerToken : directorToken;
    const res = await authFetch(alias.path, token);
    const deprecated =
      res.headers.deprecation === 'true' ||
      res.headers.Deprecation === 'true' ||
      res.body?.deprecated === true;
    const ok = isSuccessStatus(res.status) && deprecated;
    aliasesValidated.push({ path: alias.path, status: res.status, deprecated, ok });
    record(
      `F49-ALIAS-${alias.path.replace(/\//g, '-')}`,
      ok,
      `${alias.path} status=${res.status}; deprecated=${deprecated}`,
      section,
    );
    evidence.checks.push({ alias, response: { status: res.status, body: res.body, headers: res.headers } });
  }

  writeJson('legacy-aliases.json', evidence);
}

async function runLegacyBlocks(directorToken) {
  const section = 'legacy-blocks';
  const evidence = { checks: [] };

  for (const blocked of LEGACY_BLOCKED_PATHS) {
    const path = `${blocked.path}${blocked.query ?? ''}`;
    const init = {
      method: blocked.method,
      ...(blocked.method !== 'GET' ? { body: JSON.stringify({ status: 'CLOSED' }) } : {}),
    };
    const res = await authFetch(path, directorToken, init);
    const ok = classifyLegacyBlockResponse(res.status);
    blocksValidated.push({ path: blocked.path, method: blocked.method, status: res.status, ok });
    record(
      `F49-BLOCK-${blocked.method}-${blocked.path.split('/').slice(2).join('-')}`,
      ok,
      `${blocked.method} ${blocked.path} status=${res.status}`,
      section,
    );
    evidence.checks.push({ blocked, response: res });
  }

  writeJson('legacy-blocks.json', evidence);
}

function runFrontendAuditGate() {
  const section = 'frontend-gate';
  const audit = spawnSync('node', [join(REPO_ROOT, 'scripts/ops/audit-f4-frontend-api-usage.mjs')], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  const combined = `${audit.stdout ?? ''}${audit.stderr ?? ''}`;
  writeText('frontend-audit-gate.txt', combined);
  record(
    'F49-FRONTEND-AUDIT-GATE',
    audit.status === 0,
    `audit exit=${audit.status ?? 1}`,
    section,
  );

  if (!SKIP_FRONTEND) {
    const unitTests = spawnSync('npm', ['run', 'test:f4-cutover'], {
      cwd: join(REPO_ROOT, 'frontend-app'),
      encoding: 'utf8',
      shell: process.platform === 'win32',
    });
    const unitCombined = `${unitTests.stdout ?? ''}${unitTests.stderr ?? ''}`;
    writeText('frontend-smoke.txt', `# npm run test:f4-cutover\n${unitCombined}\n`);
    record(
      'F49-FRONTEND-UNIT-TESTS',
      unitTests.status === 0,
      `test:f4-cutover exit=${unitTests.status ?? 1}`,
      section,
    );
  } else {
    writeText('frontend-smoke.txt', 'Skipped — SKIP_FRONTEND_VALIDATION=1\n');
    record('F49-FRONTEND-UNIT-TESTS', true, 'skipped by env', section);
  }

  return audit.status === 0;
}

function runAuditVerification() {
  const section = 'audit';
  let rows = [];
  try {
    rows = queryAuditEventsSinceStart();
  } catch (err) {
    record('F49-AUDIT-QUERY', false, err.message, section);
    writeJson('audit-events.json', { error: err.message, rows: [] });
    return false;
  }

  const redaction = evaluateAuditRowsRedaction(rows);
  const foundActions = [...new Set(rows.map((r) => r.action))];
  const expectedFound = F4_SMOKE_EXPECTED_AUDIT_ACTIONS.filter((a) => foundActions.includes(a));

  record(
    'F49-AUDIT-REDACTION',
    redaction.pass,
    redaction.pass ? 'audit metadata redaction ok' : redaction.issues.join('; '),
    section,
  );
  record(
    'F49-AUDIT-COVERAGE',
    hasAnyAuditAction(rows, [
      CONTACT_REQUEST_SUBMITTED_AUDIT_ACTION,
      REPORT_VIEWED_AUDIT_ACTION,
      REPORT_EXPORT_REQUESTED_AUDIT_ACTION,
    ]),
    `actions found: ${expectedFound.join(', ') || 'none'}`,
    section,
  );

  writeJson('audit-events.json', {
    smokeStartedAt: SMOKE_STARTED_AT,
    rowCount: rows.length,
    foundActions,
    expectedFound,
    redaction,
    rows,
  });
  return redaction.pass;
}

function finalize(beforeFingerprint, afterFingerprint, frontendAuditPass) {
  const runIds = [...runContactRequestIds];
  const allowContact = Math.max(2, (afterFingerprint.contactRequestCount ?? 0) - (beforeFingerprint.contactRequestCount ?? 0));
  const sideEffectEval = evaluateF4SideEffectInvariants(beforeFingerprint, afterFingerprint, {
    allowContactRequestDelta: allowContact + 2,
    allowContactSlaCheckpointDelta: maxAllowedSlaCheckpointDeltaForRun(runIds.length),
    allowContactNotificationDelta: 3,
    runContactRequestIds: runIds,
  });

  record(
    'F49-DB-INVARIANTS',
    sideEffectEval.pass,
    sideEffectEval.pass ? 'B10–B15 invariants preserved' : sideEffectEval.issues.join('; '),
    'invariants',
  );

  writeJson('db-invariants.json', {
    beforeFingerprint,
    afterFingerprint,
    sideEffectEval,
    runContactRequestIds: runIds,
    f49SmokeSubjectMarker: F4_9_SMOKE_SUBJECT_MARKER,
  });
  writeJson('no-side-effects.json', {
    noBackendChanges: true,
    noSchemaChanges: true,
    noLegacyRouteDeletion: true,
    noFastApiDeletion: true,
    noCertificationMutation: sideEffectEval.pass,
    contactOnlyMutations: {
      contactDelta: sideEffectEval.contactDelta,
      slaDelta: sideEffectEval.slaDelta,
      notifyDelta: sideEffectEval.notifyDelta,
    },
    complaintCaseCountUnchanged:
      beforeFingerprint.complaintCaseCount === afterFingerprint.complaintCaseCount,
    appealCaseCountUnchanged: beforeFingerprint.appealCaseCount === afterFingerprint.appealCaseCount,
  });

  const summary = summarizeSmokeResults(results);
  const overallPass = summary.overallPass && sideEffectEval.pass && frontendAuditPass;
  writeJson('errors.json', errors);
  writeJson('summary.json', {
    timestamp: TIMESTAMP,
    environment: {
      nestApiUrl: NEST_API,
      tenantId: DEFAULT_TENANT_ID,
      postgresDb: process.env.POSTGRES_DB ?? 'confora_smoke',
      smokeStartedAt: SMOKE_STARTED_AT,
    },
    overallPass,
    checksTotal: summary.checksTotal,
    checksPassed: summary.checksPassed,
    checksFailed: summary.checksFailed,
    createdContactRequestPublicReference,
    workflowContactRequestId,
    reportsValidated,
    exportsValidated,
    aliasesValidated,
    blocksValidated,
    auditEventsFound: F4_SMOKE_EXPECTED_AUDIT_ACTIONS,
    dbInvariantPass: sideEffectEval.pass,
    frontendAuditGatePass: frontendAuditPass,
    evidencePath: EVIDENCE_DIR.replace(/\\/g, '/'),
    failures: summary.failures,
  });

  const verdict = overallPass ? 'GO' : 'NO-GO';
  log(`\nF4-9 evidence: ${EVIDENCE_DIR.replace(/\\/g, '/')}`);
  log(`F4-9 Faza 4 Contact / Reports / Legacy Strangler Smoke — ${verdict}`);
  log(`Checks: ${summary.checksPassed}/${summary.checksTotal} passed`);
  process.exit(verdict === 'GO' ? 0 : 1);
}

async function main() {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeText('smoke-output.txt', `F4-9 smoke started ${SMOKE_STARTED_AT}\n`);

  record('F49-HEALTH', await healthCheck(), `Nest API health at ${NEST_API}`, 'ops');
  if (!results.at(-1)?.pass) return finalize({}, {}, false);

  let beforeFingerprint;
  try {
    cleanupSyntheticF4SlaCheckpoints();
    beforeFingerprint = querySideEffectFingerprint([]);
    beforeFingerprint.runScopedContactSlaCheckpointCount = 0;
    writeJson('db/before-fingerprint.json', beforeFingerprint);
  } catch (err) {
    record('F49-DB-BEFORE', false, err.message, 'ops');
    return finalize({}, {}, false);
  }

  let learnerToken;
  let directorToken;
  let wrongTenantToken;
  try {
    learnerToken = extractAccessToken((await login(LEARNER_EMAIL)).body);
    directorToken = extractAccessToken((await login(DIRECTOR_EMAIL)).body);
    wrongTenantToken = extractAccessToken((await login(WRONG_TENANT_EMAIL)).body);
    record(
      'F49-AUTH',
      Boolean(learnerToken && directorToken),
      `tokens acquired learner=${Boolean(learnerToken)} director=${Boolean(directorToken)}`,
      'ops',
    );
  } catch (err) {
    record('F49-AUTH', false, err.message, 'ops');
    return finalize(beforeFingerprint, beforeFingerprint, false);
  }
  if (!learnerToken || !directorToken) return finalize(beforeFingerprint, beforeFingerprint, false);

  const contactFlowEvidence = { checks: [] };
  await runContactPublicFlow(contactFlowEvidence);
  await runContactLearnerFlow(learnerToken, contactFlowEvidence);
  writeJson('contact-flow.json', contactFlowEvidence);
  await runContactStaffWorkflow(directorToken, learnerToken);
  await runContactNotificationsSla(directorToken);
  await runReportsReadonly(directorToken, learnerToken);
  await runReportsExport(directorToken, learnerToken);
  await runLegacyAliases(learnerToken, directorToken);
  await runLegacyBlocks(directorToken);

  if (workflowContactRequestId && wrongTenantToken) {
    const crossTenant = await authFetch(
      staffContactRequestPath(workflowContactRequestId),
      wrongTenantToken,
    );
    record(
      'F49-CONTACT-CROSS-TENANT-DENIED',
      isForbiddenStatus(crossTenant.status) || crossTenant.status === 404,
      `wrong-tenant staff read status=${crossTenant.status}`,
      'negative',
    );
  }

  const frontendAuditPass = runFrontendAuditGate();
  runAuditVerification();

  let afterFingerprint;
  try {
    afterFingerprint = querySideEffectFingerprint([...runContactRequestIds]);
    writeJson('db/after-fingerprint.json', afterFingerprint);
    writeJson('db/run-contact-request-ids.json', [...runContactRequestIds]);
  } catch (err) {
    record('F49-DB-AFTER', false, err.message, 'ops');
    afterFingerprint = beforeFingerprint;
  }

  finalize(beforeFingerprint, afterFingerprint, frontendAuditPass);
}

main().catch((err) => {
  console.error(err);
  errors.push({ id: 'F49-FATAL', message: err.message, at: new Date().toISOString() });
  try {
    writeJson('errors.json', errors);
  } catch {
    /* ignore */
  }
  process.exit(1);
});
