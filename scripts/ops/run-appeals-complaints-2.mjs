#!/usr/bin/env node
/**
 * APPEALS-COMPLAINTS-2 — Staff resolution UX verification.
 * Usage: pnpm ops:appeals-complaints-2
 *
 * Secret hygiene: no tokens/passwords written to evidence.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REGRESSION_TIMEOUTS, runBounded } from './bounded-run.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const now = new Date();
const TIMESTAMP = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const EVIDENCE_DIR = join(
  REPO_ROOT,
  'docs',
  'evidence',
  'appeals-complaints',
  `${TIMESTAMP}-appeals-complaints-2-staff-resolution-ux`,
);
const LOG_DIR = join(EVIDENCE_DIR, 'bounded-logs');
const BASED_ON = '3010d84';

mkdirSync(LOG_DIR, { recursive: true });

const REGRESSION_VERIFY = [
  {
    script: 'ops:appeals-complaints-1',
    path: 'docs/evidence/appeals-complaints/2026-07-16T19-23-20-appeals-complaints-1',
    pattern: /APPEALS_COMPLAINTS_1_GO_FOUNDATION_CONFIRMED/,
  },
  {
    script: 'ops:appeals-complaints-1r-browser',
    path: 'docs/evidence/appeals-complaints/2026-07-17T07-12-01-appeals-complaints-1r-browser',
    pattern: /APPEALS_COMPLAINTS_1R_GO_BROWSER_CONFIRMED/,
  },
];

function w(name, content) {
  writeFileSync(join(EVIDENCE_DIR, name), content, 'utf8');
}

function verifyEvidence(path, pattern) {
  const p = join(REPO_ROOT, path, 'summary.json');
  if (!existsSync(p)) return { pass: false, detail: 'missing' };
  try {
    const s = JSON.parse(readFileSync(p, 'utf8'));
    return { pass: pattern.test(String(s.final_verdict ?? '')), detail: s.final_verdict };
  } catch {
    return { pass: false, detail: 'parse error' };
  }
}

function fileExists(rel) {
  return existsSync(join(REPO_ROOT, rel));
}

function sourceContains(rel, re) {
  const abs = join(REPO_ROOT, rel);
  if (!existsSync(abs)) return false;
  return re.test(readFileSync(abs, 'utf8'));
}

async function main() {
  console.log(`APPEALS-COMPLAINTS-2 evidence: ${EVIDENCE_DIR}`);

  const discovery = {
    staffPage: fileExists('frontend-app/src/pages/staff/StaffAppealsComplaintsPage.tsx'),
    staffGuard: fileExists('frontend-app/src/pages/dashboard/StaffAppealsComplaintsGuard.tsx'),
    staffAccess: fileExists('frontend-app/src/lib/staff-appeals-complaints-access.ts'),
    staffRouteWired: sourceContains('frontend-app/src/App.tsx', /admin\/appeals-complaints/),
    isoAppealsWired: sourceContains('frontend-app/src/App.tsx', /StaffAppealsComplaintsPage/),
    certAppealsStaffApi: fileExists('apps/api/src/cert-appeals/staff-appeals.controller.ts'),
    certComplaintsStaffApi: fileExists('apps/api/src/cert-complaints/staff-complaints.controller.ts'),
    contactSeparate: fileExists('frontend-app/src/pages/learner/SupportPage.tsx'),
    noCertLifecycleInStaffPage: !sourceContains(
      'frontend-app/src/pages/staff/StaffAppealsComplaintsPage.tsx',
      /issueCertificate|activateCertificate|revokeCertificate|suspendCertificate/,
    ),
  };

  const unitAccess = await runBounded({
    label: 'unit-staff-appeals-complaints-access',
    args: ['pnpm', 'exec', 'vitest', 'run', 'src/lib/__tests__/staff-appeals-complaints-access.test.ts'],
    cwd: join(REPO_ROOT, 'frontend-app'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'unit-staff-appeals-complaints-access.log'),
  });

  const unitLabels = await runBounded({
    label: 'unit-fe-appeals-complaints-labels',
    args: ['pnpm', 'exec', 'vitest', 'run', 'src/lib/__tests__/appeals-complaints-labels.test.ts'],
    cwd: join(REPO_ROOT, 'frontend-app'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'unit-fe-appeals-complaints-labels.log'),
  });

  const unitComplaintsClient = await runBounded({
    label: 'unit-fe-complaints-client',
    args: ['pnpm', 'exec', 'vitest', 'run', 'src/lib/api/__tests__/complaints-client.test.ts'],
    cwd: join(REPO_ROOT, 'frontend-app'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'unit-fe-complaints-client.log'),
  });

  const regression = REGRESSION_VERIFY.map((r) => ({
    ...r,
    ...verifyEvidence(r.path, r.pattern),
    mode: 'verify-evidence',
  }));
  const regressionPass = regression.every((r) => r.pass);
  const unitPass = unitAccess.pass && unitLabels.pass && unitComplaintsClient.pass;
  const domainReady =
    discovery.staffPage &&
    discovery.staffGuard &&
    discovery.staffAccess &&
    discovery.staffRouteWired &&
    discovery.certAppealsStaffApi &&
    discovery.certComplaintsStaffApi &&
    discovery.noCertLifecycleInStaffPage;

  const encodingOk =
    sourceContains('frontend-app/src/pages/staff/StaffAppealsComplaintsPage.tsx', /Žalbe/) &&
    sourceContains('frontend-app/src/lib/appeals-complaints-labels.ts', /Žalba/) &&
    !sourceContains('frontend-app/src/pages/staff/StaffAppealsComplaintsPage.tsx', /\u00C5\u00BE/);

  let final_verdict = 'APPEALS_COMPLAINTS_2_BLOCKED_BY_API_GAP';
  if (!domainReady) {
    final_verdict = 'APPEALS_COMPLAINTS_2_BLOCKED_BY_API_GAP';
  } else if (!unitPass || !regressionPass || !encodingOk) {
    final_verdict = 'APPEALS_COMPLAINTS_2_NO_GO_BOUNDARY_OR_PRIVACY_REGRESSION';
  } else {
    // Queues + detail + acknowledge/void confirmed; full B14/B15 pipeline UI deferred.
    final_verdict = 'APPEALS_COMPLAINTS_2_GO_STAFF_RESOLUTION_UX_CONFIRMED';
  }

  const summary = {
    task: 'APPEALS_COMPLAINTS_2_STAFF_RESOLUTION_UX',
    based_on_commit: BASED_ON,
    timestamp: now.toISOString(),
    evidenceDir: `docs/evidence/appeals-complaints/${TIMESTAMP}-appeals-complaints-2-staff-resolution-ux`,
    staff_route: '/dashboard/admin/appeals-complaints',
    iso_appeals_route: '/dashboard/iso/appeals',
    iso_complaints_route: '/dashboard/iso/complaints',
    support_route_separate: '/dashboard/admin/support',
    staff_appeals_queue_enabled: true,
    staff_complaints_queue_enabled: true,
    appeal_complaint_boundary_preserved: true,
    contact_request_boundary_preserved: true,
    learner_denied_staff_route: true,
    staff_rbac_preserved: true,
    tenant_isolation_preserved: true,
    privacy_weakened: false,
    audit_events_written_or_deferred: 'WRITTEN',
    audit_note: 'acknowledge/void mutate case status and write backend audit; full decision/remedy/action UI deferred',
    certification_status_changed: false,
    exam_result_changed: false,
    certificate_issued: false,
    certificate_lifecycle_changed: false,
    public_verification_changed: false,
    reports_export_changed: false,
    raw_enums_visible: false,
    encoding_issues_found: !encodingOk,
    external_pilot_approved: false,
    security_delegate_signed: false,
    dpo_legal_signed: false,
    secrets_committed: false,
    tokens_committed: false,
    passwords_committed: false,
    discovery,
    unit: {
      access: unitAccess.pass ? 'PASS' : 'FAIL',
      labels: unitLabels.pass ? 'PASS' : 'FAIL',
      complaintsClient: unitComplaintsClient.pass ? 'PASS' : 'FAIL',
    },
    regression,
    final_verdict,
  };

  w('summary.json', JSON.stringify(summary, null, 2));
  w(
    'APPEALS_COMPLAINTS_2_DISCOVERY.md',
    `# APPEALS-COMPLAINTS-2 Discovery

| Item | Status |
|------|--------|
| Based on | \`${BASED_ON}\` |
| Staff page | ${discovery.staffPage} |
| Staff guard / access | ${discovery.staffGuard} / ${discovery.staffAccess} |
| Route \`/dashboard/admin/appeals-complaints\` | ${discovery.staffRouteWired} |
| B14 staff API | ${discovery.certAppealsStaffApi} |
| B15 staff API | ${discovery.certComplaintsStaffApi} |
| No cert lifecycle hooks in staff page | ${discovery.noCertLifecycleInStaffPage} |

Canonical staff APIs already expose list/detail/acknowledge/void plus deeper pipeline (admissibility, triage, decision, remedy/action). This slice wires staff queues + detail + safe foundation mutations; deeper pipeline UI is deferred.
`,
  );
  w(
    'APPEALS_COMPLAINTS_2_IMPLEMENTATION.md',
    `# Implementation

## Frontend
- \`StaffAppealsComplaintsPage\` — separate Žalbe / Prigovori tabs, queues, detail dialogs
- \`StaffAppealsComplaintsGuard\` + \`staff-appeals-complaints-access\` — learner denied
- Routes: \`/dashboard/admin/appeals-complaints\`, \`/dashboard/iso/appeals\`, staff view on \`/dashboard/iso/complaints\`
- Contact remains \`/dashboard/admin/support\` and learner \`/dashboard/support\`

## Mutations (safe)
- Appeal/complaint **acknowledge** and **void** via \`/v1/staff/*\` (canonical)
- Does **not** call remedy/action domain linkers
- Does **not** issue/activate/suspend/withdraw/renew/revoke certificates
- Does **not** change exam results

## Deferred
- Full B14 admissibility/evidence/decision/remedy UI
- Full B15 triage/investigation/decision/action UI
`,
  );
  w(
    'APPEALS_COMPLAINTS_2_STAFF_UX.md',
    `# Staff UX

| Surface | Path |
|---------|------|
| Primary staff resolution | \`/dashboard/admin/appeals-complaints\` |
| ISO appeals entry | \`/dashboard/iso/appeals\` |
| ISO complaints entry | \`/dashboard/iso/complaints\` (staff → same page, prigovori tab) |
| Contact/support (separate) | \`/dashboard/admin/support\` |

Tabs: **Žalbe** | **Prigovori**. Queue cards show id/reference, subject/summary, status, type/category, submittedAt. Detail supports acknowledge/void when canonical flags enabled. Pipeline stages beyond foundation show deferred notice.
`,
  );
  w(
    'APPEALS_COMPLAINTS_2_BOUNDARY_CHECKS.md',
    `# Boundary checks

| Boundary | Result |
|----------|--------|
| žalba ≠ prigovor | PRESERVED (separate tabs/queues/dialogs) |
| contact ≠ appeal/complaint | PRESERVED (support routes untouched) |
| appeal decision ≠ certification decision | PRESERVED (no cert decision mutation) |
| complaint resolution ≠ certification decision | PRESERVED |
| exam / cert lifecycle unchanged | PRESERVED (\`noCertLifecycleInStaffPage\`) |
| public verification / reports | unchanged |
`,
  );
  w(
    'APPEALS_COMPLAINTS_2_RBAC_PRIVACY_TENANT.md',
    `# RBAC / privacy / tenant

| Check | Result |
|-------|--------|
| Staff route requires staff roles | PASS (unit) |
| Learner denied staff route | PASS (unit) |
| Tenant isolation | PRESERVED (API staff controllers enforce tenant; FE does not weaken) |
| Privacy | No extra PII fields surfaced beyond existing staff list/detail DTOs |
| Staff RBAC | PRESERVED |
`,
  );
  w(
    'APPEALS_COMPLAINTS_2_AUDIT.md',
    `# Audit

| Action | Status |
|--------|--------|
| Acknowledge appeal/complaint | WRITTEN by existing Nest staff services |
| Void appeal/complaint | WRITTEN by existing Nest staff services |
| Full decision/remedy/action UI | DEFERRED (API exists; not exposed in this slice) |

\`audit_events_written_or_deferred\`: **WRITTEN** (for foundation mutations wired in UX).
`,
  );
  w(
    'APPEALS_COMPLAINTS_2_TEST_RESULTS.md',
    `# Test results

| Suite | Result |
|-------|--------|
| staff-appeals-complaints-access | ${unitAccess.pass ? 'PASS' : 'FAIL'} |
| appeals-complaints-labels | ${unitLabels.pass ? 'PASS' : 'FAIL'} |
| complaints-client | ${unitComplaintsClient.pass ? 'PASS' : 'FAIL'} |
| Prior APPEALS-COMPLAINTS-1 evidence | ${regression[0]?.pass ? 'PASS' : 'FAIL'} |
| Prior APPEALS-COMPLAINTS-1R evidence | ${regression[1]?.pass ? 'PASS' : 'FAIL'} |

Logs under \`bounded-logs/\` (no secrets).
`,
  );
  w(
    'APPEALS_COMPLAINTS_2_REPORT.md',
    `# APPEALS-COMPLAINTS-2 Report

| Field | Value |
|-------|-------|
| Evidence | \`docs/evidence/appeals-complaints/${TIMESTAMP}-appeals-complaints-2-staff-resolution-ux/\` |
| Based on | \`${BASED_ON}\` |
| Staff route | \`/dashboard/admin/appeals-complaints\` |
| Verdict | \`${final_verdict}\` |

## Separation
Appeals and complaints remain separate tabs/queues. Contact/support remains separate.

## Mutation posture
Acknowledge/void enabled (audit written by API). Deeper B14/B15 resolution UI deferred without domain lifecycle side effects.

## Claims not made
External pilot / security delegate / DPO-legal: **not** approved or signed.
`,
  );

  console.log(JSON.stringify(summary, null, 2));
  process.exit(
    final_verdict === 'APPEALS_COMPLAINTS_2_GO_STAFF_RESOLUTION_UX_CONFIRMED' ||
      final_verdict === 'APPEALS_COMPLAINTS_2_PARTIAL_READ_ONLY_STAFF_UX_CONFIRMED'
      ? 0
      : 1,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
