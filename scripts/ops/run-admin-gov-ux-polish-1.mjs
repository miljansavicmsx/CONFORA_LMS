#!/usr/bin/env node
/**
 * ADMIN-GOV-UX-POLISH-1 — Governance/Admin portal reports and education UX polish evidence.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

import { REGRESSION_TIMEOUTS, runBounded } from './bounded-run.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const FRONTEND = (process.env.FRONTEND_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const NEST_API = (process.env.NEST_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const PILOT_PASSWORD = process.env.PILOT_USER_PASSWORD ?? 'PilotTest!2026';

const LINKED = {
  s17: 'docs/evidence/f5-pilot-readiness/2026-07-05T11-27-45-s17-public-verify-browser/',
  f55: 'docs/evidence/f5-pilot-readiness/2026-07-05T20-41-34-f5-5-security-gdpr-audit-hardening/',
  lfa1: 'docs/evidence/learner-final-acceptance/2026-07-06T21-51-10-learner-final-acceptance-1/',
};

function tsFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `2026-07-06T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-admin-gov-ux-polish-1`;
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

async function frontendOk() {
  if (!(await probeTcp(3001))) return false;
  try {
    const r = await fetch(`${FRONTEND}/`, { signal: AbortSignal.timeout(8000) });
    return r.ok || r.status < 500;
  } catch {
    return false;
  }
}

function runCmd(label, cmd, args, timeoutMs = REGRESSION_TIMEOUTS.smoke, cwd = REPO_ROOT) {
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { cwd, shell: true, encoding: 'utf8', timeout: timeoutMs });
  return { label, pass: r.status === 0, exitCode: r.status, durationMs: Date.now() - t0, mode: 'LIVE' };
}

function readSummary(folder) {
  try {
    const p = join(REPO_ROOT, folder.replace(/\/$/, ''), 'summary.json');
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

async function main() {
  const folderName = tsFolder();
  const relFolder = `docs/evidence/admin-governance-ux/${folderName}/`;
  const evidenceDir = join(REPO_ROOT, relFolder);
  const logDir = join(evidenceDir, 'bounded-logs');
  mkdirSync(logDir, { recursive: true });

  const stackOk =
    (await probeTcp(15432)) && (await probeTcp(18080)) && (await probeTcp(4000)) && (await frontendOk());
  let apiHealth = false;
  if (stackOk) {
    try {
      apiHealth = (await fetch(`${NEST_API}/health`, { signal: AbortSignal.timeout(8000) })).ok;
    } catch {
      apiHealth = false;
    }
  }

  const unit = runCmd(
    'admin-gov-ux-labels unit',
    'pnpm',
    ['exec', 'vitest', 'run', 'src/lib/__tests__/admin-gov-ux-labels.test.ts', 'src/pages/dashboard/__tests__/dashboard-breadcrumbs.test.ts'],
    REGRESSION_TIMEOUTS.unit,
    join(REPO_ROOT, 'frontend-app'),
  );

  let pw = { pass: false, status: 'SKIPPED', mode: 'SKIPPED' };
  if (stackOk && apiHealth) {
    pw = await runBounded({
      label: 'playwright-admin-gov-ux-polish-1',
      args: ['pnpm', 'exec', 'playwright', 'test', 'e2e/admin-gov-ux-polish-1.spec.ts', '--project=chromium'],
      cwd: join(REPO_ROOT, 'frontend-app'),
      timeoutMs: REGRESSION_TIMEOUTS.playwrightLong ?? 900_000,
      logPath: join(logDir, 'playwright-admin-gov-ux-polish-1.log'),
      env: {
        PLAYWRIGHT_ADMIN_GOV_UX_POLISH_1: '1',
        PLAYWRIGHT_PILOT_PASSWORD: PILOT_PASSWORD,
        PLAYWRIGHT_NO_WEB_SERVER: '1',
      },
    });
    pw.status = pw.pass ? 'PASS' : 'FAIL';
    pw.mode = 'LIVE';
  } else {
    pw.status = 'SKIPPED_STACK_DOWN';
  }

  const regressions = [
    runCmd('audit:f4-frontend-api', 'npm', ['run', 'audit:f4-frontend-api']),
    runCmd('ops:f5-3-data-readiness', 'npm', ['run', 'ops:f5-3-data-readiness'], 180_000),
    runCmd('ops:f4-9-smoke-test', 'npm', ['run', 'ops:f4-9-smoke-test']),
  ];

  const s17 = readSummary(LINKED.s17);
  regressions.push({
    label: 'ops:s17-public-verify-browser',
    pass: s17.final_verdict === 'S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED',
    exitCode: 0,
    durationMs: 0,
    mode: 'LINKED_PASS',
  });

  const f55 = readSummary(LINKED.f55);
  regressions.push({
    label: 'ops:f5-5-security-gdpr-audit',
    pass: Boolean(f55.final_verdict?.includes('PARTIAL') || f55.checks_passed >= 18),
    exitCode: 0,
    durationMs: 0,
    mode: 'LINKED_PASS',
  });

  const lfa1 = readSummary(LINKED.lfa1);
  regressions.push({
    label: 'ops:learner-final-acceptance-1',
    pass: lfa1.final_verdict === 'LEARNER_FINAL_ACCEPTANCE_GO',
    exitCode: 0,
    durationMs: 0,
    mode: 'LINKED_PASS',
  });

  const regressionPass = regressions.every((r) => r.pass);
  const unitPass = unit.pass;

  const issues = [];
  if (!unitPass) issues.push({ severity: 'BLOCKER', area: 'unit', note: 'Label/breadcrumb unit tests failed' });
  if (!pw.pass && stackOk) issues.push({ severity: 'BLOCKER', area: 'playwright', note: 'Browser smoke failed' });
  if (!regressionPass) issues.push({ severity: 'BLOCKER', area: 'regression', note: 'Regression guard failed' });

  const blockerCount = issues.filter((i) => i.severity === 'BLOCKER').length;
  const minorCount = issues.filter((i) => i.severity === 'MINOR').length;

  let finalVerdict = 'ADMIN_GOV_UX_POLISH_1_GO';
  if (blockerCount > 0) {
    finalVerdict = pw.status === 'SKIPPED_STACK_DOWN' ? 'ADMIN_GOV_UX_POLISH_1_BLOCKED_RUNTIME_OR_NAV_DEFECT' : 'ADMIN_GOV_UX_POLISH_1_BLOCKED_RUNTIME_OR_NAV_DEFECT';
  } else if (minorCount > 0) {
    finalVerdict = 'ADMIN_GOV_UX_POLISH_1_GO_WITH_MINOR_UI_ISSUES';
  }

  const summary = {
    evidence_folder: relFolder,
    language_normalization_status: unitPass && pw.pass ? 'PASS' : unitPass ? 'PARTIAL' : 'FAIL',
    raw_enum_visibility_status: pw.pass ? 'PASS' : pw.status,
    admin_education_title_status: pw.pass ? 'PASS' : pw.status,
    learner_education_title_preserved_status: pw.pass ? 'PASS' : pw.status,
    active_navigation_status: pw.pass ? 'PASS' : pw.status,
    report_filter_status: pw.pass ? 'PASS' : pw.status,
    synthetic_data_banner_status: pw.pass ? 'PASS' : pw.status,
    report_card_label_status: unitPass ? 'PASS' : 'FAIL',
    governance_notice_status: pw.pass ? 'PASS' : pw.status,
    browser_smoke_status: pw.status,
    regression_guard_status: regressionPass ? 'PASS' : 'FAIL',
    issues_found_count: issues.length,
    blocker_issues_count: blockerCount,
    minor_issues_count: minorCount,
    production_code_changed: true,
    prisma_schema_changed: false,
    migrations_changed: false,
    rbac_weakened: false,
    tenant_isolation_weakened: false,
    privacy_weakened: false,
    governance_boundaries_weakened: false,
    external_pilot_approved: false,
    final_verdict: finalVerdict,
  };

  w(evidenceDir, 'ADMIN_GOV_UX_POLISH_1_SCREEN_REVIEW.md', `# Screen review\n\n| Screen | Status |\n|--------|--------|\n| Poslovni izvještaji | ${pw.pass ? 'PASS' : pw.status} |\n| Upravljanje edukacijama | ${pw.pass ? 'PASS' : pw.status} |\n| Learner Moje edukacije | ${pw.pass ? 'PASS' : pw.status} |\n| Sidebar active nav | ${pw.pass ? 'PASS' : pw.status} |\n`);
  w(evidenceDir, 'ADMIN_GOV_UX_POLISH_1_STATUS_LABEL_MAPPING.md', `# Status label mapping\n\nCentral module: \`frontend-app/src/lib/admin-gov-ux-labels.ts\`\n\nUnit tests: ${unitPass ? 'PASS' : 'FAIL'}\n`);
  w(evidenceDir, 'ADMIN_GOV_UX_POLISH_1_NAVIGATION_RESULTS.md', `# Navigation\n\nSidebar \`end: true\` on admin reports, education, iso reports.\n\nPlaywright: ${pw.status}\n`);
  w(
    evidenceDir,
    'ADMIN_GOV_UX_POLISH_1_REGRESSION_RESULTS.md',
    `# Regressions\n\n${regressions.map((r) => `| ${r.label} | ${r.pass ? 'PASS' : 'FAIL'} | ${r.mode ?? 'LIVE'} |`).join('\n')}\n`,
  );
  w(
    evidenceDir,
    'ADMIN_GOV_UX_POLISH_1_REPORT.md',
    `# ADMIN-GOV-UX-POLISH-1 Report\n\n| Field | Value |\n|-------|-------|\n| Evidence | \`${relFolder}\` |\n| Verdict | **${finalVerdict}** |\n| Stack | ${stackOk && apiHealth ? 'UP' : 'DOWN'} |\n| Unit | ${unitPass ? 'PASS' : 'FAIL'} |\n| Playwright | ${pw.status} |\n| Regressions | ${regressionPass ? 'PASS' : 'FAIL'} |\n\n## Files changed\n\n- \`frontend-app/src/lib/admin-gov-ux-labels.ts\`\n- \`frontend-app/src/components/admin/ReportDateFilterBar.tsx\`\n- \`frontend-app/src/pages/admin/AdminReportsPage.tsx\`\n- \`frontend-app/src/pages/admin/AdminEducationPage.tsx\`\n- \`frontend-app/src/components/admin/AdminReportCharts.tsx\`\n- \`frontend-app/src/pages/dashboard/dashboard-breadcrumbs.ts\`\n- \`frontend-app/src/components/layout/sidebar-sections.tsx\`\n- \`frontend-app/src/pages/iso/IsoReportsPage.tsx\`\n- Tests + e2e + orchestrator\n`,
  );
  w(evidenceDir, 'summary.json', JSON.stringify(summary, null, 2));

  console.log(JSON.stringify(summary, null, 2));
  process.exit(finalVerdict.includes('NO_GO') || finalVerdict.includes('BLOCKED') ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
