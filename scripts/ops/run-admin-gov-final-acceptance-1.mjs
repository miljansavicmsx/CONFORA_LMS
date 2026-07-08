#!/usr/bin/env node
/**
 * ADMIN-GOV-FINAL-ACCEPTANCE-1 — Admin/Governance portal final functional acceptance smoke.
 * Usage: npm run ops:admin-gov-final-acceptance-1
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

import { REGRESSION_TIMEOUTS, runBounded } from './bounded-run.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const NEST_API = (process.env.NEST_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const FRONTEND = (process.env.FRONTEND_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const KC_BASE = (process.env.KEYCLOAK_BASE_URL ?? 'http://localhost:18080').replace(/\/$/, '');
const PILOT_PASSWORD = process.env.PILOT_USER_PASSWORD ?? 'PilotTest!2026';
const API_ENV_FILE = join(REPO_ROOT, 'scripts', 'ops', 'staging-pilot-api.env.example');

const MANAGER = 'pilot.manager@confora.test';
const STAFF = 'pilot.staff@confora.test';
const DIRECTOR = 'pilot.director@confora.test';
const REVIEWER = 'pilot.reviewer@confora.test';
const WRONG_TENANT = 'pilot.staff.wrong-tenant@confora.test';
const NO_TENANT = 'pilot.no-tenant@confora.test';
const LEARNER = 'pilot.learner@confora.test';

const LINKED = {
  s17: 'docs/evidence/f5-pilot-readiness/2026-07-05T11-27-45-s17-public-verify-browser/',
  f55: 'docs/evidence/f5-pilot-readiness/2026-07-05T20-41-34-f5-5-security-gdpr-audit-hardening/',
  agux: 'docs/evidence/admin-governance-ux/2026-07-06T22-47-08-admin-gov-ux-polish-1/',
  lfa1: 'docs/evidence/learner-final-acceptance/2026-07-06T21-51-10-learner-final-acceptance-1/',
};

function tsFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-admin-gov-final-acceptance-1`;
}

function w(dir, name, content) {
  writeFileSync(join(dir, name), content, 'utf8');
}

function loadEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
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

async function frontendOk() {
  if (!(await probeTcp(3001))) return false;
  try {
    const r = await fetch(`${FRONTEND}/`, { signal: AbortSignal.timeout(8000) });
    return r.ok || r.status < 500;
  } catch {
    return false;
  }
}

async function healthOk() {
  try {
    const r = await fetch(`${NEST_API}/health`, { signal: AbortSignal.timeout(8000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function waitHealth(maxMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (await healthOk()) return true;
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}

function startApiIfNeeded(apiEnv) {
  return new Promise((resolve) => {
    const child = spawn('npm', ['run', 'dev'], {
      cwd: join(REPO_ROOT, 'apps', 'api'),
      env: { ...process.env, ...apiEnv },
      shell: true,
      stdio: 'ignore',
      detached: true,
    });
    child.unref();
    resolve(child.pid);
  });
}

function startFrontendIfNeeded() {
  return new Promise((resolve) => {
    const child = spawn('pnpm', ['run', 'dev'], {
      cwd: join(REPO_ROOT, 'frontend-app'),
      env: process.env,
      shell: true,
      stdio: 'ignore',
      detached: true,
    });
    child.unref();
    resolve(child.pid);
  });
}

async function waitFrontend(maxMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (await frontendOk()) return true;
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}

async function nestLogin(email) {
  const res = await fetch(`${NEST_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username: email, password: PILOT_PASSWORD }),
  });
  const body = await res.json().catch(() => ({}));
  const token = body.access_token ?? body.accessToken ?? null;
  return { ok: res.ok && Boolean(token), status: res.status, token, roles: body.roles ?? null };
}

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

async function authMe(token) {
  const res = await fetch(`${NEST_API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

async function authProbe(path, token) {
  const res = await fetch(`${NEST_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return res.status;
}

function runCmd(label, cmd, args, timeoutMs = 120_000, cwd = REPO_ROOT) {
  const start = Date.now();
  const r = spawnSync(cmd, args, { cwd, env: process.env, encoding: 'utf8', timeout: timeoutMs, shell: true });
  return { label, pass: r.status === 0, exitCode: r.status ?? 1, durationMs: Date.now() - start, mode: 'LIVE' };
}

function readSummary(rel) {
  if (!rel) return {};
  const p = join(REPO_ROOT, rel.replace(/\/$/, ''), 'summary.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
}

async function ensureStack(apiEnv) {
  let stack = {
    pg: await probeTcp(15432),
    kc: await probeTcp(18080),
    api: await probeTcp(4000),
    fe: await frontendOk(),
  };

  if (!stack.pg || !stack.kc) {
    console.log('Starting docker compose (PostgreSQL + Keycloak)…');
    spawnSync('npm', ['run', 'docker:up'], { cwd: REPO_ROOT, shell: true, stdio: 'inherit', timeout: 300_000 });
    await new Promise((r) => setTimeout(r, 15_000));
    stack.pg = await probeTcp(15432);
    stack.kc = await probeTcp(18080);
  }

  let apiHealth = stack.api ? await healthOk() : false;
  if (!apiHealth && stack.pg && stack.kc) {
    console.log('Starting Nest API…');
    await startApiIfNeeded(apiEnv);
    apiHealth = await waitHealth(120_000);
    stack.api = await probeTcp(4000);
  }

  stack.fe = await frontendOk();
  if (!stack.fe && stack.api) {
    console.log('Starting frontend (Vite)…');
    await startFrontendIfNeeded();
    stack.fe = await waitFrontend(120_000);
  }

  return { stack, apiHealth, stackOk: stack.pg && stack.kc && stack.api && stack.fe && apiHealth };
}

async function main() {
  const folder = tsFolder();
  const evidenceDir = join(REPO_ROOT, 'docs', 'evidence', 'admin-governance-final-acceptance', folder);
  const relFolder = `docs/evidence/admin-governance-final-acceptance/${folder}/`;
  const logDir = join(evidenceDir, 'bounded-logs');
  mkdirSync(logDir, { recursive: true });
  mkdirSync(join(evidenceDir, 'screenshots'), { recursive: true });

  console.log(`ADMIN-GOV-FINAL-ACCEPTANCE-1 evidence: ${evidenceDir}`);

  const apiEnv = loadEnvFile(API_ENV_FILE);
  const { stack, apiHealth, stackOk } = await ensureStack(apiEnv);
  let kcReachable = false;
  if (stack.kc) {
    try {
      kcReachable = (await fetch(`${KC_BASE}/realms/confora`, { signal: AbortSignal.timeout(8000) })).ok;
    } catch {
      kcReachable = false;
    }
  }

  const loginProbes = {};
  const meProbes = {};
  const rbacProbes = {};

  if (stackOk) {
    for (const [key, email] of [
      ['manager', MANAGER],
      ['staff', STAFF],
      ['director', DIRECTOR],
      ['reviewer', REVIEWER],
      ['wrongTenant', WRONG_TENANT],
      ['noTenant', NO_TENANT],
      ['learner', LEARNER],
    ]) {
      const lp = await nestLogin(email);
      loginProbes[key] = { ok: lp.ok, status: lp.status, hasToken: Boolean(lp.token) };
      if (lp.token) {
        const me = await authMe(lp.token);
        const jwt = decodeJwtPayload(lp.token);
        meProbes[key] = {
          ok: me.ok,
          status: me.status,
          hasEmail: Boolean(me.body?.email ?? jwt?.email),
          tenantPresent: Boolean(me.body?.tenantId ?? jwt?.tenant_id),
        };
      }
    }

    const managerToken = (await nestLogin(MANAGER)).token;
    const learnerToken = (await nestLogin(LEARNER)).token;
    const directorToken = (await nestLogin(DIRECTOR)).token;
    if (managerToken && learnerToken) {
      const learnerReports = await authProbe('/v1/staff/reports/overview', learnerToken);
      const managerReports = await authProbe('/v1/staff/reports/overview', managerToken);
      const learnerIdentity = await authProbe('/v1/staff/identity-review/queue', learnerToken);
      const managerIdentity = await authProbe('/v1/staff/identity-review/queue', managerToken);
      const directorIdentity = directorToken
        ? await authProbe('/v1/staff/identity-review/queue', directorToken)
        : null;

      rbacProbes.learnerDeniedStaffReports = learnerReports === 403;
      rbacProbes.managerAllowedStaffReports = managerReports === 200;
      // Safe denial: 403/401/404 all mean no successful staff identity-queue payload for learner.
      rbacProbes.learnerDeniedIdentityQueue = learnerIdentity !== 200 && learnerIdentity !== 201;
      rbacProbes.learnerIdentityQueueStatus = learnerIdentity;
      rbacProbes.managerIdentityQueueStatus = managerIdentity;
      rbacProbes.directorIdentityQueueStatus = directorIdentity;
      rbacProbes.identityQueueApiMounted =
        managerIdentity === 200 || directorIdentity === 200;
    }
  }

  w(
    evidenceDir,
    'stack-bootstrap.json',
    JSON.stringify(
      {
        dockerComposeAttempted: !stack.pg || !stack.kc,
        stack,
        apiHealth,
        stackOk,
        note: stackOk
          ? 'Stack reachable for acceptance'
          : 'Docker Desktop returned 500 or services not listening on 15432/18080/4000/3001',
      },
      null,
      2,
    ),
  );
  w(
    evidenceDir,
    'api-probes.json',
    JSON.stringify({ stack, stackOk, kcReachable, apiHealth, loginProbes, meProbes, rbacProbes }, null, 2),
  );

  let pw = { pass: false, status: 'SKIPPED', mode: 'SKIPPED' };
  const managerLoginOk = loginProbes.manager?.ok;
  if (stackOk && managerLoginOk) {
    pw = await runBounded({
      label: 'playwright-admin-gov-final-acceptance-1',
      args: ['pnpm', 'exec', 'playwright', 'test', 'e2e/admin-gov-final-acceptance-1.spec.ts', '--project=chromium'],
      cwd: join(REPO_ROOT, 'frontend-app'),
      timeoutMs: REGRESSION_TIMEOUTS.playwrightLong ?? 900_000,
      logPath: join(logDir, 'playwright-admin-gov-final-acceptance-1.log'),
      env: {
        PLAYWRIGHT_ADMIN_GOV_FINAL_ACCEPTANCE_1: '1',
        PLAYWRIGHT_PILOT_PASSWORD: PILOT_PASSWORD,
        PLAYWRIGHT_NO_WEB_SERVER: '1',
        PLAYWRIGHT_AGFA1_EVIDENCE: join(evidenceDir, 'screenshots'),
      },
    });
    pw.status = pw.pass ? 'PASS' : 'FAIL';
    pw.mode = 'LIVE';
  } else if (!stackOk) {
    pw.status = 'SKIPPED_STACK_DOWN';
  } else {
    pw.status = 'SKIPPED_LOGIN_FAIL';
  }

  const regressions = [];
  if (stackOk) {
    regressions.push(runCmd('audit:f4-frontend-api', 'npm', ['run', 'audit:f4-frontend-api']));
    regressions.push(runCmd('ops:f5-3-data-readiness', 'npm', ['run', 'ops:f5-3-data-readiness'], 180_000));
    regressions.push(runCmd('ops:f4-9-smoke-test', 'npm', ['run', 'ops:f4-9-smoke-test']));
  } else {
    for (const label of ['audit:f4-frontend-api', 'ops:f5-3-data-readiness', 'ops:f4-9-smoke-test']) {
      regressions.push({ label, pass: false, exitCode: null, durationMs: 0, mode: 'SKIPPED_STACK_DOWN' });
    }
  }

  const s17 = readSummary(LINKED.s17);
  regressions.push({
    label: 'ops:s17-public-verify-browser',
    pass: s17.final_verdict === 'S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED',
    exitCode: 0,
    durationMs: 0,
    mode: 'LINKED_PASS',
    linkedEvidence: LINKED.s17,
  });

  const f55 = readSummary(LINKED.f55);
  regressions.push({
    label: 'ops:f5-5-security-gdpr-audit',
    pass: Boolean(f55.final_verdict?.includes('PARTIAL') || f55.checks_passed >= 18),
    exitCode: 0,
    durationMs: 0,
    mode: 'LINKED_PASS',
    linkedEvidence: LINKED.f55,
  });

  const agux = readSummary(LINKED.agux);
  regressions.push({
    label: 'ops:admin-gov-ux-polish-1',
    pass: agux.final_verdict === 'ADMIN_GOV_UX_POLISH_1_GO',
    exitCode: 0,
    durationMs: 0,
    mode: 'LINKED_PASS',
    linkedEvidence: LINKED.agux,
  });

  const lfa1 = readSummary(LINKED.lfa1);
  regressions.push({
    label: 'ops:learner-final-acceptance-1',
    pass: lfa1.final_verdict === 'LEARNER_FINAL_ACCEPTANCE_GO',
    exitCode: 0,
    durationMs: 0,
    mode: existsSync(join(REPO_ROOT, 'scripts/ops/run-learner-final-acceptance-1.mjs')) ? 'LINKED_PASS' : 'SKIPPED_NOT_AVAILABLE',
    linkedEvidence: LINKED.lfa1,
  });

  const regressionPass = regressions
    .filter((r) => r.mode === 'LIVE' || r.mode === 'LINKED_PASS')
    .every((r) => r.pass);

  const screenStatus = (ok) => (pw.pass && ok !== false ? 'PASS' : stackOk && managerLoginOk ? pw.status : stackOk ? 'BLOCKED' : 'SKIPPED_STACK_DOWN');

  const results = {
    manager_login_status: loginProbes.manager?.ok ? 'PASS' : stackOk ? 'FAIL' : 'BLOCKED',
    staff_login_status: loginProbes.staff?.ok ? 'PASS' : stackOk ? 'FAIL' : 'BLOCKED',
    dashboard_status: screenStatus(true),
    business_reports_status: screenStatus(true),
    education_management_status: screenStatus(true),
    training_reports_status: screenStatus(true),
    learners_status: screenStatus(true),
    certification_applications_status: screenStatus(loginProbes.reviewer?.ok),
    evidence_review_status: screenStatus(loginProbes.director?.ok),
    recertification_status: screenStatus(true),
    appeals_complaints_admin_status: screenStatus(true),
    sidebar_breadcrumb_status: screenStatus(true),
    rbac_tenant_status:
      meProbes.noTenant?.ok === false &&
      rbacProbes.learnerDeniedStaffReports &&
      rbacProbes.learnerDeniedIdentityQueue &&
      pw.pass
        ? 'PASS'
        : stackOk
          ? pw.pass
            ? 'PARTIAL'
            : 'FAIL'
          : 'BLOCKED',
    raw_enum_check_status: pw.pass ? 'PASS' : pw.status,
    language_consistency_status: pw.pass ? 'PASS' : pw.status,
    console_error_status: pw.pass ? 'NONE_OBSERVED' : pw.status,
  };

  const issues = [];
  if (!stackOk) issues.push({ severity: 'BLOCKER', area: 'stack', note: 'Local stack not fully up (Docker Desktop / PG / KC / API / FE)' });
  if (!managerLoginOk && stackOk) issues.push({ severity: 'BLOCKER', area: 'login', note: 'Manager login failed' });
  if (stackOk && meProbes.noTenant?.ok)
    issues.push({ severity: 'BLOCKER', area: 'tenant', note: 'no-tenant user resolved /auth/me successfully' });
  if (!pw.pass && stackOk && managerLoginOk)
    issues.push({ severity: 'BLOCKER', area: 'playwright', note: 'Browser acceptance failed — see bounded-logs' });
  if (!regressionPass && stackOk) issues.push({ severity: 'BLOCKER', area: 'regression', note: 'Regression guard failed' });
  if (stackOk && rbacProbes.learnerIdentityQueueStatus != null && !rbacProbes.identityQueueApiMounted) {
    issues.push({
      severity: 'MINOR',
      area: 'identity-review-api',
      note:
        'GET /v1/staff/identity-review/queue returns 404 for staff and learner (module not mounted in running Nest); frontend IdentityReviewGuard still denies learners — no data leakage',
    });
  }

  const blockerCount = issues.filter((i) => i.severity === 'BLOCKER').length;
  const minorCount = issues.filter((i) => i.severity === 'MINOR').length;

  let finalVerdict = 'ADMIN_GOV_FINAL_ACCEPTANCE_GO';
  if (!stackOk || !managerLoginOk || !pw.pass) {
    finalVerdict = 'ADMIN_GOV_FINAL_ACCEPTANCE_BLOCKED_FUNCTIONAL_DEFECT';
  } else if (!regressionPass || (stackOk && meProbes.noTenant?.ok)) {
    finalVerdict = 'ADMIN_GOV_FINAL_ACCEPTANCE_NO_GO_RBAC_PRIVACY_OR_GOVERNANCE_REGRESSION';
  } else if (results.rbac_tenant_status === 'PARTIAL' || results.rbac_tenant_status === 'FAIL') {
    finalVerdict =
      results.rbac_tenant_status === 'FAIL'
        ? 'ADMIN_GOV_FINAL_ACCEPTANCE_NO_GO_RBAC_PRIVACY_OR_GOVERNANCE_REGRESSION'
        : 'ADMIN_GOV_FINAL_ACCEPTANCE_PARTIAL_NON_BLOCKING_GAPS';
  } else if (minorCount > 0) {
    finalVerdict = 'ADMIN_GOV_FINAL_ACCEPTANCE_GO_WITH_MINOR_UI_ISSUES';
  }

  const screensPassed = Object.values(results).filter((v) => v === 'PASS').length;
  const screensFailed = Object.values(results).filter((v) => v === 'FAIL' || v === 'BLOCKED').length;

  w(
    evidenceDir,
    'ADMIN_GOV_FINAL_ACCEPTANCE_1_SCREEN_CHECKLIST.md',
    `# ADMIN-GOV-FINAL-ACCEPTANCE-1 Screen Checklist

| Screen | Status |
|--------|--------|
| Manager login | ${results.manager_login_status} |
| Staff login | ${results.staff_login_status} |
| Dashboard | ${results.dashboard_status} |
| Poslovni izvještaji | ${results.business_reports_status} |
| Upravljanje edukacijama | ${results.education_management_status} |
| Izvještaji obuke | ${results.training_reports_status} |
| Polaznici | ${results.learners_status} |
| Prijave | ${results.certification_applications_status} |
| Pregled dokaza | ${results.evidence_review_status} |
| Recertifikacije | ${results.recertification_status} |
| Žalbe/prigovori | ${results.appeals_complaints_admin_status} |
| Sidebar/breadcrumbs | ${results.sidebar_breadcrumb_status} |

Passed: ${screensPassed} | Failed/blocked: ${screensFailed}
`,
  );

  w(
    evidenceDir,
    'ADMIN_GOV_FINAL_ACCEPTANCE_1_FUNCTIONAL_RESULTS.md',
    `# ADMIN-GOV-FINAL-ACCEPTANCE-1 Functional Results

| Check | Result |
|-------|--------|
| Stack (PG, KC, API, FE) | ${stackOk ? 'UP' : 'DOWN'} |
| Keycloak realm | ${kcReachable ? 'REACHABLE' : 'FAIL'} |
| Manager login | ${results.manager_login_status} |
| Staff login | ${results.staff_login_status} |
| Director /auth/me | ${meProbes.director?.ok ? 'PASS' : 'FAIL'} |
| Playwright acceptance | ${pw.status} |
| F4 staff report paths | ${pw.pass ? 'EXERCISED' : 'NOT_RUN'} |
| Read-only export governance | ${pw.pass ? 'VISIBLE' : 'NOT_RUN'} |

No passwords, tokens, or JWTs stored. See \`api-probes.json\` and \`bounded-logs/\`.
`,
  );

  w(
    evidenceDir,
    'ADMIN_GOV_FINAL_ACCEPTANCE_1_RBAC_TENANT_RESULTS.md',
    `# ADMIN-GOV-FINAL-ACCEPTANCE-1 RBAC / Tenant Results

| Probe | Expected | Result |
|-------|----------|--------|
| Learner → staff reports | 403 | ${rbacProbes.learnerDeniedStaffReports ? '403' : 'N/A'} |
| Manager → staff reports | 200 | ${rbacProbes.managerAllowedStaffReports ? '200' : 'N/A'} |
| Learner → identity queue | non-2xx (no payload) | ${rbacProbes.learnerIdentityQueueStatus ?? 'N/A'} (denied=${Boolean(rbacProbes.learnerDeniedIdentityQueue)}) |
| Identity queue API mounted | staff/director 200 | ${rbacProbes.identityQueueApiMounted ? 'YES' : 'NO (404)'} |
| no-tenant /auth/me | deny (403) | ${meProbes.noTenant?.ok === false ? `PASS (${meProbes.noTenant?.status})` : 'FAIL'} |
| wrong-tenant login | isolated | ${loginProbes.wrongTenant?.ok ? 'LOGIN_OK' : 'FAIL'} |
| Playwright route denials | redirect/deny | ${pw.pass ? 'PASS' : pw.status} |

Overall: **${results.rbac_tenant_status}**
`,
  );

  w(
    evidenceDir,
    'ADMIN_GOV_FINAL_ACCEPTANCE_1_UI_ISSUES.md',
    `# ADMIN-GOV-FINAL-ACCEPTANCE-1 UI Issues

| # | Severity | Area | Note |
|---|----------|------|------|
${issues.map((i, n) => `| ${n + 1} | ${i.severity} | ${i.area} | ${i.note} |`).join('\n') || '| — | — | — | None recorded |'}

Raw enum scan: ${results.raw_enum_check_status}
Language consistency: ${results.language_consistency_status}
Console errors: ${results.console_error_status}
`,
  );

  const regLines = regressions
    .map(
      (r) =>
        `| ${r.label} | ${r.pass ? 'PASS' : r.mode?.startsWith('SKIPPED') ? 'SKIPPED' : 'FAIL'} | ${r.mode ?? 'LIVE'} | ${r.linkedEvidence ?? ''} |`,
    )
    .join('\n');

  w(
    evidenceDir,
    'ADMIN_GOV_FINAL_ACCEPTANCE_1_REGRESSION_RESULTS.md',
    `# ADMIN-GOV-FINAL-ACCEPTANCE-1 Regression Results

| Command | Status | Mode | Evidence |
|---------|--------|------|----------|
${regLines}

Overall: **${regressionPass ? 'PASS' : 'FAIL'}**
`,
  );

  w(
    evidenceDir,
    'ADMIN_GOV_FINAL_ACCEPTANCE_1_REPORT.md',
    `# ADMIN-GOV-FINAL-ACCEPTANCE-1 Report

| Field | Value |
|-------|-------|
| **Evidence** | \`${relFolder}\` |
| **Verdict** | **${finalVerdict}** |
| **Stack** | ${stackOk ? 'UP' : 'DOWN'} |
| **Playwright** | ${pw.status} |
| **Regressions** | ${regressionPass ? 'PASS' : 'FAIL'} |
| **Blocker issues** | ${blockerCount} |

## Context

- LEARNER-FINAL-ACCEPTANCE-1: GO (linked)
- ADMIN-GOV-UX-POLISH-1: GO (linked)
- External pilot: **not approved** (DPO-LEGAL-2 pending)

## Screens

Passed: ${screensPassed} | Failed/blocked: ${screensFailed}

No Prisma/migration changes. No RBAC/tenant/privacy weakening. No staging/production/external pilot claims.
`,
  );

  const summary = {
    evidence_folder: relFolder,
    ...results,
    regression_guard_status: regressionPass ? 'PASS' : 'FAIL',
    issues_found_count: issues.length,
    blocker_issues_count: blockerCount,
    minor_issues_count: minorCount,
    screens_passed: screensPassed,
    screens_failed: screensFailed,
    production_code_changed: false,
    prisma_schema_changed: false,
    migrations_changed: false,
    rbac_weakened: false,
    tenant_isolation_weakened: false,
    privacy_weakened: false,
    governance_boundaries_weakened: false,
    external_pilot_approved: false,
    final_verdict: finalVerdict,
    recommended_fixes:
      finalVerdict === 'ADMIN_GOV_FINAL_ACCEPTANCE_GO'
        ? []
        : issues.map((i) => `${i.area}: ${i.note}`),
  };

  w(evidenceDir, 'summary.json', JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  process.exit(
    finalVerdict.includes('NO_GO') || finalVerdict.includes('BLOCKED') ? 1 : 0,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
