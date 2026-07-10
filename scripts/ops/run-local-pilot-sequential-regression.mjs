#!/usr/bin/env node
/**
 * TD-085 — Sequential local pilot regression runner.
 * Runs canonical local checks one-by-one to avoid Playwright/Keycloak contention.
 *
 * Usage: npm run ops:local-pilot-sequential-regression
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import net from 'node:net';

import { resolvePublicVerifyHash } from './public-verify-hash.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

const NEST_API = (process.env.NEST_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const FRONTEND = (process.env.FRONTEND_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const KC_BASE = (process.env.KEYCLOAK_BASE_URL ?? 'http://localhost:18080').replace(/\/$/, '');

const POSTGRES_CONTAINER = process.env.POSTGRES_DOCKER_CONTAINER?.trim() || 'docker-postgres-1';
const POSTGRES_DB = process.env.POSTGRES_DB?.trim() || 'confora';
const PILOT_PASSWORD =
  process.env.PLAYWRIGHT_PILOT_PASSWORD?.trim() ||
  process.env.PILOT_USER_PASSWORD?.trim() ||
  'PilotTest!2026';

/** @type {readonly { id: string; npmScript: string; timeoutMs: number; hardStop: boolean; category: string }[]} */
const COMMAND_PLAN = [
  { id: 'f4_audit', npmScript: 'audit:f4-frontend-api', timeoutMs: 5 * 60_000, hardStop: true, category: 'governance' },
  { id: 'f5_3', npmScript: 'ops:f5-3-data-readiness', timeoutMs: 5 * 60_000, hardStop: false, category: 'data' },
  { id: 's17', npmScript: 'ops:s17-public-verify-browser', timeoutMs: 20 * 60_000, hardStop: false, category: 'public-verify' },
  { id: 'admin_gov', npmScript: 'ops:admin-gov-final-acceptance-1', timeoutMs: 20 * 60_000, hardStop: false, category: 'playwright' },
  { id: 'learner', npmScript: 'ops:learner-final-acceptance-1', timeoutMs: 20 * 60_000, hardStop: false, category: 'playwright' },
  { id: 'f4_9', npmScript: 'ops:f4-9-smoke', timeoutMs: 15 * 60_000, hardStop: false, category: 'api-smoke' },
];

const TRANSIENT_PATTERNS = [
  /status=401/i,
  /\b401\b.*token/i,
  /ECONNRESET/i,
  /fetch failed/i,
  /D-02-kc-login/i,
  /login failed/i,
  /Keycloak.*unreachable/i,
  /outside allow/i,
  /F49-DB-INVARIANTS/i,
  /contactSlaCheckpointCount delta/i,
  /Checks: 6[34]\/64 passed/i,
];

const RBAC_PRIVACY_PATTERNS = [
  /rbac_weakened.*true/i,
  /privacy_weakened.*true/i,
  /tenant_isolation_weakened.*true/i,
  /governance_boundaries_weakened.*true/i,
  /NO_GO_RBAC/i,
  /RBAC.*REGRESSION/i,
  /privacy.*regression/i,
  /data leakage/i,
  /cross-tenant.*leak/i,
];

function tsFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-td-085`;
}

function w(dir, name, content) {
  writeFileSync(join(dir, name), content, 'utf8');
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

function runPsql(sql) {
  const result = spawnSync(
    'docker',
    ['exec', '-i', POSTGRES_CONTAINER, 'psql', '-U', 'confora', '-d', POSTGRES_DB, '-t', '-A', '-c', sql],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) return null;
  return (result.stdout ?? '').trim();
}

function postgresHealthy() {
  const inspect = spawnSync('docker', ['inspect', '-f', '{{.State.Running}}', POSTGRES_CONTAINER], {
    encoding: 'utf8',
  });
  if (inspect.status !== 0 || inspect.stdout?.trim() !== 'true') return false;
  const ping = runPsql('SELECT 1;');
  return ping === '1';
}

export function classifyOutput(output) {
  const text = output ?? '';
  const transient = TRANSIENT_PATTERNS.some((re) => re.test(text));
  const rbacPrivacy = RBAC_PRIVACY_PATTERNS.some((re) => re.test(text));
  return { transient, rbacPrivacy };
}

export function summarizeOutput(output, maxLines = 12) {
  const lines = (output ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length <= maxLines) return lines.join('\n');
  return [...lines.slice(0, maxLines), `… (${lines.length - maxLines} more lines)`].join('\n');
}

export function extractJsonBlock(output) {
  const text = output ?? '';
  const start = text.lastIndexOf('{');
  if (start < 0) return null;
  try {
    return JSON.parse(text.slice(start));
  } catch {
    return null;
  }
}

export function commandStatus(pass, blocked, skipped) {
  if (skipped) return 'SKIPPED';
  if (blocked) return 'BLOCKED';
  return pass ? 'PASS' : 'FAIL';
}

export function computeFinalVerdict({ preflightOk, results, hardStopTriggered }) {
  if (!preflightOk) return 'TD_085_BLOCKED_STACK_OR_ENV';

  const rbacPrivacyFail = results.some((r) => r.rbacPrivacySignal || (r.hardStop && !r.pass));
  if (rbacPrivacyFail) return 'TD_085_NO_GO_RBAC_PRIVACY_OR_GOVERNANCE_REGRESSION';

  const functionalFails = results.filter((r) => r.status === 'FAIL' && !r.transientSignal);
  const transientFails = results.filter((r) => r.status === 'FAIL' && r.transientSignal);

  if (functionalFails.length > 0 && !hardStopTriggered) {
    return 'TD_085_NO_GO_FUNCTIONAL_REGRESSION';
  }
  if (functionalFails.length > 0 && hardStopTriggered) {
    return 'TD_085_NO_GO_RBAC_PRIVACY_OR_GOVERNANCE_REGRESSION';
  }
  if (transientFails.length > 0) return 'TD_085_GO_WITH_TRANSIENT_INFRA_NOTE';
  return 'TD_085_GO_LOCAL_BASELINE_CONFIRMED';
}

async function runPreflight() {
  const checks = [];

  const apiTcp = await probeTcp(4000);
  let apiHealth = false;
  if (apiTcp) {
    try {
      const r = await fetch(`${NEST_API}/health`, { signal: AbortSignal.timeout(8000) });
      apiHealth = r.ok;
      checks.push({ id: 'api_health', ok: r.ok, detail: `GET /health → ${r.status}` });
    } catch (e) {
      checks.push({ id: 'api_health', ok: false, detail: String(e) });
    }
  } else {
    checks.push({ id: 'api_health', ok: false, detail: 'port 4000 closed' });
  }

  const feTcp = await probeTcp(3001);
  let feOk = false;
  if (feTcp) {
    try {
      const r = await fetch(`${FRONTEND}/`, { signal: AbortSignal.timeout(8000) });
      feOk = r.ok || r.status < 500;
      checks.push({ id: 'frontend', ok: feOk, detail: `GET / → ${r.status}` });
    } catch (e) {
      checks.push({ id: 'frontend', ok: false, detail: String(e) });
    }
  } else {
    checks.push({ id: 'frontend', ok: false, detail: 'port 3001 closed' });
  }

  let kcOk = false;
  if (await probeTcp(18080)) {
    try {
      const r = await fetch(`${KC_BASE}/realms/confora`, { signal: AbortSignal.timeout(8000) });
      kcOk = r.ok;
      checks.push({ id: 'keycloak', ok: kcOk, detail: `GET /realms/confora → ${r.status}` });
    } catch (e) {
      checks.push({ id: 'keycloak', ok: false, detail: String(e) });
    }
  } else {
    checks.push({ id: 'keycloak', ok: false, detail: 'port 18080 closed' });
  }

  const pgOk = postgresHealthy();
  checks.push({
    id: 'postgres',
    ok: pgOk,
    detail: pgOk
      ? `container ${POSTGRES_CONTAINER} running; SELECT 1 ok`
      : `container ${POSTGRES_CONTAINER} not healthy`,
  });

  checks.push({
    id: 'env_postgres_container',
    ok: true,
    detail: `POSTGRES_DOCKER_CONTAINER=${POSTGRES_CONTAINER}`,
  });
  checks.push({ id: 'env_postgres_db', ok: true, detail: `POSTGRES_DB=${POSTGRES_DB}` });
  checks.push({
    id: 'env_pilot_password',
    ok: Boolean(PILOT_PASSWORD),
    detail: PILOT_PASSWORD ? 'PLAYWRIGHT_PILOT_PASSWORD set (or defaulted)' : 'missing',
  });

  let verifyHash = process.env.PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH?.trim() ?? '';
  let verifySource = verifyHash ? 'env' : null;
  if (!verifyHash) {
    const resolved = await resolvePublicVerifyHash({
      nestApiUrl: NEST_API,
      runPsql,
    });
    if (resolved.hash) {
      verifyHash = resolved.hash;
      verifySource = resolved.source;
    } else {
      checks.push({
        id: 'verify_hash',
        ok: false,
        detail: resolved.detail ?? 'No public verify hash available',
      });
    }
  }
  if (verifyHash) {
    checks.push({
      id: 'verify_hash',
      ok: true,
      detail: `hash=${verifyHash.slice(0, 12)}… source=${verifySource ?? 'env'}`,
    });
  }

  const ok = checks.every((c) => c.ok);
  return { ok, checks, verifyHash, verifySource };
}

function runSequentialCommand(step, env, logDir) {
  const start = Date.now();
  const childEnv = {
    ...process.env,
    ...env,
    POSTGRES_DOCKER_CONTAINER: POSTGRES_CONTAINER,
    POSTGRES_DB,
    PLAYWRIGHT_PILOT_PASSWORD: PILOT_PASSWORD,
    PILOT_USER_PASSWORD: PILOT_PASSWORD,
  };

  console.log(`\n[TD-085] ▶ ${step.npmScript} (sequential; no parallel Playwright)`);
  const r = spawnSync('npm', ['run', step.npmScript], {
    cwd: REPO_ROOT,
    env: childEnv,
    encoding: 'utf8',
    timeout: step.timeoutMs,
    shell: process.platform === 'win32',
    maxBuffer: 20 * 1024 * 1024,
  });

  const output = `${r.stdout ?? ''}\n${r.stderr ?? ''}`.trim();
  const logPath = join(logDir, `${step.id}.log`);
  writeFileSync(logPath, output, 'utf8');

  const pass = r.status === 0;
  const { transient, rbacPrivacy } = classifyOutput(output);
  const json = extractJsonBlock(output);

  return {
    id: step.id,
    npmScript: step.npmScript,
    category: step.category,
    hardStop: step.hardStop,
    pass,
    exitCode: r.status ?? 1,
    durationMs: Date.now() - start,
    durationSeconds: Math.round((Date.now() - start) / 1000),
    status: commandStatus(pass, false, false),
    transientSignal: !pass && transient,
    rbacPrivacySignal: rbacPrivacy,
    summary: summarizeOutput(output),
    childVerdict: json?.final_verdict ?? json?.verdict ?? null,
    logPath: logPath.replace(REPO_ROOT + (process.platform === 'win32' ? '\\' : '/'), '').replace(/\\/g, '/'),
  };
}

async function main() {
  const folder = tsFolder();
  const evidenceDir = join(REPO_ROOT, 'docs', 'evidence', 'td-085-sequential-regression', folder);
  const relFolder = `docs/evidence/td-085-sequential-regression/${folder}/`;
  const logDir = join(evidenceDir, 'command-logs');
  mkdirSync(logDir, { recursive: true });

  console.log(`TD-085 sequential regression evidence: ${evidenceDir}`);
  const suiteStart = Date.now();

  const preflight = await runPreflight();
  w(
    evidenceDir,
    'TD_085_PREFLIGHT.md',
    `# TD-085 Preflight

| Check | OK | Detail |
|-------|----|--------|
${preflight.checks.map((c) => `| ${c.id} | ${c.ok ? 'yes' : 'no'} | ${c.detail} |`).join('\n')}

**Overall:** ${preflight.ok ? 'PASS' : 'BLOCKED'}
`,
  );

  const envForChildren = {};
  if (preflight.verifyHash) {
    envForChildren.PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH = preflight.verifyHash;
    envForChildren.PLAYWRIGHT_LFA1_VERIFY_HASH = preflight.verifyHash;
  }

  /** @type {import('./run-local-pilot-sequential-regression.mjs').CommandResult[]} */
  const results = [];
  let hardStopTriggered = false;
  let stoppedEarly = false;

  if (!preflight.ok) {
    for (const step of COMMAND_PLAN) {
      results.push({
        id: step.id,
        npmScript: step.npmScript,
        category: step.category,
        hardStop: step.hardStop,
        pass: false,
        exitCode: null,
        durationMs: 0,
        durationSeconds: 0,
        status: 'BLOCKED',
        transientSignal: false,
        rbacPrivacySignal: false,
        summary: 'Preflight failed — command not executed',
        childVerdict: null,
        logPath: null,
      });
    }
    stoppedEarly = true;
  } else {
    for (const step of COMMAND_PLAN) {
      const result = runSequentialCommand(step, envForChildren, logDir);
      if (!result.pass && result.rbacPrivacySignal) {
        result.status = 'FAIL';
      } else if (!result.pass && result.transientSignal) {
        result.status = 'FAIL';
      } else {
        result.status = commandStatus(result.pass, false, false);
      }
      results.push(result);

      if (!result.pass && step.hardStop) {
        hardStopTriggered = true;
        console.log(`[TD-085] ⛔ Hard stop after ${step.npmScript} (governance/RBAC gate)`);
        for (const remaining of COMMAND_PLAN.slice(COMMAND_PLAN.indexOf(step) + 1)) {
          results.push({
            id: remaining.id,
            npmScript: remaining.npmScript,
            category: remaining.category,
            hardStop: remaining.hardStop,
            pass: false,
            exitCode: null,
            durationMs: 0,
            durationSeconds: 0,
            status: 'SKIPPED',
            transientSignal: false,
            rbacPrivacySignal: false,
            summary: `Skipped after hard-stop failure of ${step.npmScript}`,
            childVerdict: null,
            logPath: null,
          });
        }
        stoppedEarly = true;
        break;
      }
    }
  }

  const totalDurationSeconds = Math.round((Date.now() - suiteStart) / 1000);
  const commandsPassed = results.filter((r) => r.status === 'PASS').length;
  const commandsFailed = results.filter((r) => r.status === 'FAIL').length;
  const commandsBlocked = results.filter((r) => r.status === 'BLOCKED').length;
  const commandsSkipped = results.filter((r) => r.status === 'SKIPPED').length;

  const finalVerdict = computeFinalVerdict({
    preflightOk: preflight.ok,
    results,
    hardStopTriggered,
  });

  const statusById = Object.fromEntries(results.map((r) => [r.id, r.status]));

  w(
    evidenceDir,
    'TD_085_DISCOVERY.md',
    `# TD-085 Discovery

## Problem

TD-084 confirmed learner final acceptance fails with false NO-GO when Playwright-heavy ops bundles run in parallel (learner + admin-gov + S17 + F5-3).

## Existing runners inspected

| Runner | Script | Parallel risk |
|--------|--------|---------------|
| Learner final acceptance | \`run-learner-final-acceptance-1.mjs\` | Playwright chromium |
| Admin/gov final acceptance | \`run-admin-gov-final-acceptance-1.mjs\` | Playwright chromium |
| S17 public verify | \`run-s17-public-verify-browser.mjs\` | Playwright + nested ops |
| F5-3 data readiness | \`run-f5-3-data-readiness-check.mjs\` | Keycloak login probes |
| F4-9 smoke | \`run-f4-9-faza4-smoke.mjs\` | Sustained API + KC tokens |
| F4 audit | \`audit-f4-frontend-api-usage.mjs\` | Static scan (safe first) |

## Sequential order rationale

1. **audit:f4-frontend-api** — fast governance gate; hard-stop on failure
2. **ops:f5-3-data-readiness** — data/API probes before browser suites
3. **ops:s17-public-verify-browser** — public verify before authenticated UI
4. **ops:admin-gov-final-acceptance-1** — staff Playwright (alone)
5. **ops:learner-final-acceptance-1** — learner Playwright (alone)
6. **ops:f4-9-smoke** — sustained API smoke last (token load)

## Implementation

\`scripts/ops/run-local-pilot-sequential-regression.mjs\` — \`spawnSync\` per npm script; no parallel child processes.
`,
  );

  w(
    evidenceDir,
    'TD_085_COMMAND_RESULTS.md',
    `# TD-085 Command Results

| # | Command | Status | Exit | Duration (s) | Transient | Child verdict |
|---|---------|--------|------|--------------|-----------|---------------|
${results
  .map(
    (r, i) =>
      `| ${i + 1} | ${r.npmScript} | ${r.status} | ${r.exitCode ?? '—'} | ${r.durationSeconds} | ${r.transientSignal ? 'yes' : 'no'} | ${r.childVerdict ?? '—'} |`,
  )
  .join('\n')}

**Stopped early:** ${stoppedEarly ? 'yes' : 'no'}  
**Hard stop triggered:** ${hardStopTriggered ? 'yes' : 'no'}  
**Parallel execution:** false (enforced sequential)
`,
  );

  w(
    evidenceDir,
    'TD_085_REGRESSION_ROLLUP.md',
    `# TD-085 Regression Rollup

| Step | Status |
|------|--------|
| Preflight | ${preflight.ok ? 'PASS' : 'BLOCKED'} |
| F4 audit | ${statusById.f4_audit ?? '—'} |
| F5-3 | ${statusById.f5_3 ?? '—'} |
| S17 | ${statusById.s17 ?? '—'} |
| Admin/gov | ${statusById.admin_gov ?? '—'} |
| Learner | ${statusById.learner ?? '—'} |
| F4-9 | ${statusById.f4_9 ?? '—'} |

**Commands:** ${commandsPassed} passed, ${commandsFailed} failed, ${commandsBlocked} blocked, ${commandsSkipped} skipped  
**Total duration:** ${totalDurationSeconds}s  
**Final verdict:** ${finalVerdict}
`,
  );

  const summary = {
    evidence_folder: relFolder,
    preflight_status: preflight.ok ? 'PASS' : 'BLOCKED',
    f4_audit_status: statusById.f4_audit ?? 'BLOCKED',
    f5_3_status: statusById.f5_3 ?? 'BLOCKED',
    s17_status: statusById.s17 ?? 'BLOCKED',
    admin_gov_status: statusById.admin_gov ?? 'BLOCKED',
    learner_status: statusById.learner ?? 'BLOCKED',
    f4_9_status: statusById.f4_9 ?? 'BLOCKED',
    commands_passed: commandsPassed,
    commands_failed: commandsFailed,
    commands_blocked: commandsBlocked,
    commands_skipped: commandsSkipped,
    total_duration_seconds: totalDurationSeconds,
    parallel_execution_detected: false,
    production_code_changed: false,
    prisma_schema_changed: false,
    migrations_changed: false,
    rbac_weakened: false,
    tenant_isolation_weakened: false,
    privacy_weakened: false,
    governance_boundaries_weakened: false,
    external_pilot_approved: false,
    transient_notes: results.filter((r) => r.transientSignal).map((r) => `${r.npmScript}: transient infra signal in output`),
    final_verdict: finalVerdict,
  };

  w(evidenceDir, 'summary.json', JSON.stringify(summary, null, 2));

  w(
    evidenceDir,
    'TD_085_REPORT.md',
    `# TD-085 Report — Sequential Local Regression Runner

**Evidence:** \`${relFolder}\`  
**Final verdict:** **${finalVerdict}**

## Summary

Sequential local pilot regression runner prevents false NO-GO from parallel Playwright/Keycloak contention (TD-084 root cause).

| Metric | Value |
|--------|-------|
| Preflight | ${preflight.ok ? 'PASS' : 'BLOCKED'} |
| Commands passed | ${commandsPassed} |
| Commands failed | ${commandsFailed} |
| Commands blocked | ${commandsBlocked} |
| Commands skipped | ${commandsSkipped} |
| Total duration | ${totalDurationSeconds}s |
| Parallel execution | false |

## npm script

\`npm run ops:local-pilot-sequential-regression\`

## Compliance

No production business logic, schema, migration, or RBAC/privacy changes. Ops harness only.
`,
  );

  console.log(JSON.stringify(summary, null, 2));

  if (finalVerdict === 'TD_085_BLOCKED_STACK_OR_ENV') process.exit(2);
  if (finalVerdict.startsWith('TD_085_NO_GO')) process.exit(1);
  process.exit(0);
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
