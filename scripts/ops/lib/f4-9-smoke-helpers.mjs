/**
 * F4-9 Faza 4 smoke — pure helpers (unit-tested).
 */

export { DEFAULT_TENANT_ID } from '../b3-3d-draft-write-smoke.helpers.mjs';

// Contact audit actions
export const CONTACT_REQUEST_SUBMITTED_AUDIT_ACTION = 'CONTACT_REQUEST_SUBMITTED';
export const CONTACT_REQUEST_ACKNOWLEDGED_AUDIT_ACTION = 'CONTACT_REQUEST_ACKNOWLEDGED';
export const CONTACT_REQUEST_ASSIGNED_AUDIT_ACTION = 'CONTACT_REQUEST_ASSIGNED';
export const CONTACT_REQUEST_RESPONDED_AUDIT_ACTION = 'CONTACT_REQUEST_RESPONDED';
export const CONTACT_REQUEST_ROUTED_TO_COMPLAINT_REVIEW_AUDIT_ACTION =
  'CONTACT_REQUEST_ROUTED_TO_COMPLAINT_REVIEW';
export const CONTACT_REQUEST_ROUTED_TO_APPEAL_REVIEW_AUDIT_ACTION =
  'CONTACT_REQUEST_ROUTED_TO_APPEAL_REVIEW';
export const CONTACT_REQUEST_RESOLVED_AUDIT_ACTION = 'CONTACT_REQUEST_RESOLVED';
export const CONTACT_REQUEST_CLOSED_AUDIT_ACTION = 'CONTACT_REQUEST_CLOSED';
export const CONTACT_NOTIFICATION_QUEUED_AUDIT_ACTION = 'CONTACT_NOTIFICATION_QUEUED';
export const CONTACT_SLA_PREVIEWED_AUDIT_ACTION = 'CONTACT_SLA_PREVIEWED';
export const CONTACT_SLA_CHECKPOINT_CREATED_AUDIT_ACTION = 'CONTACT_SLA_CHECKPOINT_CREATED';
export const CONTACT_ACTION_DENIED_AUDIT_ACTION = 'CONTACT_ACTION_DENIED';

// Reports audit actions
export const REPORT_VIEWED_AUDIT_ACTION = 'REPORT_VIEWED';
export const REPORT_FILTERED_VIEWED_AUDIT_ACTION = 'REPORT_FILTERED_VIEWED';
export const REPORT_ACCESS_DENIED_AUDIT_ACTION = 'REPORT_ACCESS_DENIED';
export const REPORT_CATALOG_VIEWED_AUDIT_ACTION = 'REPORT_CATALOG_VIEWED';
export const REPORT_EXPORT_REQUESTED_AUDIT_ACTION = 'REPORT_EXPORT_REQUESTED';
export const REPORT_EXPORTED_AUDIT_ACTION = 'REPORT_EXPORTED';
export const REPORT_EXPORT_DENIED_AUDIT_ACTION = 'REPORT_EXPORT_DENIED';

// Legacy compat audit actions
export const LEGACY_ROUTE_ALIAS_USED_ACTION = 'LEGACY_ROUTE_ALIAS_USED';
export const LEGACY_ROUTE_BLOCKED_ACTION = 'LEGACY_ROUTE_BLOCKED';

export const F4_SMOKE_EXPECTED_AUDIT_ACTIONS = [
  CONTACT_REQUEST_SUBMITTED_AUDIT_ACTION,
  CONTACT_REQUEST_ACKNOWLEDGED_AUDIT_ACTION,
  CONTACT_REQUEST_ASSIGNED_AUDIT_ACTION,
  CONTACT_REQUEST_RESPONDED_AUDIT_ACTION,
  CONTACT_REQUEST_ROUTED_TO_COMPLAINT_REVIEW_AUDIT_ACTION,
  CONTACT_NOTIFICATION_QUEUED_AUDIT_ACTION,
  CONTACT_SLA_PREVIEWED_AUDIT_ACTION,
  REPORT_VIEWED_AUDIT_ACTION,
  REPORT_CATALOG_VIEWED_AUDIT_ACTION,
  REPORT_EXPORT_REQUESTED_AUDIT_ACTION,
  REPORT_EXPORTED_AUDIT_ACTION,
  REPORT_EXPORT_DENIED_AUDIT_ACTION,
  LEGACY_ROUTE_ALIAS_USED_ACTION,
  LEGACY_ROUTE_BLOCKED_ACTION,
];

export const FORBIDDEN_PUBLIC_CONTACT_RESPONSE_PATTERN =
  /"tenantId"|"tenant_id"|"requesterUserId"|"messageSummary"|"internalNotes"|"assignedToId"|"voidedBy"|"acknowledgedBy"|"relatedComplaintCaseId"|"relatedAppealCaseId"/i;

export const FORBIDDEN_REPORT_RESPONSE_PATTERN =
  /"requesterContact"|"complainantContact"|"email"\s*:\s*"[^"]+@[^"]+"/i;

export const FORBIDDEN_AUDIT_EXPORT_PAYLOAD_PATTERN =
  /"rows"\s*:|"data"\s*:|"filters"\s*:|"filtersApplied"|"filtersHash"\s*:\s*"\{|"body"\s*:|"content"\s*:|"csvContent"|"messageSummary"|"complaintSummary"|"requesterContact"|"complainantContact"/i;

const REPORT_EXPORT_AUDIT_ACTIONS = new Set([
  REPORT_EXPORT_REQUESTED_AUDIT_ACTION,
  REPORT_EXPORTED_AUDIT_ACTION,
  REPORT_EXPORT_DENIED_AUDIT_ACTION,
  'REPORT_EXPORT_FAILED',
]);

export const FORBIDDEN_F4_FASTAPI_PRODUCTION_PATTERNS = [
  /^\/api\/complaints(\/|$)/,
  /^\/api\/admin\/complaints(\/|$)/,
  /^\/api\/appeals(\/|$)/,
  /^\/api\/admin\/appeals(\/|$)/,
  /^\/api\/reports(\/|$)/,
  /^\/v1\/admin\/reports\/export(\/|$)/,
  /^\/v1\/admin\/reports\/builder(\/|$)/,
];

export const F4_REPORTS_READONLY_PATHS = [
  '/v1/staff/reports/catalog',
  '/v1/staff/reports/available',
  '/v1/staff/reports/overview',
  '/v1/staff/reports/certification-pipeline',
  '/v1/staff/reports/certificates',
  '/v1/staff/reports/lifecycle',
  '/v1/staff/reports/recertification',
  '/v1/staff/reports/appeals',
  '/v1/staff/reports/complaints',
  '/v1/staff/reports/contact-requests',
];

export const F4_REPORTS_GOVERNANCE_PATHS = [
  '/v1/staff/reports/governance',
  '/v1/staff/reports/sla',
  '/v1/staff/reports/audit',
  '/v1/staff/reports/controls',
  '/v1/staff/reports/workload',
  '/v1/staff/reports/tenant-health',
  '/v1/staff/reports/domain-health',
];

export const LEGACY_ALIAS_READ_PATHS = [
  { path: '/v1/me/complaints', auth: 'learner', canonical: '/v1/learner/complaints' },
  { path: '/v1/admin/complaints', auth: 'staff', canonical: '/v1/staff/complaints' },
  { path: '/v1/me/appeals', auth: 'learner', canonical: '/v1/learner/appeals' },
  { path: '/v1/admin/appeals/board', auth: 'staff', canonical: '/v1/staff/appeals' },
  { path: '/v1/admin/reports/catalog', auth: 'staff', canonical: '/v1/staff/reports/catalog' },
];

export const LEGACY_BLOCKED_PATHS = [
  { method: 'GET', path: '/v1/admin/reports/export', query: '?reportKey=overview&format=csv' },
  { method: 'PATCH', path: '/v1/admin/complaints/00000000-0000-4000-8000-000000000099' },
  { method: 'PATCH', path: '/v1/admin/appeals/00000000-0000-4000-8000-000000000099' },
  { method: 'POST', path: '/v1/admin/reports/builder/run' },
];

/** Subject prefix for F4-9 synthetic contact smoke rows (ops-only; not production data). */
export const F4_9_SMOKE_SUBJECT_MARKER = 'F4-9';

/**
 * Max SLA checkpoints expected per synthetic contact request in one F4-9 run
 * (workflow transitions + scoped sla/recalculate). Keeps invariant meaningful without global drift.
 */
export const F4_9_MAX_SLA_CHECKPOINTS_PER_CONTACT = 6;

/**
 * @param {number} contactCount
 */
export function maxAllowedSlaCheckpointDeltaForRun(contactCount) {
  if (contactCount <= 0) return 0;
  return contactCount * F4_9_MAX_SLA_CHECKPOINTS_PER_CONTACT;
}

/**
 * SQL to remove SLA checkpoints for prior F4-9 synthetic contact requests only.
 * @param {string} tenantId
 */
export function buildCleanupSyntheticF4SlaCheckpointsSql(tenantId) {
  const tenant = tenantId.replace(/'/g, "''");
  return `DELETE FROM gov.contact_sla_checkpoints c
USING gov.contact_requests r
WHERE c.contact_request_id = r.id
  AND c.tenant_id = '${tenant}'
  AND r.tenant_id = '${tenant}'
  AND r.subject LIKE '${F4_9_SMOKE_SUBJECT_MARKER}%';`;
}

/**
 * @param {string} tenantId
 * @param {readonly string[]} contactRequestIds
 */
export function buildRunScopedSlaCheckpointCountSql(tenantId, contactRequestIds) {
  if (!contactRequestIds?.length) return `SELECT 0;`;
  const tenant = tenantId.replace(/'/g, "''");
  const ids = contactRequestIds
    .map((id) => `'${String(id).replace(/'/g, "''")}'`)
    .join(', ');
  return `SELECT COUNT(*) FROM gov.contact_sla_checkpoints
WHERE tenant_id = '${tenant}'
  AND contact_request_id IN (${ids});`;
}

// --- Path builders ---

export function publicContactRequestsPath() {
  return '/v1/public/contact-requests';
}

/** @param {string} publicReference */
export function publicContactStatusPath(publicReference) {
  return `${publicContactRequestsPath()}/${encodeURIComponent(publicReference)}`;
}

export function legacyPublicContactPath() {
  return '/v1/public/contact';
}

export function learnerContactRequestsPath() {
  return '/v1/learner/contact-requests';
}

/** @param {string} contactRequestId */
export function learnerContactRequestPath(contactRequestId) {
  return `${learnerContactRequestsPath()}/${encodeURIComponent(contactRequestId)}`;
}

/** @param {string} contactRequestId */
export function learnerContactResponsesPath(contactRequestId) {
  return `${learnerContactRequestPath(contactRequestId)}/responses`;
}

export function staffContactRequestsPath() {
  return '/v1/staff/contact-requests';
}

export function staffContactQueuePath() {
  return '/v1/staff/contact-requests/queue';
}

/** @param {string} contactRequestId */
export function staffContactRequestPath(contactRequestId) {
  return `${staffContactRequestsPath()}/${encodeURIComponent(contactRequestId)}`;
}

/** @param {string} contactRequestId */
export function staffContactAcknowledgePath(contactRequestId) {
  return `${staffContactRequestPath(contactRequestId)}/acknowledge`;
}

/** @param {string} contactRequestId */
export function staffContactAssignPath(contactRequestId) {
  return `${staffContactRequestPath(contactRequestId)}/assign`;
}

/** @param {string} contactRequestId */
export function staffContactRespondPath(contactRequestId) {
  return `${staffContactRequestPath(contactRequestId)}/respond`;
}

/** @param {string} contactRequestId */
export function staffContactRoutePath(contactRequestId) {
  return `${staffContactRequestPath(contactRequestId)}/route`;
}

/** @param {string} contactRequestId */
export function staffContactResolvePath(contactRequestId) {
  return `${staffContactRequestPath(contactRequestId)}/resolve`;
}

/** @param {string} contactRequestId */
export function staffContactClosePath(contactRequestId) {
  return `${staffContactRequestPath(contactRequestId)}/close`;
}

/** @param {string} contactRequestId */
export function staffContactNotificationsPath(contactRequestId) {
  return `${staffContactRequestPath(contactRequestId)}/notifications`;
}

/** @param {string} contactRequestId */
export function staffContactNotifyPath(contactRequestId) {
  return `${staffContactRequestPath(contactRequestId)}/notify`;
}

export function staffContactSlaPreviewPath() {
  return '/v1/staff/contact-requests/sla/preview';
}

export function staffContactSlaRunPath() {
  return '/v1/staff/contact-requests/sla/run';
}

/** @param {string} contactRequestId */
export function staffContactSlaPath(contactRequestId) {
  return `${staffContactRequestPath(contactRequestId)}/sla`;
}

/** @param {string} contactRequestId */
export function staffContactSlaRecalculatePath(contactRequestId) {
  return `${staffContactRequestPath(contactRequestId)}/sla/recalculate`;
}

export function staffReportsExportPolicyPath() {
  return '/v1/staff/reports/export/policy';
}

export function staffReportsExportPath() {
  return '/v1/staff/reports/export';
}

// --- HTTP / status helpers ---

/** @param {number} status */
export function isSuccessStatus(status) {
  return status >= 200 && status < 300;
}

/** @param {number} status */
export function isForbiddenStatus(status) {
  return status === 403;
}

/** @param {number} status */
export function isBlockedStatus(status) {
  return status === 410;
}

/** @param {number} status */
export function isDeniedStatus(status) {
  return status === 403 || status === 401 || status === 410;
}

// --- Response parsers ---

/** @param {unknown} body */
export function resolvePublicReference(body) {
  return body?.publicReference ?? body?.contactRequest?.publicReference ?? null;
}

/** @param {unknown} body */
export function resolveContactRequestId(body) {
  return body?.contactRequest?.id ?? body?.id ?? null;
}

/** @param {unknown} body */
export function resolveContactRequestStatus(body) {
  return body?.contactRequest?.status ?? body?.status ?? null;
}

// --- Redaction / safety ---

/** @param {unknown} body */
export function evaluatePublicContactRedaction(body) {
  const issues = [];
  if (!body || typeof body !== 'object') {
    return { pass: false, issues: ['missing response body'] };
  }
  const serialized = JSON.stringify(body);
  if (FORBIDDEN_PUBLIC_CONTACT_RESPONSE_PATTERN.test(serialized)) {
    issues.push('forbidden field pattern in public contact response');
  }
  if (/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i.test(serialized)) {
    issues.push('UUID-like value in public contact response');
  }
  return { pass: issues.length === 0, issues };
}

/** @param {unknown} body */
export function evaluateReportRedaction(body) {
  const issues = [];
  const serialized = JSON.stringify(body ?? {});
  if (FORBIDDEN_REPORT_RESPONSE_PATTERN.test(serialized)) {
    issues.push('raw PII pattern in report response');
  }
  return { pass: issues.length === 0, issues };
}

/** @param {readonly { action?: string; new_value?: string; newValue?: string }[]} rows */
export function evaluateAuditRowsRedaction(rows) {
  const issues = [];
  for (const row of rows) {
    const action = row.action ?? '';
    if (!REPORT_EXPORT_AUDIT_ACTIONS.has(action)) continue;
    const payload = row.new_value ?? row.newValue ?? '';
    if (FORBIDDEN_AUDIT_EXPORT_PAYLOAD_PATTERN.test(String(payload))) {
      issues.push(`audit row ${action || '?'} contains raw export/report payload`);
    }
    if (/"denialReason"\s*:/i.test(String(payload))) {
      issues.push(`audit row ${action || '?'} contains raw export/report payload`);
    }
  }
  return { pass: issues.length === 0, issues };
}

/** @param {string} csvText */
export function evaluateCsvFormulaInjectionProtection(csvText) {
  const issues = [];
  const lines = String(csvText ?? '').split(/\r?\n/);
  for (const line of lines) {
    const cell = line.split(',')[0]?.trim() ?? '';
    if (/^[=+\-@]/.test(cell)) {
      issues.push(`CSV cell starts with formula prefix: ${cell.slice(0, 20)}`);
    }
  }
  return { pass: issues.length === 0, issues };
}

// --- Audit matching ---

/** @param {readonly { action?: string }[]} rows @param {string} action */
export function countAuditRows(rows, action) {
  return rows.filter((r) => r.action === action).length;
}

/** @param {readonly { action?: string }[]} rows @param {readonly string[]} actions */
export function hasAnyAuditAction(rows, actions) {
  const set = new Set(actions);
  return rows.some((r) => set.has(r.action));
}

// --- Legacy classification ---

/** @param {string} pathname @param {string} method */
export function isForbiddenF4FastApiProductionRoute(pathname, method = 'GET') {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (FORBIDDEN_F4_FASTAPI_PRODUCTION_PATTERNS.some((re) => re.test(p))) {
    return true;
  }
  if (p.includes('/export') && method === 'GET' && !p.includes('/export/policy')) {
    return true;
  }
  return false;
}

/** @param {number} status */
export function classifyLegacyBlockResponse(status) {
  return status === 410 || status === 403 || status === 405;
}

// --- DB invariants ---

/**
 * @param {unknown} before
 * @param {unknown} after
 * @param {{
 *   allowContactRequestDelta?: number;
 *   allowContactSlaCheckpointDelta?: number;
 *   allowContactNotificationDelta?: number;
 *   runContactRequestIds?: readonly string[];
 * }} options
 */
export function evaluateF4SideEffectInvariants(before, after, options = {}) {
  const issues = [];
  const allowContact = options.allowContactRequestDelta ?? 0;
  const allowNotify = options.allowContactNotificationDelta ?? 0;
  const runIds = options.runContactRequestIds ?? [];

  const invariantFields = [
    'certificateCount',
    'lifecycleEventCount',
    'certificationDecisionCount',
    'recertificationCaseCount',
    'appealCaseCount',
    'complaintCaseCount',
    'legacyComplaintCount',
    'legacyAppealCount',
    'publicVerificationCount',
  ];

  for (const field of invariantFields) {
    if ((before[field] ?? 0) !== (after[field] ?? 0)) {
      issues.push(`${field} changed (${before[field]} -> ${after[field]})`);
    }
  }

  const contactDelta = (after.contactRequestCount ?? 0) - (before.contactRequestCount ?? 0);
  if (contactDelta > allowContact || contactDelta < 0) {
    issues.push(`contactRequestCount delta ${contactDelta} outside allow ${allowContact}`);
  }

  let slaDelta;
  let allowSla;
  if (runIds.length > 0) {
    const scopedBefore = before.runScopedContactSlaCheckpointCount ?? 0;
    const scopedAfter = after.runScopedContactSlaCheckpointCount ?? 0;
    slaDelta = scopedAfter - scopedBefore;
    allowSla =
      options.allowContactSlaCheckpointDelta ?? maxAllowedSlaCheckpointDeltaForRun(runIds.length);
    if (slaDelta > allowSla || slaDelta < 0) {
      issues.push(
        `runScopedContactSlaCheckpointCount delta ${slaDelta} outside allow ${allowSla} (${runIds.length} run contacts)`,
      );
    }
  } else {
    allowSla = options.allowContactSlaCheckpointDelta ?? 0;
    slaDelta = (after.contactSlaCheckpointCount ?? 0) - (before.contactSlaCheckpointCount ?? 0);
    if (slaDelta > allowSla || slaDelta < 0) {
      issues.push(`contactSlaCheckpointCount delta ${slaDelta} outside allow ${allowSla}`);
    }
  }

  const notifyDelta =
    (after.contactNotificationLogCount ?? 0) - (before.contactNotificationLogCount ?? 0);
  if (notifyDelta > allowNotify || notifyDelta < 0) {
    issues.push(`contactNotificationLogCount delta ${notifyDelta} outside allow ${allowNotify}`);
  }

  return { pass: issues.length === 0, issues, contactDelta, slaDelta, notifyDelta };
}

/** @param {readonly { id: string; pass: boolean; detail: string }[]} results */
export function summarizeSmokeResults(results) {
  const checksTotal = results.length;
  const checksPassed = results.filter((r) => r.pass).length;
  const checksFailed = checksTotal - checksPassed;
  return {
    checksTotal,
    checksPassed,
    checksFailed,
    overallPass: checksFailed === 0,
    failures: results.filter((r) => !r.pass).map((r) => ({ id: r.id, detail: r.detail })),
  };
}

/** @param {string} contentDisposition */
export function parseContentDispositionFilename(contentDisposition) {
  if (!contentDisposition) return null;
  const match = /filename="([^"]+)"/i.exec(contentDisposition);
  return match?.[1] ?? null;
}
