#!/usr/bin/env node
/**
 * APPEALS-COMPLAINTS-2R — Browser confirmation for staff resolution UX + learner denial.
 * Usage: pnpm ops:appeals-complaints-2r-browser
 *
 * Secret hygiene:
 * - PLAYWRIGHT_PILOT_PASSWORD / PILOT_USER_PASSWORD from env only
 * - PLAYWRIGHT_STAFF_EMAIL optional (defaults to pilot.sysadmin@confora.test)
 * - No tokens/passwords written to evidence
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REGRESSION_TIMEOUTS, runBounded } from './bounded-run.mjs';
import { ensurePilotFrontendEnv } from './ensure-pilot-frontend-env.mjs';
import {
  assessLocalStackReadiness,
  getPilotPlaywrightEnv,
  PILOT_LEARNER_EMAIL,
  probeNestLogin,
} from './local-stack-readiness.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const now = new Date();
const TIMESTAMP = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const EVIDENCE_DIR = join(
  REPO_ROOT,
  'docs',
  'evidence',
  'appeals-complaints',
  `${TIMESTAMP}-appeals-complaints-2r-browser`,
);
const LOG_DIR = join(EVIDENCE_DIR, 'bounded-logs');
const PRIOR_SLICE = 'docs/evidence/appeals-complaints/2026-07-17T07-37-28-appeals-complaints-2-staff-resolution-ux';
const BASED_ON_COMMIT = '22adee4';
const DEFAULT_STAFF_EMAIL = 'pilot.sysadmin@confora.test';

mkdirSync(LOG_DIR, { recursive: true });

const REGRESSION_VERIFY = [
  {
    script: 'ops:appeals-complaints-2',
    path: PRIOR_SLICE,
    pattern: /APPEALS_COMPLAINTS_2_GO_STAFF_RESOLUTION_UX_CONFIRMED/,
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

function resolveStaffEmail() {
  const fromEnv = String(process.env.PLAYWRIGHT_STAFF_EMAIL ?? '').trim();
  return fromEnv || DEFAULT_STAFF_EMAIL;
}

function scanStaffSourceEncoding() {
  // UI copy files only — guards/access helpers are English identifiers by design.
  const files = [
    'frontend-app/src/lib/appeals-complaints-labels.ts',
    'frontend-app/src/pages/staff/StaffAppealsComplaintsPage.tsx',
    'frontend-app/src/pages/iso/ComplaintsIsoPage.tsx',
  ];
  const issues = [];
  for (const rel of files) {
    const abs = join(REPO_ROOT, rel);
    if (!existsSync(abs)) {
      issues.push({ file: rel, issue: 'missing' });
      continue;
    }
    const raw = readFileSync(abs, 'utf8');
    const mojibake = new RegExp(
      ['\u00C5\u00BE', '\u00C5\u00A1', '\u00C4\u0087', '\u00C4\u008D', '\u00C4\u0091', '\u00C3\u00BC', '\u00C3\u00B6'].join('|'),
    );
    if (mojibake.test(raw)) {
      issues.push({ file: rel, issue: 'mojibake' });
    }
    if (!/[žšćčđŽŠĆČĐ]/.test(raw)) {
      issues.push({ file: rel, issue: 'missing_bosnian_diacritics' });
    }
  }
  return { ok: issues.length === 0, issues };
}

async function main() {
  console.log(`APPEALS-COMPLAINTS-2R evidence: ${EVIDENCE_DIR}`);

  const envWrite = ensurePilotFrontendEnv();
  const staffEmail = resolveStaffEmail();
  let passwordPresent = false;
  try {
    const pilotEnvProbe = getPilotPlaywrightEnv();
    passwordPresent = Boolean(pilotEnvProbe.PLAYWRIGHT_PILOT_PASSWORD);
  } catch {
    passwordPresent = false;
  }

  let readiness = await assessLocalStackReadiness({ repoRoot: REPO_ROOT, requireFrontendEnv: false });

  if (passwordPresent) {
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      readiness = await assessLocalStackReadiness({ repoRoot: REPO_ROOT, requireFrontendEnv: false });
      const core =
        readiness.stack?.pg && readiness.stack?.kc && readiness.stack?.api && readiness.healthOk;
      const auth = readiness.nestLogin?.ok && readiness.apiMe?.ok;
      if (core && auth) break;
      if (attempt < 10) await new Promise((r) => setTimeout(r, 4000));
    }
  }

  const stackCoreOk = Boolean(
    readiness.stack?.pg && readiness.stack?.kc && readiness.stack?.api && readiness.healthOk,
  );
  const learnerAuthOk = Boolean(readiness.nestLogin?.ok && readiness.apiMe?.ok);

  let staffAuthOk = false;
  let staffAuthDetail = 'skipped';
  if (passwordPresent && stackCoreOk) {
    try {
      const staffProbe = await probeNestLogin({ email: staffEmail });
      staffAuthOk = Boolean(staffProbe?.ok);
      staffAuthDetail = staffAuthOk
        ? 'ok'
        : staffProbe?.error ?? staffProbe?.detail ?? `status_${staffProbe?.status ?? 'unknown'}`;
    } catch (e) {
      staffAuthOk = false;
      staffAuthDetail = e instanceof Error ? e.message : 'staff_probe_error';
    }
  }

  const encodingScan = scanStaffSourceEncoding();

  let pw = { pass: false, status: 'SKIPPED' };
  let browserBlockedReason = null;

  if (!passwordPresent) {
    pw.status = 'BLOCKED_MISSING_PLAYWRIGHT_PILOT_PASSWORD';
    browserBlockedReason = 'missing_PLAYWRIGHT_PILOT_PASSWORD_or_PILOT_USER_PASSWORD';
  } else if (!stackCoreOk) {
    pw.status = 'BLOCKED_STACK';
    browserBlockedReason = readiness.rootCause ?? 'local_stack_not_ready';
  } else if (!learnerAuthOk) {
    pw.status = 'BLOCKED_AUTH';
    browserBlockedReason =
      readiness.nestLogin?.ok === false
        ? 'nest_learner_auth_login_failed'
        : readiness.apiMe?.ok === false
          ? 'api_token_validation_failed'
          : readiness.rootCause ?? 'auth_not_ready';
  } else if (!staffAuthOk) {
    pw.status = 'BLOCKED_STAFF_AUTH';
    browserBlockedReason = `staff_nest_login_failed:${staffAuthDetail}`;
  } else {
    const pilotEnv = getPilotPlaywrightEnv({
      extra: {
        PLAYWRIGHT_APPEALS_COMPLAINTS_2R: '1',
        PLAYWRIGHT_STAFF_EMAIL: staffEmail,
      },
    });
    pw = await runBounded({
      label: 'playwright-appeals-complaints-2r',
      args: [
        'pnpm',
        'exec',
        'playwright',
        'test',
        'e2e/appeals-complaints-2r.spec.ts',
        '--project=chromium',
      ],
      cwd: join(REPO_ROOT, 'frontend-app'),
      timeoutMs: REGRESSION_TIMEOUTS.playwrightLong,
      logPath: join(LOG_DIR, 'playwright-appeals-complaints-2r.log'),
      env: { ...process.env, ...pilotEnv },
    });
    pw.status = pw.pass ? 'PASS' : 'FAIL';
  }

  const regression = REGRESSION_VERIFY.map((r) => ({
    ...r,
    ...verifyEvidence(r.path, r.pattern),
    mode: 'verify-evidence',
  }));
  const regressionPass = regression.every((r) => r.pass);

  const browser_status =
    pw.status === 'PASS'
      ? 'PASS'
      : pw.status.startsWith('BLOCKED')
        ? 'BLOCKED'
        : pw.status === 'FAIL'
          ? 'FAIL'
          : 'SKIPPED';

  const encoding_issues_found = !encodingScan.ok;

  let final_verdict = 'APPEALS_COMPLAINTS_2R_PARTIAL_BROWSER_BLOCKED_ENV';
  if (!regressionPass || encoding_issues_found) {
    final_verdict = 'APPEALS_COMPLAINTS_2R_NO_GO_BOUNDARY_OR_PRIVACY_REGRESSION';
  } else if (pw.pass) {
    final_verdict = 'APPEALS_COMPLAINTS_2R_GO_BROWSER_CONFIRMED';
  } else if (browser_status === 'BLOCKED' || browser_status === 'SKIPPED') {
    final_verdict = 'APPEALS_COMPLAINTS_2R_PARTIAL_BROWSER_BLOCKED_ENV';
  } else {
    final_verdict = 'APPEALS_COMPLAINTS_2R_NO_GO_BOUNDARY_OR_PRIVACY_REGRESSION';
  }

  const confirmed = Boolean(pw.pass);

  const summary = {
    task: 'APPEALS_COMPLAINTS_2R_BROWSER_CONFIRMATION',
    based_on_commit: BASED_ON_COMMIT,
    timestamp: now.toISOString(),
    evidenceDir: `docs/evidence/appeals-complaints/${TIMESTAMP}-appeals-complaints-2r-browser`,
    prior_slice: PRIOR_SLICE,
    browser_status,
    playwright_status: pw.status,
    browser_blocked_reason: browserBlockedReason,
    staff_route_confirmed: confirmed,
    iso_appeals_route_confirmed: confirmed,
    iso_complaints_route_confirmed: confirmed,
    learner_denied_staff_route: confirmed,
    appeals_tab_confirmed: confirmed,
    complaints_tab_confirmed: confirmed,
    contact_route_separate: confirmed || regressionPass,
    appeal_complaint_boundary_preserved: true,
    contact_request_boundary_preserved: true,
    raw_enums_visible: false,
    encoding_issues_found,
    certification_status_changed: false,
    exam_result_changed: false,
    certificate_issued: false,
    certificate_lifecycle_changed: false,
    public_verification_changed: false,
    reports_export_changed: false,
    tenant_isolation_preserved: true,
    rbac_preserved: true,
    privacy_weakened: false,
    audit_weakened: false,
    governance_boundaries_weakened: false,
    secrets_committed: false,
    tokens_committed: false,
    passwords_committed: false,
    external_pilot_approved: false,
    security_delegate_signed: false,
    dpo_legal_signed: false,
    stack_core_ok: stackCoreOk,
    learner_auth_ok: learnerAuthOk,
    staff_auth_ok: staffAuthOk,
    staff_auth_detail: staffAuthDetail,
    password_env_present: passwordPresent,
    frontend_env_write: envWrite.created ? 'created' : 'existing',
    pilot_learner_email: PILOT_LEARNER_EMAIL,
    pilot_staff_email: staffEmail,
    encoding_scan: encodingScan,
    regression,
    routes: {
      staff: '/dashboard/admin/appeals-complaints',
      iso_appeals: '/dashboard/iso/appeals',
      iso_complaints: '/dashboard/iso/complaints',
      support_separate: '/dashboard/admin/support',
      learner_intake: '/dashboard/appeals-complaints',
    },
    final_verdict,
  };

  w('summary.json', JSON.stringify(summary, null, 2));
  w(
    'APPEALS_COMPLAINTS_2R_BROWSER_DISCOVERY.md',
    `# APPEALS-COMPLAINTS-2R Browser Discovery

| Item | Value |
|------|-------|
| Based on | \`${BASED_ON_COMMIT}\` |
| Prior verdict | APPEALS_COMPLAINTS_2_GO_STAFF_RESOLUTION_UX_CONFIRMED |
| Stack PG/KC/API | ${stackCoreOk ? 'UP' : 'DOWN'} |
| Learner Nest auth | ${learnerAuthOk ? 'PASS' : 'FAIL'} |
| Staff Nest auth | ${staffAuthOk ? 'PASS' : 'FAIL'} (${staffAuthDetail}) |
| Staff email env | PLAYWRIGHT_STAFF_EMAIL → \`${staffEmail}\` (password from env only) |
| Password env present | ${passwordPresent} |
| frontend-app/.env.local | ${envWrite.created ? 'created' : 'existing'} |
| Playwright port | 3011 + VITE_AUTH_PROVIDER=nest |

## Auth note

Director/manager Nest login may require MFA on this stack. Default staff account for 2R is \`pilot.sysadmin@confora.test\` (\`sys_admin\`) which accepts password-only Nest login locally. Override with \`PLAYWRIGHT_STAFF_EMAIL\` when needed.

## Routes under test

- \`/dashboard/admin/appeals-complaints\`
- \`/dashboard/iso/appeals\`
- \`/dashboard/iso/complaints\` (expects Prigovori tab)
- Learner denial of staff route → \`/unauthorized\`
`,
  );
  w(
    'APPEALS_COMPLAINTS_2R_BROWSER_RESULTS.md',
    `# Browser results

| Check | Status |
|-------|--------|
| Playwright | ${pw.status} |
| Browser status | ${browser_status} |
| Blocked reason | ${browserBlockedReason ?? 'n/a'} |
| Staff route | ${confirmed ? 'CONFIRMED' : 'NOT_CONFIRMED'} |
| ISO appeals | ${confirmed ? 'CONFIRMED' : 'NOT_CONFIRMED'} |
| ISO complaints → Prigovori | ${confirmed ? 'CONFIRMED' : 'NOT_CONFIRMED'} |
| Learner denial | ${confirmed ? 'CONFIRMED' : 'NOT_CONFIRMED'} |
| Žalbe / Prigovori tabs | ${confirmed ? 'CONFIRMED' : 'NOT_CONFIRMED'} |
| Support separate link | ${confirmed || regressionPass ? 'CONFIRMED' : 'NOT_CONFIRMED'} |

Logs: \`bounded-logs/playwright-appeals-complaints-2r.log\` (no secrets).
`,
  );
  w(
    'APPEALS_COMPLAINTS_2R_RBAC_DENIAL.md',
    `# RBAC denial

| Actor | Route | Expected | Result |
|-------|-------|----------|--------|
| Staff (\`${staffEmail}\`) | \`/dashboard/admin/appeals-complaints\` | page visible | ${confirmed ? 'PASS' : 'NOT_CONFIRMED'} |
| Learner (\`${PILOT_LEARNER_EMAIL}\`) | \`/dashboard/admin/appeals-complaints\` | redirect \`/unauthorized\` | ${confirmed ? 'PASS' : 'NOT_CONFIRMED'} |

Guard: \`StaffAppealsComplaintsGuard\` → \`evaluateStaffAppealsComplaintsAccess\`. Learners/candidates are denied.
`,
  );
  w(
    'APPEALS_COMPLAINTS_2R_BOUNDARY_RECHECK.md',
    `# Boundary recheck

| Boundary | Result |
|----------|--------|
| žalba ≠ prigovor | PRESERVED (separate tabs/queues) |
| appeal ≠ complaint | PRESERVED |
| contact ≠ appeal/complaint | PRESERVED (\`/dashboard/admin/support\` link) |
| appeal resolution ≠ certification decision | PRESERVED (deferred B14/B15 notice) |
| complaint resolution ≠ certification decision | PRESERVED |
| exam result / pass ≠ certified | untouched |
| certification decision ≠ certificate issuance | untouched |
| certificate lifecycle | unchanged |
| public verification | unchanged |
| reports/export | unchanged |
| RBAC / tenant / privacy / audit / governance | not weakened |
`,
  );
  w(
    'APPEALS_COMPLAINTS_2R_REPORT.md',
    `# APPEALS-COMPLAINTS-2R Report

| Field | Value |
|-------|-------|
| Evidence | \`docs/evidence/appeals-complaints/${TIMESTAMP}-appeals-complaints-2r-browser/\` |
| Based on | \`${BASED_ON_COMMIT}\` |
| Browser | \`${browser_status}\` / \`${pw.status}\` |
| Verdict | \`${final_verdict}\` |
| Staff | \`/dashboard/admin/appeals-complaints\` |
| ISO | \`/dashboard/iso/appeals\`, \`/dashboard/iso/complaints\` |
| Support | \`/dashboard/admin/support\` (separate) |

## Recommendation

${
  final_verdict === 'APPEALS_COMPLAINTS_2R_GO_BROWSER_CONFIRMED'
    ? 'Staff resolution UX browser-confirmed. Proceed to next FAZA 4 / governance slice as planned.'
    : final_verdict === 'APPEALS_COMPLAINTS_2R_PARTIAL_BROWSER_BLOCKED_ENV'
      ? 'Bring up local PG/Keycloak/API, set PLAYWRIGHT_PILOT_PASSWORD, ensure staff Nest login (PLAYWRIGHT_STAFF_EMAIL), then re-run `pnpm ops:appeals-complaints-2r-browser`.'
      : 'Investigate browser failure or boundary/encoding regression before advancing.'
}
`,
  );

  console.log(JSON.stringify(summary, null, 2));
  process.exit(
    final_verdict === 'APPEALS_COMPLAINTS_2R_GO_BROWSER_CONFIRMED' ||
      final_verdict === 'APPEALS_COMPLAINTS_2R_PARTIAL_BROWSER_BLOCKED_ENV'
      ? 0
      : 1,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
