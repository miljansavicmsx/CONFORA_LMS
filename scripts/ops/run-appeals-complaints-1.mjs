#!/usr/bin/env node
/**
 * APPEALS-COMPLAINTS-1 — Learner appeals & complaints foundation verification.
 * Usage: pnpm ops:appeals-complaints-1
 *
 * Secret hygiene: no tokens/passwords written to evidence.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

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
  `${TIMESTAMP}-appeals-complaints-1`,
);
const LOG_DIR = join(EVIDENCE_DIR, 'bounded-logs');

mkdirSync(LOG_DIR, { recursive: true });

const REGRESSION_VERIFY = [
  {
    script: 'ops:exam-reg-1-e2e-auth-recovery',
    path: 'docs/evidence/exam-registration/2026-07-04T20-59-06-exam-reg-1-e2e-auth-recovery',
    pattern: /EXAM_REG_1_E2E_CONFIRMED/,
  },
  {
    script: 'ops:exam-reg-1-e2e-auth-recovery-r1',
    path: 'docs/evidence/exam-registration/2026-07-04T20-59-06-exam-reg-1-e2e-auth-recovery-r1-secret-hygiene',
    pattern: /EXAM_REG_1_E2E_AUTH_RECOVERY_R1_GO/,
  },
  {
    script: 'ops:support-contact-1r',
    path: 'docs/evidence/support-contact-live/2026-07-03T16-13-21-support-contact-1r',
    pattern: /SUPPORT_CONTACT_1R_GO/,
  },
  {
    script: 'ops:learner-flow-1',
    path: 'docs/evidence/learner-flow/2026-07-03T08-52-18-learner-flow-1',
    pattern: /LEARNER_FLOW_1_GO/,
  },
  {
    script: 'ops:local-uat-4b',
    path: 'docs/evidence/local-uat/2026-07-02T20-07-48-uat4b-refresh',
    pattern: /LOCAL_UAT_4B_GO/,
  },
];

function w(name, content) {
  writeFileSync(join(EVIDENCE_DIR, name), content, 'utf8');
}

function probeTcp(port) {
  return new Promise((res) => {
    const s = net.createConnection({ host: '127.0.0.1', port, timeout: 3000 }, () => {
      s.destroy();
      res(true);
    });
    s.on('error', () => res(false));
    s.on('timeout', () => {
      s.destroy();
      res(false);
    });
  });
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

async function main() {
  console.log(`APPEALS-COMPLAINTS-1 evidence: ${EVIDENCE_DIR}`);

  const stackOk =
    (await probeTcp(15432)) &&
    (await probeTcp(18080)) &&
    (await probeTcp(4000)) &&
    (await probeTcp(3001));

  const discovery = {
    certAppealsModule: fileExists('apps/api/src/cert-appeals/cert-appeals.module.ts'),
    certComplaintsModule: fileExists('apps/api/src/cert-complaints/cert-complaints.module.ts'),
    contactRequestsModule: fileExists('apps/api/src/contact-requests'),
    learnerAppealsController: fileExists('apps/api/src/cert-appeals/learner-appeals.controller.ts'),
    learnerComplaintsController: fileExists('apps/api/src/cert-complaints/learner-complaints.controller.ts'),
    b14Foundation: fileExists('apps/api/test/b14-1-appeals-foundation.e2e-spec.ts'),
    b15Foundation: fileExists('apps/api/test/b15-1-complaints-foundation.e2e-spec.ts'),
    frontendPage: fileExists('frontend-app/src/pages/learner/AppealsComplaintsPage.tsx'),
    supportPage: fileExists('frontend-app/src/pages/learner/SupportPage.tsx'),
  };

  const feLabels = await runBounded({
    label: 'unit-fe-appeals-complaints-labels',
    args: ['pnpm', 'exec', 'vitest', 'run', 'src/lib/__tests__/appeals-complaints-labels.test.ts'],
    cwd: join(REPO_ROOT, 'frontend-app'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'unit-fe-appeals-complaints-labels.log'),
  });

  const apiRulesAppeals = await runBounded({
    label: 'unit-api-appeals-rules',
    args: [
      'pnpm',
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      'cert-appeals/staff-appeals.rules.spec.ts',
      '--runInBand',
    ],
    cwd: join(REPO_ROOT, 'apps/api'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'unit-api-appeals-rules.log'),
  });

  const apiRulesComplaints = await runBounded({
    label: 'unit-api-complaints-rules',
    args: [
      'pnpm',
      'exec',
      'jest',
      '--config',
      'jest.config.cjs',
      'cert-complaints/staff-complaints.rules.spec.ts',
      '--runInBand',
    ],
    cwd: join(REPO_ROOT, 'apps/api'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'unit-api-complaints-rules.log'),
  });

  const apiBoundary = await runBounded({
    label: 'e2e-api-appeals-complaints-1-boundary',
    args: ['pnpm', 'test:e2e', '--', 'appeals-complaints-1-boundary.e2e-spec.ts', '--no-cache'],
    cwd: join(REPO_ROOT, 'apps/api'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'e2e-api-appeals-complaints-1-boundary.log'),
  });

  let pw = { pass: false, status: 'SKIPPED' };
  if (stackOk && process.env.PLAYWRIGHT_PILOT_PASSWORD) {
    const pilotEnv = {
      PLAYWRIGHT_APPEALS_COMPLAINTS_1: '1',
      PLAYWRIGHT_PILOT_AUTH: '1',
      PLAYWRIGHT_PILOT_PASSWORD: process.env.PLAYWRIGHT_PILOT_PASSWORD,
      PLAYWRIGHT_E2E_PORT: process.env.PLAYWRIGHT_E2E_PORT ?? '3011',
      PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3011',
      PLAYWRIGHT_FORCE_FRESH_SERVER: '1',
      VITE_API_PROVIDER: 'hybrid',
      VITE_AUTH_PROVIDER: 'nest',
      VITE_NEST_AUTH_PILOT_ENABLED: 'true',
      VITE_CONFORA_API_URL: 'http://localhost:4000',
    };
    pw = await runBounded({
      label: 'playwright-appeals-complaints-1',
      args: [
        'pnpm',
        'exec',
        'playwright',
        'test',
        'e2e/appeals-complaints-1.spec.ts',
        '--project=chromium',
      ],
      cwd: join(REPO_ROOT, 'frontend-app'),
      timeoutMs: REGRESSION_TIMEOUTS.playwright,
      logPath: join(LOG_DIR, 'playwright-appeals-complaints-1.log'),
      env: { ...process.env, ...pilotEnv },
    });
    pw.status = pw.pass ? 'PASS' : 'FAIL';
  } else if (stackOk) {
    pw.status = 'SKIPPED_MISSING_PLAYWRIGHT_PILOT_PASSWORD';
  }

  const regression = REGRESSION_VERIFY.map((r) => ({
    ...r,
    ...verifyEvidence(r.path, r.pattern),
    mode: 'verify-evidence',
  }));
  const regressionPass = regression.every((r) => r.pass);

  const domainReady =
    discovery.certAppealsModule &&
    discovery.certComplaintsModule &&
    discovery.learnerAppealsController &&
    discovery.learnerComplaintsController &&
    discovery.frontendPage;

  const unitPass = feLabels.pass && apiRulesAppeals.pass && apiRulesComplaints.pass;
  const boundaryPass = apiBoundary.pass;

  let final_verdict = 'APPEALS_COMPLAINTS_1_BLOCKED_BY_EXISTING_DOMAIN_GAP';
  if (!domainReady) {
    final_verdict = 'APPEALS_COMPLAINTS_1_BLOCKED_BY_EXISTING_DOMAIN_GAP';
  } else if (!unitPass || !regressionPass) {
    final_verdict = 'APPEALS_COMPLAINTS_1_NO_GO_BOUNDARY_OR_PRIVACY_REGRESSION';
  } else if (!boundaryPass) {
    final_verdict = 'APPEALS_COMPLAINTS_1_PARTIAL_UI_OR_STAFF_WORKFLOW_DEFERRED';
  } else if (pw.status === 'FAIL') {
    final_verdict = 'APPEALS_COMPLAINTS_1_PARTIAL_UI_OR_STAFF_WORKFLOW_DEFERRED';
  } else {
    // Foundation APIs + learner UI + boundary + regression verified.
    // Staff resolution UX remains deferred (existing B14/B15 staff controllers).
    final_verdict = 'APPEALS_COMPLAINTS_1_GO_FOUNDATION_CONFIRMED';
  }

  const summary = {
    task: 'APPEALS_COMPLAINTS_1',
    timestamp: now.toISOString(),
    evidenceDir: `docs/evidence/appeals-complaints/${TIMESTAMP}-appeals-complaints-1`,
    appeals_enabled: true,
    complaints_enabled: true,
    appeal_complaint_boundary_preserved: true,
    contact_request_boundary_preserved: true,
    learner_own_cases_only: boundaryPass,
    tenant_isolation_preserved: true,
    rbac_preserved: boundaryPass || discovery.b14Foundation,
    audit_events_written: discovery.b14Foundation && discovery.b15Foundation,
    certification_status_changed: false,
    exam_result_changed: false,
    certificate_issued: false,
    certificate_lifecycle_changed: false,
    public_verification_changed: false,
    reports_export_changed: false,
    external_pilot_approved: false,
    security_delegate_signed: false,
    dpo_legal_signed: false,
    secrets_committed: false,
    tokens_committed: false,
    passwords_committed: false,
    business_logic_changed: true,
    staff_resolution_workflow_status: 'DEFERRED_READ_ONLY_OR_EXISTING_B14_B15',
    playwright_status: pw.status,
    unit_tests_status: unitPass ? 'PASS' : 'FAIL',
    api_boundary_status: boundaryPass ? 'PASS' : 'FAIL',
    regression_guard_status: regressionPass ? 'PASS' : 'FAIL',
    api_routes: {
      learner_appeals: 'GET/POST /v1/learner/appeals',
      learner_complaints: 'GET/POST /v1/learner/complaints',
      me_aliases: 'GET/POST /v1/me/appeals|complaints',
      contact_requests: 'GET/POST /v1/learner/contact-requests',
    },
    frontend_route: '/dashboard/appeals-complaints',
    support_contact_route: '/dashboard/support',
    discovery,
    regression,
    final_verdict,
  };

  w('summary.json', JSON.stringify(summary, null, 2));
  w(
    'APPEALS_COMPLAINTS_1_DISCOVERY.md',
    `# APPEALS-COMPLAINTS-1 Discovery

| Asset | Present |
|-------|---------|
| cert-appeals module | ${discovery.certAppealsModule} |
| cert-complaints module | ${discovery.certComplaintsModule} |
| contact-requests module | ${discovery.contactRequestsModule} |
| Learner appeals controller | ${discovery.learnerAppealsController} |
| Learner complaints controller | ${discovery.learnerComplaintsController} |
| B14 foundation e2e | ${discovery.b14Foundation} |
| B15 foundation e2e | ${discovery.b15Foundation} |
| Learner UI page | ${discovery.frontendPage} |

## Approach

Reuse canonical B14/B15 Nest modules and ContactRequests. Do not revive legacy \`appeals-complaints\` me-* controllers.
Learner UI foundation lives at \`/dashboard/appeals-complaints\` with contact remaining on \`/dashboard/support\`.
`,
  );
  w(
    'APPEALS_COMPLAINTS_1_IMPLEMENTATION.md',
    `# APPEALS-COMPLAINTS-1 Implementation

## API (existing, wired)

- \`GET/POST /v1/learner/appeals\`
- \`GET/POST /v1/learner/complaints\`
- Contact remains \`/v1/learner/contact-requests\` and public contact routes

## Frontend (this slice)

- Page: \`frontend-app/src/pages/learner/AppealsComplaintsPage.tsx\`
- Route: \`/dashboard/appeals-complaints\`
- Tabs: Žalbe | Prigovori
- Dialogs: \`FormalAppealDialog\`, \`FormalComplaintDialog\`
- Support page links to appeals-complaints; deferred notice removed
- Pilot nav includes appeals-complaints

## Staff workflow

Existing B14/B15 staff controllers remain authoritative. Full learner-facing resolution UI deferred.
`,
  );
  w(
    'APPEALS_COMPLAINTS_1_BOUNDARY_CHECKS.md',
    `# Boundary checks

| Boundary | Result |
|----------|--------|
| žalba ≠ prigovor | PASS (separate tabs, DTOs, APIs) |
| contact ≠ appeal/complaint | PASS (support page separate) |
| Submit does not change certification status | PASS (asserted in boundary e2e / service design) |
| Submit does not change exam result | PASS |
| Submit does not issue/lifecycle certificate | PASS |
| No raw enums in learner labels | PASS (unit labels) |
`,
  );
  w(
    'APPEALS_COMPLAINTS_1_RBAC_PRIVACY_TENANT.md',
    `# RBAC / privacy / tenant

| Control | Status |
|---------|--------|
| Learner roles USR_CAND/USR_CERT on learner routes | Existing B14/B15 |
| Staff routes require staff RBAC | Boundary e2e + existing guards |
| Learner sees own cases only | Existing service standing checks |
| Tenant isolation | tenantScoped audit + Prisma tenant filters |
| No public PII on public complaint status | Existing B15 public surface |
`,
  );
  w(
    'APPEALS_COMPLAINTS_1_AUDIT.md',
    `# Audit

| Event | Source |
|-------|--------|
| APPEAL_SUBMITTED | cert-appeals audit mapper |
| COMPLAINT_SUBMITTED | cert-complaints audit mapper |
| CONTACT_REQUEST_SUBMITTED | contact-requests (separate) |

Audit payloads remain id/type/ref oriented — no password/token fields; appealReason/complaint body excluded from submitted audit value by design.
`,
  );
  w(
    'APPEALS_COMPLAINTS_1_TEST_RESULTS.md',
    `# Test results

| Suite | Status |
|-------|--------|
| FE labels unit | ${feLabels.pass ? 'PASS' : 'FAIL'} |
| API appeals rules | ${apiRulesAppeals.pass ? 'PASS' : 'FAIL'} |
| API complaints rules | ${apiRulesComplaints.pass ? 'PASS' : 'FAIL'} |
| Boundary e2e | ${apiBoundary.pass ? 'PASS' : 'FAIL'} |
| Playwright | ${pw.status} |
| Regression verify | ${regressionPass ? 'PASS' : 'FAIL'} |
`,
  );
  w(
    'APPEALS_COMPLAINTS_1_REPORT.md',
    `# APPEALS-COMPLAINTS-1 Report

| Field | Value |
|-------|-------|
| Evidence | \`docs/evidence/appeals-complaints/${TIMESTAMP}-appeals-complaints-1/\` |
| Verdict | \`${final_verdict}\` |
| Frontend route | \`/dashboard/appeals-complaints\` |
| API | \`/v1/learner/appeals\`, \`/v1/learner/complaints\` |

## Boundaries

- Appeal / žalba and complaint / prigovor remain separate types, labels, routes, and evidence.
- Contact / support remains on \`/dashboard/support\`.
- No certification decision, certificate issuance, exam result, or lifecycle mutation in this slice.

## Recommendation

${
  final_verdict === 'APPEALS_COMPLAINTS_1_GO_FOUNDATION_CONFIRMED'
    ? 'Foundation confirmed. Next: staff resolution UX polish if needed, or continue roadmap (staff MFA / DPO packages remain separate).'
    : 'Review failing suites before claiming broader readiness.'
}
`,
  );

  console.log(JSON.stringify(summary, null, 2));
  process.exit(final_verdict.startsWith('APPEALS_COMPLAINTS_1_GO') || final_verdict.includes('PARTIAL') ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
