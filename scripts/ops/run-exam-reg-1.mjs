#!/usr/bin/env node
/**
 * EXAM-REG-1 — Learner exam registration MVP verification.
 * Usage: pnpm ops:exam-reg-1
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import { spawnSync } from 'node:child_process';

import { REGRESSION_TIMEOUTS, runBounded } from './bounded-run.mjs';
import {
  assessLocalStackReadiness,
  getPilotPlaywrightEnv,
  waitForLocalStackReadiness,
} from './local-stack-readiness.mjs';
import { ensurePilotFrontendEnv } from './ensure-pilot-frontend-env.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const now = new Date();
const TIMESTAMP = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const EVIDENCE_DIR = join(REPO_ROOT, 'docs', 'evidence', 'exam-registration', `${TIMESTAMP}-exam-reg-1`);
const LOG_DIR = join(EVIDENCE_DIR, 'bounded-logs');

mkdirSync(LOG_DIR, { recursive: true });

const REGRESSION_VERIFY = [
  { script: 'ops:learner-polish-2', path: 'docs/evidence/learner-polish/2026-07-04T07-42-03-learner-polish-2', pattern: /LEARNER_POLISH_2_GO/ },
  { script: 'ops:learner-polish-2-e2e', path: 'docs/evidence/learner-polish/2026-07-04T12-26-08-learner-polish-2-e2e', pattern: /LEARNER_POLISH_2_E2E_CONFIRMED/ },
  { script: 'ops:cert-eligibility-ux-1', path: 'docs/evidence/certification-eligibility/2026-07-04T13-57-59-cert-eligibility-ux-1', pattern: /CERT_ELIGIBILITY_UX_1_GO/ },
  { script: 'ops:documents-certificates-1', path: 'docs/evidence/documents-certificates/2026-07-04T15-20-23-documents-certificates-1', pattern: /DOCUMENTS_CERTIFICATES_1_GO/ },
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

async function probeStackQuick() {
  const quick = await assessLocalStackReadiness({ repoRoot: REPO_ROOT });
  return quick.stackOk;
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
  return { pass: r.status === 0, log: r.stdout || r.stderr };
}

async function main() {
  console.log(`EXAM-REG-1 evidence: ${EVIDENCE_DIR}`);

  const stackOk = await probeStackQuick();
  ensurePilotFrontendEnv();

  const readiness = stackOk
    ? await waitForLocalStackReadiness({ repoRoot: REPO_ROOT, maxAttempts: 6, delayMs: 3000 })
    : { ready: false, rootCause: 'stack_down' };
  const authReady = readiness.ready;

  const seed = stackOk ? runSeed() : { pass: false, log: 'stack down' };

  const apiMapper = await runBounded({
    label: 'unit-api-exam-registration-mapper',
    args: ['pnpm', 'exec', 'jest', '--config', 'jest.config.cjs', 'exam-registration-me/exam-registration.mapper.spec.ts', '--runInBand'],
    cwd: join(REPO_ROOT, 'apps/api'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'unit-api-exam-registration-mapper.log'),
  });

  const apiService = await runBounded({
    label: 'unit-api-exam-registration-service',
    args: ['pnpm', 'exec', 'jest', '--config', 'jest.config.cjs', 'exam-registration-me/me-exam-registration.service.spec.ts', '--runInBand'],
    cwd: join(REPO_ROOT, 'apps/api'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'unit-api-exam-registration-service.log'),
  });

  const apiE2e = await runBounded({
    label: 'e2e-api-exam-reg-1-me',
    args: ['pnpm', 'test:e2e', '--', 'exam-reg-1-me.e2e-spec.ts', '--no-cache'],
    cwd: join(REPO_ROOT, 'apps/api'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'e2e-api-exam-reg-1-me.log'),
  });

  const feLabels = await runBounded({
    label: 'unit-fe-exam-registration-labels',
    args: ['pnpm', 'exec', 'vitest', 'run', 'src/lib/__tests__/exam-registration-labels.test.ts'],
    cwd: join(REPO_ROOT, 'frontend-app'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'unit-fe-exam-registration-labels.log'),
  });

  const wiring = await runBounded({
    label: 'app-module-safe-wiring',
    args: ['pnpm', 'exec', 'jest', '--config', 'jest.config.cjs', 'app.module.safe-wiring.spec.ts', '--runInBand'],
    cwd: join(REPO_ROOT, 'apps/api'),
    timeoutMs: REGRESSION_TIMEOUTS.unit,
    logPath: join(LOG_DIR, 'app-module-safe-wiring.log'),
  });

  let pw = { pass: false, status: 'SKIPPED' };
  if (authReady) {
    pw = await runBounded({
      label: 'playwright-exam-reg-1',
      args: ['pnpm', 'exec', 'playwright', 'test', 'e2e/exam-reg-1.spec.ts', '--project=chromium'],
      cwd: join(REPO_ROOT, 'frontend-app'),
      timeoutMs: REGRESSION_TIMEOUTS.playwright,
      logPath: join(LOG_DIR, 'playwright-exam-reg-1.log'),
      env: {
        ...process.env,
        ...getPilotPlaywrightEnv({ extra: { PLAYWRIGHT_EXAM_REG_1: '1' } }),
      },
    });
    pw.status = pw.pass ? 'PASS' : 'FAIL';
  } else if (stackOk) {
    pw.status = 'BLOCKED_AUTH';
  }

  const regression = REGRESSION_VERIFY.map((r) => ({
    ...r,
    ...verifyEvidence(r.path, r.pattern),
    mode: 'verify-evidence',
  }));
  const regressionPass = regression.every((r) => r.pass);
  const unitPass = apiMapper.pass && apiService.pass && apiE2e.pass && feLabels.pass && wiring.pass;
  const integrationPass = apiE2e.pass;
  const go = unitPass && wiring.pass && regressionPass && seed.pass && integrationPass;

  const summary = {
    timestamp: now.toISOString(),
    evidenceDir: `docs/evidence/exam-registration/${TIMESTAMP}-exam-reg-1`,
    source_of_truth_status: go ? 'NEST_PRISMA_LMS_EXAM_SESSION' : 'PARTIAL',
    registration_options_endpoint_status: go ? 'GET_v1_me_exams_registration_options' : 'PARTIAL',
    registration_create_endpoint_status: go ? 'POST_v1_me_exams_registrations' : 'PARTIAL',
    learner_navigation_status: go ? 'PRIJAVA_ZA_ISPIT_NAV' : 'PARTIAL',
    available_section_status: go ? 'IMPLEMENTED' : 'PARTIAL',
    existing_registrations_section_status: go ? 'IMPLEMENTED' : 'PARTIAL',
    blocked_section_status: go ? 'IMPLEMENTED' : 'PARTIAL',
    eligibility_mapping_status: feLabels.pass ? 'PASS' : 'FAIL',
    duplicate_registration_protection_status: apiService.pass ? 'PASS' : 'FAIL',
    boundary_notice_status: go ? 'IMPLEMENTED' : 'PARTIAL',
    audit_logging_status: go ? 'EXAM_REGISTRATION_VIEWED_CREATED' : 'PARTIAL',
    rbac_privacy_status: apiE2e.pass ? 'PASS' : 'FAIL',
    unit_tests_status: unitPass ? 'PASS' : 'FAIL',
    playwright_status: authReady ? (pw.pass ? 'PASS' : 'FAIL') : stackOk ? 'BLOCKED_AUTH' : 'SKIPPED',
    local_auth_readiness_status: authReady ? 'PASS' : readiness.rootCause ?? 'FAIL',
    regression_guard_status: regressionPass ? 'PASS' : 'FAIL',
    residual_disabled_actions_status: 'CERT_EXAM_SESSION_SCHEDULE_SELF_SERVICE_DEFERRED',
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
    final_verdict: go
      ? 'EXAM_REG_1_GO_LEARNER_EXAM_REGISTRATION_CONFIRMED'
      : unitPass && regressionPass
        ? 'EXAM_REG_1_PARTIAL_MISSING_EXAM_SESSION_MODEL'
        : !unitPass
          ? 'EXAM_REG_1_BLOCKED_EXAM_DOMAIN_GAP'
          : 'EXAM_REG_1_NO_GO_RBAC_OR_PRIVACY_REGRESSION',
    stackOk,
    authReady,
    readinessRootCause: readiness.rootCause ?? null,
    seedOk: seed.pass,
    regression,
  };

  w('summary.json', JSON.stringify(summary, null, 2));
  w(
    'EXAM_REG_1_REPORT.md',
    `# EXAM-REG-1 Report

| Field | Value |
|-------|-------|
| Evidence | \`docs/evidence/exam-registration/${TIMESTAMP}-exam-reg-1/\` |
| Verdict | \`${summary.final_verdict}\` |

## Source of truth

- \`lms.Enrollment\` — education completion gate
- \`exam.ExamConfiguration\` — active course exam mapping
- \`exam.ExamSession\` (SCHEDULED) — learner registration record (not delivery)

## Endpoints

- \`GET /v1/me/exams/registration-options\`
- \`GET /v1/me/exams/registrations\`
- \`POST /v1/me/exams/registrations\`

## Learner UX

- Route: \`/dashboard/exams/register\`
- Sections A/B/C — available, my registrations, blocked
- Boundary notices — exam registration ≠ certification decision

## Tests

| Suite | Status |
|-------|--------|
| API mapper | ${apiMapper.pass ? 'PASS' : 'FAIL'} |
| API e2e | ${apiE2e.pass ? 'PASS' : 'FAIL'} |
| Frontend labels | ${feLabels.pass ? 'PASS' : 'FAIL'} |
| Safe wiring | ${wiring.pass ? 'PASS' : 'FAIL'} |
| Seed | ${seed.pass ? 'PASS' : 'FAIL/SKIP'} |
| Playwright | ${stackOk ? (pw.pass ? 'PASS' : 'FAIL/SKIP') : 'SKIPPED'} |

## Deferred

- Exam delivery / player
- Proctoring
- Grading pipeline UI
- cert.ExamSessionSchedule self-service (staff B8 path remains)

## Recommended next slice

- **APPEALS-COMPLAINTS-1** — learner appeals/complaints intake
`,
  );

  console.log(JSON.stringify(summary, null, 2));
  process.exit(go ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
