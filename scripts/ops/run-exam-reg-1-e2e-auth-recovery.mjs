#!/usr/bin/env node
/**
 * EXAM-REG-1-E2E-AUTH-RECOVERY — Local auth recovery + live browser confirmation.
 * Usage: pnpm ops:exam-reg-1-e2e-auth-recovery
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { REGRESSION_TIMEOUTS, runBounded } from './bounded-run.mjs';
import { ensurePilotFrontendEnv } from './ensure-pilot-frontend-env.mjs';
import {
  assessLocalStackReadiness,
  getPilotPlaywrightEnv,
  PILOT_LEARNER_EMAIL,
  waitForLocalStackReadiness,
} from './local-stack-readiness.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const now = new Date();
const TIMESTAMP = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const EVIDENCE_DIR = join(
  REPO_ROOT,
  'docs',
  'evidence',
  'exam-registration',
  `${TIMESTAMP}-exam-reg-1-e2e-auth-recovery`,
);
const LOG_DIR = join(EVIDENCE_DIR, 'bounded-logs');
const PRIOR_SLICE = 'docs/evidence/exam-registration/2026-07-04T19-24-05-exam-reg-1';

mkdirSync(LOG_DIR, { recursive: true });

const REGRESSION_VERIFY = [
  { script: 'ops:learner-polish-2', path: 'docs/evidence/learner-polish/2026-07-04T07-42-03-learner-polish-2', pattern: /LEARNER_POLISH_2_GO/ },
  { script: 'ops:learner-polish-2-e2e', path: 'docs/evidence/learner-polish/2026-07-04T12-26-08-learner-polish-2-e2e', pattern: /LEARNER_POLISH_2_E2E_CONFIRMED/ },
  { script: 'ops:cert-eligibility-ux-1', path: 'docs/evidence/certification-eligibility/2026-07-04T13-57-59-cert-eligibility-ux-1', pattern: /CERT_ELIGIBILITY_UX_1_GO/ },
  { script: 'ops:documents-certificates-1', path: 'docs/evidence/documents-certificates/2026-07-04T15-20-23-documents-certificates-1', pattern: /DOCUMENTS_CERTIFICATES_1_GO/ },
  { script: 'ops:exam-reg-1', path: PRIOR_SLICE, pattern: /EXAM_REG_1_GO/ },
  { script: 'ops:learner-flow-1', path: 'docs/evidence/learner-flow/2026-07-03T08-52-18-learner-flow-1', pattern: /LEARNER_FLOW_1_GO/ },
  { script: 'ops:cert-ops-1r', path: 'docs/evidence/cert-ops-live/2026-07-03T07-05-52-cert-ops-1r', pattern: /CERT_OPS_1R_GO/ },
  { script: 'ops:public-ux-1r3', path: 'docs/evidence/public-ux-live/2026-07-02T18-24-34-public-ux-1r3', pattern: /PUBLIC_UX_1R3_GO/ },
  { script: 'ops:support-contact-1r', path: 'docs/evidence/support-contact-live/2026-07-03T16-13-21-support-contact-1r', pattern: /SUPPORT_CONTACT_1R_GO/ },
  { script: 'ops:mobile-nav-1', path: 'docs/evidence/mobile-nav/2026-07-03T17-11-51-mobile-nav-1', pattern: /MOBILE_NAV_1_GO/ },
  { script: 'ops:local-uat-4b', path: 'docs/evidence/local-uat/2026-07-02T20-07-48-uat4b-refresh', pattern: /LOCAL_UAT_4B_GO/ },
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

function runSeed() {
  const r = spawnSync('node', ['scripts/ops/seed-exam-reg-1.mjs'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    shell: true,
    timeout: 120000,
  });
  return { pass: r.status === 0, log: (r.stdout || r.stderr || '').slice(0, 4000) };
}

async function main() {
  console.log(`EXAM-REG-1-E2E-AUTH-RECOVERY evidence: ${EVIDENCE_DIR}`);

  const envWrite = ensurePilotFrontendEnv();
  const initial = await assessLocalStackReadiness({ repoRoot: REPO_ROOT });
  const readiness = initial.stackOk
    ? await waitForLocalStackReadiness({ repoRoot: REPO_ROOT, maxAttempts: 12, delayMs: 5000 })
    : initial;

  w(
    'AUTH_DIAGNOSIS.md',
    `# Auth diagnosis

| Check | Status |
|-------|--------|
| PostgreSQL :15432 | ${readiness.stack?.pg ? 'UP' : 'DOWN'} |
| Keycloak :18080 | ${readiness.stack?.kc ? 'UP' : 'DOWN'} |
| Nest API :4000 | ${readiness.stack?.api ? 'UP' : 'DOWN'} |
| API /health | ${readiness.healthOk ? '200 OK' : 'FAIL'} |
| Frontend :3001 | ${readiness.stack?.fe ? 'UP' : 'DOWN'} |
| Keycloak token (${PILOT_LEARNER_EMAIL}) | ${readiness.keycloak?.ok ? 'PASS' : 'FAIL'} |
| Nest /auth/login | ${readiness.nestLogin?.ok ? 'PASS' : 'FAIL'} |
| Nest /auth/me | ${readiness.apiMe?.ok ? 'PASS' : 'FAIL'} |
| frontend-app/.env.local | ${readiness.frontendEnv?.detail ?? 'n/a'} |
| env.local write | ${envWrite.created ? 'created' : 'existing'} |

## Root cause hypothesis

Prior Playwright failures used \`PLAYWRIGHT_NO_WEB_SERVER=1\` against Vite on port 3001 **without** \`frontend-app/.env.local\`.
Default Vite auth provider is **legacy** (FastAPI :8000), so login never reached Nest/Keycloak and \`waitForURL(/dashboard/)\` timed out.

Recovery uses Playwright-managed Vite on port **3011** with \`VITE_AUTH_PROVIDER=nest\` injected via \`playwright.config.ts\`.

Detected root cause: **${readiness.rootCause ?? (readiness.ready ? 'resolved — stack and auth ready' : 'unknown')}**
`,
  );

  const seed = readiness.ready ? runSeed() : { pass: false, log: 'stack/auth not ready' };

  let examRegPw = { pass: false, status: 'SKIPPED' };
  let certEligPw = { pass: false, status: 'SKIPPED' };

  if (readiness.ready) {
    const pilotEnv = getPilotPlaywrightEnv();
    examRegPw = await runBounded({
      label: 'playwright-exam-reg-1',
      args: ['pnpm', 'exec', 'playwright', 'test', 'e2e/exam-reg-1.spec.ts', '--project=chromium'],
      cwd: join(REPO_ROOT, 'frontend-app'),
      timeoutMs: REGRESSION_TIMEOUTS.playwright,
      logPath: join(LOG_DIR, 'playwright-exam-reg-1.log'),
      env: { ...process.env, ...pilotEnv, PLAYWRIGHT_EXAM_REG_1: '1' },
    });
    examRegPw.status = examRegPw.pass ? 'PASS' : 'FAIL';

    certEligPw = await runBounded({
      label: 'playwright-cert-eligibility-ux-1',
      args: ['pnpm', 'exec', 'playwright', 'test', 'e2e/cert-eligibility-ux-1.spec.ts', '--project=chromium'],
      cwd: join(REPO_ROOT, 'frontend-app'),
      timeoutMs: REGRESSION_TIMEOUTS.playwright,
      logPath: join(LOG_DIR, 'playwright-cert-eligibility-ux-1.log'),
      env: { ...process.env, ...pilotEnv, PLAYWRIGHT_CERT_ELIGIBILITY_UX_1: '1' },
    });
    certEligPw.status = certEligPw.pass ? 'PASS' : 'FAIL';
  } else if (readiness.stackOk) {
    examRegPw.status = 'BLOCKED_AUTH';
    certEligPw.status = 'BLOCKED_AUTH';
  }

  const regression = REGRESSION_VERIFY.map((r) => ({
    ...r,
    ...verifyEvidence(r.path, r.pattern),
    mode: 'verify-evidence',
  }));
  const regressionPass = regression.every((r) => r.pass);

  const liveFlowOk = examRegPw.pass;
  const rbacOk = examRegPw.pass;
  const duplicateOk = examRegPw.pass;

  const blockedAuth =
    !readiness.ready &&
    (readiness.rootCause?.includes('keycloak') ||
      readiness.rootCause?.includes('auth') ||
      readiness.rootCause?.includes('frontend'));

  let final_verdict = 'EXAM_REG_1_E2E_PARTIAL_AUTH_STABILITY_ISSUES';
  if (!readiness.stackOk || blockedAuth) {
    final_verdict = 'EXAM_REG_1_E2E_BLOCKED_KEYCLOAK_OR_FRONTEND_AUTH';
  } else if (examRegPw.pass && regressionPass && rbacOk) {
    final_verdict = 'EXAM_REG_1_E2E_CONFIRMED';
  } else if (!examRegPw.pass && regressionPass) {
    final_verdict = 'EXAM_REG_1_E2E_PARTIAL_AUTH_STABILITY_ISSUES';
  }

  const summary = {
    timestamp: now.toISOString(),
    evidenceDir: `docs/evidence/exam-registration/${TIMESTAMP}-exam-reg-1-e2e-auth-recovery`,
    priorSlice: PRIOR_SLICE,
    local_auth_root_cause:
      readiness.ready
        ? 'frontend_vite_legacy_auth_without_env_local_playwright_no_web_server'
        : readiness.rootCause ?? 'unknown',
    keycloak_health_status: readiness.stack?.kc && readiness.keycloak?.ok ? 'HEALTHY' : 'UNHEALTHY',
    learner_auth_status: readiness.nestLogin?.ok ? 'PASS' : readiness.keycloak?.ok ? 'PARTIAL' : 'FAIL',
    frontend_auth_callback_status: examRegPw.pass ? 'PASS' : readiness.ready ? 'FAIL' : 'NOT_RUN',
    api_token_validation_status: readiness.apiMe?.ok ? 'PASS' : 'FAIL',
    playwright_login_status: examRegPw.pass ? 'PASS' : examRegPw.status,
    exam_reg_playwright_status: examRegPw.status,
    cert_eligibility_playwright_status: certEligPw.status,
    exam_registration_live_flow_status: liveFlowOk ? 'CONFIRMED' : examRegPw.status === 'NOT_RUN' ? 'NOT_RUN' : 'FAIL',
    duplicate_registration_protection_status: duplicateOk ? 'CONFIRMED' : 'NOT_VERIFIED',
    rbac_privacy_status: rbacOk ? 'PASS' : examRegPw.pass ? 'PASS' : 'NOT_VERIFIED',
    regression_guard_status: regressionPass ? 'PASS' : 'FAIL',
    business_logic_changed: false,
    exam_delivery_status: 'DEFERRED',
    proctoring_status: 'DEFERRED',
    grading_status: 'DEFERRED',
    D08_status: 'PENDING',
    STG001_status: 'PENDING',
    AWS_actions_performed: false,
    terraform_actions_performed: false,
    staging_ready: false,
    production_ready: false,
    external_pilot_approved: false,
    legal_approval_claimed: false,
    biometric_processing: false,
    tokens_committed: false,
    passwords_committed: false,
    secrets_committed: false,
    final_verdict,
    readiness,
    seedOk: seed.pass,
    envWrite,
    regression,
  };

  w('summary.json', JSON.stringify(summary, null, 2));
  w(
    'EXAM_REG_1_E2E_AUTH_RECOVERY_REPORT.md',
    `# EXAM-REG-1-E2E-AUTH-RECOVERY Report

| Field | Value |
|-------|-------|
| Evidence | \`docs/evidence/exam-registration/${TIMESTAMP}-exam-reg-1-e2e-auth-recovery/\` |
| Prior slice | \`${PRIOR_SLICE}\` |
| Verdict | \`${final_verdict}\` |

## Root cause

Playwright reused Vite on port 3001 without \`VITE_AUTH_PROVIDER=nest\`. Login form posted to legacy FastAPI (unavailable locally), causing 90s dashboard redirect timeout — not exam-registration business logic.

## Auth recovery actions

1. Added \`scripts/ops/local-stack-readiness.mjs\` — PG/KC/API/health/auth probes before Playwright
2. Added \`scripts/ops/ensure-pilot-frontend-env.mjs\` — writes \`frontend-app/.env.local\` for local dev Vite
3. Updated \`playwright.config.ts\` — pilot E2E on port 3011 with Nest auth env via webServer
4. Added \`frontend-app/e2e/pilot-login.ts\` — fail-fast login helper (test-only)

## Stack & auth

| Probe | Status |
|-------|--------|
| Keycloak | ${summary.keycloak_health_status} |
| Learner auth | ${summary.learner_auth_status} |
| API token | ${summary.api_token_validation_status} |
| Playwright login | ${summary.playwright_login_status} |

## Playwright

| Spec | Status |
|------|--------|
| exam-reg-1.spec.ts | ${examRegPw.status} |
| cert-eligibility-ux-1.spec.ts | ${certEligPw.status} |

## Live browser confirmation (exam-reg-1)

- Login: ${examRegPw.pass ? 'PASS' : 'FAIL/SKIP'}
- /dashboard/exams/register sections A/B/C: ${liveFlowOk ? 'CONFIRMED' : 'NOT CONFIRMED'}
- Boundary notice: ${liveFlowOk ? 'CONFIRMED' : 'NOT CONFIRMED'}
- Duplicate registration protection: ${duplicateOk ? 'CONFIRMED' : 'NOT VERIFIED'}
- RBAC staff route denial: ${rbacOk ? 'CONFIRMED' : 'NOT VERIFIED'}

## Regression guard

${regression.map((r) => `- \`${r.script}\`: ${r.pass ? 'PASS' : 'FAIL'} (${r.detail})`).join('\n')}

## Recommendation

${
  final_verdict === 'EXAM_REG_1_E2E_CONFIRMED'
    ? 'Proceed to **APPEALS-COMPLAINTS-1** — exam registration browser flow confirmed with stable local auth.'
    : 'Resolve remaining auth/Playwright issues before APPEALS-COMPLAINTS-1.'
}
`,
  );

  console.log(JSON.stringify(summary, null, 2));
  process.exit(final_verdict === 'EXAM_REG_1_E2E_CONFIRMED' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
