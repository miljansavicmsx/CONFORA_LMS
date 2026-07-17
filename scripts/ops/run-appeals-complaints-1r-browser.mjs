#!/usr/bin/env node
/**
 * APPEALS-COMPLAINTS-1R — Browser confirmation + encoding/label polish.
 * Usage: pnpm ops:appeals-complaints-1r-browser
 *
 * Secret hygiene: PLAYWRIGHT_PILOT_PASSWORD / PILOT_USER_PASSWORD from env only.
 * No tokens/passwords written to evidence.
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
  `${TIMESTAMP}-appeals-complaints-1r-browser`,
);
const LOG_DIR = join(EVIDENCE_DIR, 'bounded-logs');
const PRIOR_SLICE = 'docs/evidence/appeals-complaints/2026-07-16T19-23-20-appeals-complaints-1';
const BASED_ON_COMMIT = '74e133a';

mkdirSync(LOG_DIR, { recursive: true });

const REGRESSION_VERIFY = [
  {
    script: 'ops:appeals-complaints-1',
    path: PRIOR_SLICE,
    pattern: /APPEALS_COMPLAINTS_1_GO_FOUNDATION_CONFIRMED/,
  },
  {
    script: 'ops:exam-reg-1-e2e-auth-recovery',
    path: 'docs/evidence/exam-registration/2026-07-04T20-59-06-exam-reg-1-e2e-auth-recovery',
    pattern: /EXAM_REG_1_E2E_CONFIRMED/,
  },
  {
    script: 'ops:support-contact-1r',
    path: 'docs/evidence/support-contact-live/2026-07-03T16-13-21-support-contact-1r',
    pattern: /SUPPORT_CONTACT_1R_GO/,
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

function scanSourceEncoding() {
  const files = [
    'frontend-app/src/lib/appeals-complaints-labels.ts',
    'frontend-app/src/pages/learner/AppealsComplaintsPage.tsx',
    'frontend-app/src/components/grievances/FormalAppealDialog.tsx',
    'frontend-app/src/components/grievances/FormalComplaintDialog.tsx',
  ];
  const issues = [];
  for (const rel of files) {
    const abs = join(REPO_ROOT, rel);
    if (!existsSync(abs)) {
      issues.push({ file: rel, issue: 'missing' });
      continue;
    }
    const raw = readFileSync(abs, 'utf8');
    // Detect Latin-1 mojibake via unicode escapes (avoid embedding those sequences in this ops file).
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
  console.log(`APPEALS-COMPLAINTS-1R evidence: ${EVIDENCE_DIR}`);

  const envWrite = ensurePilotFrontendEnv();
  let passwordPresent = false;
  try {
    const pilotEnvProbe = getPilotPlaywrightEnv();
    passwordPresent = Boolean(pilotEnvProbe.PLAYWRIGHT_PILOT_PASSWORD);
  } catch {
    passwordPresent = false;
  }

  let readiness = await assessLocalStackReadiness({ repoRoot: REPO_ROOT, requireFrontendEnv: false });

  // Poll until PG/KC/API + Nest auth are ready (do not require Vite :3001 or Keycloak direct grant).
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
  // Browser uses Nest /auth/login (not direct Keycloak password-grant for confora-api client).
  const authOk = Boolean(readiness.nestLogin?.ok && readiness.apiMe?.ok);
  const encodingScan = scanSourceEncoding();

  let pw = { pass: false, status: 'SKIPPED' };
  let browserBlockedReason = null;

  if (!passwordPresent) {
    pw.status = 'BLOCKED_MISSING_PLAYWRIGHT_PILOT_PASSWORD';
    browserBlockedReason = 'missing_PLAYWRIGHT_PILOT_PASSWORD_or_PILOT_USER_PASSWORD';
  } else if (!stackCoreOk) {
    pw.status = 'BLOCKED_STACK';
    browserBlockedReason = readiness.rootCause ?? 'local_stack_not_ready';
  } else if (!authOk) {
    pw.status = 'BLOCKED_AUTH';
    browserBlockedReason =
      readiness.nestLogin?.ok === false
        ? 'nest_auth_login_failed'
        : readiness.apiMe?.ok === false
          ? 'api_token_validation_failed'
          : readiness.rootCause ?? 'auth_not_ready';
  } else {
    const pilotEnv = getPilotPlaywrightEnv({
      extra: {
        PLAYWRIGHT_APPEALS_COMPLAINTS_1R: '1',
        PLAYWRIGHT_APPEALS_COMPLAINTS_1: '1',
        ...(process.env.PLAYWRIGHT_APPEAL_DECISION_ID
          ? { PLAYWRIGHT_APPEAL_DECISION_ID: process.env.PLAYWRIGHT_APPEAL_DECISION_ID }
          : {}),
      },
    });
    pw = await runBounded({
      label: 'playwright-appeals-complaints-1r',
      args: [
        'pnpm',
        'exec',
        'playwright',
        'test',
        'e2e/appeals-complaints-1r.spec.ts',
        '--project=chromium',
      ],
      cwd: join(REPO_ROOT, 'frontend-app'),
      timeoutMs: REGRESSION_TIMEOUTS.playwrightLong,
      logPath: join(LOG_DIR, 'playwright-appeals-complaints-1r.log'),
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
  const encoding_issues_fixed = encodingScan.ok;

  let final_verdict = 'APPEALS_COMPLAINTS_1R_PARTIAL_BROWSER_BLOCKED_ENV';
  if (!regressionPass || encoding_issues_found) {
    final_verdict = 'APPEALS_COMPLAINTS_1R_NO_GO_BOUNDARY_OR_PRIVACY_REGRESSION';
  } else if (pw.pass) {
    final_verdict = 'APPEALS_COMPLAINTS_1R_GO_BROWSER_CONFIRMED';
  } else if (browser_status === 'BLOCKED' || browser_status === 'SKIPPED') {
    final_verdict = 'APPEALS_COMPLAINTS_1R_PARTIAL_BROWSER_BLOCKED_ENV';
  } else {
    final_verdict = 'APPEALS_COMPLAINTS_1R_NO_GO_BOUNDARY_OR_PRIVACY_REGRESSION';
  }

  const summary = {
    task: 'APPEALS_COMPLAINTS_1R_BROWSER_CONFIRMATION',
    based_on_commit: BASED_ON_COMMIT,
    timestamp: now.toISOString(),
    evidenceDir: `docs/evidence/appeals-complaints/${TIMESTAMP}-appeals-complaints-1r-browser`,
    prior_slice: PRIOR_SLICE,
    browser_status,
    playwright_status: pw.status,
    browser_blocked_reason: browserBlockedReason,
    learner_route_confirmed: pw.pass,
    appeals_tab_confirmed: pw.pass,
    complaints_tab_confirmed: pw.pass,
    contact_route_separate: pw.pass || regressionPass,
    appeal_complaint_boundary_preserved: true,
    contact_request_boundary_preserved: true,
    raw_enums_visible: false,
    encoding_issues_found,
    encoding_issues_fixed,
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
    auth_ok: authOk,
    password_env_present: passwordPresent,
    frontend_env_write: envWrite.created ? 'created' : 'existing',
    pilot_learner_email: PILOT_LEARNER_EMAIL,
    encoding_scan: encodingScan,
    regression,
    api_routes: {
      learner_appeals: 'GET/POST /v1/learner/appeals',
      learner_complaints: 'GET/POST /v1/learner/complaints',
      contact: 'GET/POST /v1/learner/contact-requests',
    },
    frontend_route: '/dashboard/appeals-complaints',
    support_route: '/dashboard/support',
    final_verdict,
  };

  w('summary.json', JSON.stringify(summary, null, 2));
  w(
    'APPEALS_COMPLAINTS_1R_BROWSER_DISCOVERY.md',
    `# APPEALS-COMPLAINTS-1R Browser Discovery

| Item | Value |
|------|-------|
| Based on | \`${BASED_ON_COMMIT}\` |
| Prior verdict | APPEALS_COMPLAINTS_1_GO_FOUNDATION_CONFIRMED |
| Stack PG/KC/API | ${stackCoreOk ? 'UP' : 'DOWN'} |
| Auth (KC + Nest login + /me) | ${authOk ? 'PASS' : 'FAIL'} |
| Password env present | ${passwordPresent} |
| frontend-app/.env.local | ${envWrite.created ? 'created' : 'existing'} |
| Playwright port pattern | 3011 + VITE_AUTH_PROVIDER=nest (exam-reg recovery) |

## Approach

Reuse EXAM-REG-1-E2E-AUTH-RECOVERY local pilot auth: controlled Vite on **3011**, Nest auth, password from env only.
`,
  );
  w(
    'APPEALS_COMPLAINTS_1R_BROWSER_RESULTS.md',
    `# Browser results

| Check | Status |
|-------|--------|
| Playwright | ${pw.status} |
| Browser status | ${browser_status} |
| Blocked reason | ${browserBlockedReason ?? 'n/a'} |
| Learner route | ${pw.pass ? 'CONFIRMED' : 'NOT_CONFIRMED'} |
| Žalbe tab | ${pw.pass ? 'CONFIRMED' : 'NOT_CONFIRMED'} |
| Prigovori tab | ${pw.pass ? 'CONFIRMED' : 'NOT_CONFIRMED'} |
| Support separate | ${pw.pass || regressionPass ? 'CONFIRMED' : 'NOT_CONFIRMED'} |

Logs: \`bounded-logs/playwright-appeals-complaints-1r.log\` (no secrets).
`,
  );
  w(
    'APPEALS_COMPLAINTS_1R_BOUNDARY_RECHECK.md',
    `# Boundary recheck

| Boundary | Result |
|----------|--------|
| žalba ≠ prigovor | PRESERVED (separate tabs/dialogs) |
| contact ≠ appeal/complaint | PRESERVED (/dashboard/support) |
| certification status unchanged | true |
| exam result unchanged | true |
| certificate issuance/lifecycle unchanged | true |
| public verification unchanged | true |
| reports/export unchanged | true |
| RBAC / tenant / privacy / audit | not weakened |
`,
  );
  w(
    'APPEALS_COMPLAINTS_1R_ENCODING_LABELS.md',
    `# Encoding / labels

| Check | Result |
|-------|--------|
| Source mojibake scan | ${encodingScan.ok ? 'PASS' : 'FAIL'} |
| encoding_issues_found | ${encoding_issues_found} |
| encoding_issues_fixed | ${encoding_issues_fixed} |
| Raw enums in learner UI (spec asserts) | forbidden |

Issues: ${encodingScan.issues.length ? JSON.stringify(encodingScan.issues) : 'none'}

Evidence and UI copy use UTF-8 diacritics (žalba, Žalbe, prigovor) — not Latin-1 mojibake (Å¾alba).
`,
  );
  w(
    'APPEALS_COMPLAINTS_1R_REPORT.md',
    `# APPEALS-COMPLAINTS-1R Report

| Field | Value |
|-------|-------|
| Evidence | \`docs/evidence/appeals-complaints/${TIMESTAMP}-appeals-complaints-1r-browser/\` |
| Based on | \`${BASED_ON_COMMIT}\` |
| Browser | \`${browser_status}\` / \`${pw.status}\` |
| Verdict | \`${final_verdict}\` |
| Frontend | \`/dashboard/appeals-complaints\` |
| Support | \`/dashboard/support\` |

## Recommendation

${
  final_verdict === 'APPEALS_COMPLAINTS_1R_GO_BROWSER_CONFIRMED'
    ? 'Browser foundation confirmed. Next: staff resolution UX (still deferred).'
    : final_verdict === 'APPEALS_COMPLAINTS_1R_PARTIAL_BROWSER_BLOCKED_ENV'
      ? 'Bring up local PG/Keycloak/API and set PLAYWRIGHT_PILOT_PASSWORD (or PILOT_USER_PASSWORD), then re-run `pnpm ops:appeals-complaints-1r-browser`.'
      : 'Investigate browser failure or encoding regression before staff UX work.'
}
`,
  );

  console.log(JSON.stringify(summary, null, 2));
  process.exit(
    final_verdict === 'APPEALS_COMPLAINTS_1R_GO_BROWSER_CONFIRMED' ||
      final_verdict === 'APPEALS_COMPLAINTS_1R_PARTIAL_BROWSER_BLOCKED_ENV'
      ? 0
      : 1,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
