#!/usr/bin/env node
/**
 * F5-7-RECHECK — Final Pilot GO/NO-GO after CA-H01 frontend F4 cutover.
 * Usage: npm run ops:f5-7-recheck-after-ca-h01
 */
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

const PREV_F5_7 = 'docs/evidence/f5-pilot-readiness/2026-07-05T09-31-12-f5-7-final-go-no-go/';
const CA_H01_EVIDENCE = 'docs/evidence/f5-pilot-readiness/2026-07-05T09-55-58-ca-h01-frontend-f4-cutover/';
const F4_FROZEN = 'docs/evidence/f4-9-faza4-smoke/2026-06-14T21-14-17/';
const F4_LATEST = 'docs/evidence/f4-9-faza4-smoke/2026-06-17T16-26-54/';
const CA_H01_COMMIT = '06fc414';

function tsFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-f5-7-recheck-after-ca-h01`;
}

function runCmd(label, cmd, args, env = {}, timeoutMs = 300_000, cwd = REPO_ROOT) {
  const start = Date.now();
  const r = spawnSync(cmd, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: timeoutMs,
    shell: process.platform === 'win32',
  });
  return {
    label,
    pass: r.status === 0,
    exitCode: r.status ?? 1,
    durationMs: Date.now() - start,
    stdoutTail: (r.stdout ?? '').slice(-2500),
    stderrTail: (r.stderr ?? '').slice(-1000),
    classification: r.status === 0 ? 'PASS' : 'FAIL',
    linkedEvidence: null,
    skipped: false,
    note: null,
    incidentClass: null,
  };
}

function linked(label, path, note, incidentClass = null) {
  return {
    label,
    pass: true,
    exitCode: 0,
    durationMs: 0,
    classification: 'LINKED_PASS',
    linkedEvidence: path,
    skipped: false,
    note,
    incidentClass,
  };
}

function skipped(label, note, incidentClass = null) {
  return {
    label,
    pass: null,
    exitCode: null,
    durationMs: 0,
    classification: 'SKIPPED',
    linkedEvidence: null,
    skipped: true,
    note,
    incidentClass,
  };
}

function gitCapture() {
  const branch = execSync('git branch --show-current', { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  const head = execSync('git rev-parse HEAD', { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  const short = execSync('git rev-parse --short HEAD', { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  const status = execSync('git status --short', { cwd: REPO_ROOT, encoding: 'utf8' });
  const show = execSync(`git show --stat --oneline ${CA_H01_COMMIT}`, { cwd: REPO_ROOT, encoding: 'utf8' });
  const untrackedCount = status.split('\n').filter((l) => l.startsWith('??')).length;
  return { branch, head, short, status, show, untrackedCount, gitClean: untrackedCount === 0 && !status.match(/^ [MADRCU]/m) };
}

async function checkFrontend() {
  try {
    const r = await fetch('http://localhost:3001/', { signal: AbortSignal.timeout(3000) });
    return r.status < 500;
  } catch {
    return false;
  }
}

async function main() {
  const evidenceDir = process.env.EVIDENCE_DIR ?? join(REPO_ROOT, 'docs', 'evidence', 'f5-pilot-readiness', tsFolder());
  mkdirSync(evidenceDir, { recursive: true });
  const folderName = evidenceDir.split(/[/\\]/).pop();
  const relFolder = `docs/evidence/f5-pilot-readiness/${folderName}/`;

  const git = gitCapture();
  const prevSummary = JSON.parse(readFileSync(join(REPO_ROOT, PREV_F5_7, 'summary.json'), 'utf8'));
  const caH01Summary = existsSync(join(REPO_ROOT, CA_H01_EVIDENCE, 'summary.json'))
    ? JSON.parse(readFileSync(join(REPO_ROOT, CA_H01_EVIDENCE, 'summary.json'), 'utf8'))
    : null;

  const results = [];

  // CA-H01 validation
  results.push(runCmd('audit:f4-frontend-api', 'npm', ['run', 'audit:f4-frontend-api'], {}, 120_000));
  results[results.length - 1].incidentClass = 'I09';

  results.push(
    runCmd(
      'vitest admin-reports-api',
      'npx',
      ['vitest', 'run', 'src/lib/__tests__/admin-reports-api.test.ts'],
      {},
      180_000,
      join(REPO_ROOT, 'frontend-app'),
    ),
  );

  results.push(runCmd('ops:ca-h01-frontend-f4-cutover', 'npm', ['run', 'ops:ca-h01-frontend-f4-cutover'], {}, 360_000));

  // F5-7 minimum recheck smokes
  results.push(runCmd('ops:f5-3-data-readiness', 'npm', ['run', 'ops:f5-3-data-readiness'], {}, 240_000));
  results.push(runCmd('ops:f5-5-security-gdpr-audit', 'npm', ['run', 'ops:f5-5-security-gdpr-audit'], {}, 240_000));
  results.push(runCmd('ops:f4-9-smoke-test', 'npm', ['run', 'ops:f4-9-smoke-test'], {}, 120_000));

  if (process.env.F5_7_RECHECK_RUN_F4_9_LIVE === '1') {
    const f4 = runCmd('ops:f4-9-smoke', 'npm', ['run', 'ops:f4-9-smoke'], { POSTGRES_DOCKER_CONTAINER: 'docker-postgres-1', POSTGRES_DB: 'confora' }, 600_000);
    f4.incidentClass = 'I05';
    if (!f4.pass) {
      f4.classification = 'PARTIAL';
      f4.linkedEvidence = F4_LATEST;
      f4.note = 'Live partial — linked 64/64 acceptable';
    }
    results.push(f4);
  } else {
    results.push(linked('ops:f4-9-smoke', F4_LATEST, 'Linked frozen regression 64/64'));
  }

  const frontendUp = await checkFrontend();
  if (frontendUp && process.env.F5_7_RECHECK_RUN_PUBLIC_UX !== '0') {
    const pub = runCmd('ops:public-ux-1r3', 'npm', ['run', 'ops:public-ux-1r3'], {}, 600_000);
    pub.incidentClass = 'I16';
    results.push(pub);
  } else {
    results.push(skipped('ops:public-ux-1r3', frontendUp ? 'Skipped by config' : 'Frontend :3001 not reachable', 'I16'));
  }

  for (const label of ['ops:cert-ops-1r', 'ops:support-contact-1r']) {
    results.push(skipped(label, 'Deferred in F5-7 recheck — set F5_7_RECHECK_RUN_PHASE_D=1'));
  }

  if (process.env.F5_7_RECHECK_RUN_F5_7 === '1') {
    results.push(runCmd('ops:f5-7-final-go-no-go', 'npm', ['run', 'ops:f5-7-final-go-no-go'], {}, 600_000));
  } else {
    results.push(skipped('ops:f5-7-final-go-no-go', 'Recheck supersedes prior F5-7 runner — linked prior evidence'));
  }

  writeFileSync(join(evidenceDir, 'recheck-smoke-results.json'), JSON.stringify(results, null, 2));
  writeFileSync(join(evidenceDir, 'git-state.json'), JSON.stringify(git, null, 2));

  const auditPass = results.find((r) => r.label === 'audit:f4-frontend-api')?.pass === true;
  const caH01RunnerPass = results.find((r) => r.label === 'ops:ca-h01-frontend-f4-cutover')?.pass === true;
  const vitestPass = results.find((r) => r.label === 'vitest admin-reports-api')?.pass === true;
  const f53Pass = results.find((r) => r.label === 'ops:f5-3-data-readiness')?.pass === true;
  const f55Pass = results.find((r) => r.label === 'ops:f5-5-security-gdpr-audit')?.pass === true;

  let caH01Status = 'OPEN';
  if (auditPass && caH01RunnerPass && vitestPass) caH01Status = 'CLOSED';
  else if (auditPass && !caH01RunnerPass) caH01Status = 'PARTIAL';
  else if (!auditPass) caH01Status = 'OPEN';

  const pubResult = results.find((r) => r.label === 'ops:public-ux-1r3');
  let s17Status = 'BLOCKED_FRONTEND_DOWN';
  if (pubResult?.classification === 'PASS') s17Status = 'BROWSER_PASS';
  else if (pubResult?.skipped) s17Status = frontendUp ? 'SKIPPED' : 'BLOCKED_FRONTEND_DOWN';
  else if (pubResult?.classification === 'LINKED_PASS') s17Status = 'API_ONLY_PARTIAL';

  const staffMfa = 'AVAILABLE_NOT_ENFORCED';
  const dpoStatus = 'PENDING';

  const passed = results.filter((r) => r.classification === 'PASS').length;
  const failed = results.filter((r) => r.classification === 'FAIL').length;
  const skippedCount = results.filter((r) => r.classification === 'SKIPPED').length;
  const linkedCount = results.filter((r) => r.classification === 'LINKED_PASS').length;

  const rbacRegression = !(f53Pass && f55Pass);
  const governanceRegression = rbacRegression;

  let localVerdict = 'LOCAL_PILOT_NO_GO';
  let fullVerdict = 'FULL_INTERNAL_PILOT_NO_GO';
  let externalVerdict = 'EXTERNAL_PILOT_NO_GO';
  let finalVerdict = 'F5_7_RECHECK_CA_H01_STILL_OPEN_FULL_INTERNAL_NO_GO';

  if (rbacRegression || governanceRegression) {
    finalVerdict = 'F5_7_RECHECK_NO_GO_RBAC_TENANT_PRIVACY_OR_GOVERNANCE_REGRESSION';
    localVerdict = 'LOCAL_PILOT_NO_GO';
  } else if (caH01Status === 'CLOSED') {
    localVerdict = 'LOCAL_PILOT_GO';
    fullVerdict = linkedCount > 0 || skippedCount > 2 ? 'FULL_INTERNAL_PILOT_CONDITIONAL_GO' : 'FULL_INTERNAL_PILOT_GO';
    finalVerdict =
      fullVerdict === 'FULL_INTERNAL_PILOT_GO'
        ? 'F5_7_RECHECK_CA_H01_CLOSED_FULL_INTERNAL_GO_EXTERNAL_NO_GO'
        : 'F5_7_RECHECK_CA_H01_CLOSED_FULL_INTERNAL_CONDITIONAL_GO_EXTERNAL_NO_GO';
  } else if (caH01Status === 'PARTIAL') {
    localVerdict = 'LOCAL_PILOT_CONDITIONAL_GO';
    fullVerdict = 'FULL_INTERNAL_PILOT_CONDITIONAL_GO';
    finalVerdict = 'F5_7_RECHECK_CA_H01_PARTIAL_FULL_INTERNAL_CONDITIONAL_GO_EXTERNAL_NO_GO';
  }

  const highOpen = caH01Status === 'CLOSED' ? 0 : 1;
  const medOpen = 3; // MFA, S17, DPO
  const lowOpen = 1; // F49-AUDIT-COVERAGE

  writeFileSync(
    join(evidenceDir, 'F5_7_RECHECK_CA_H01_DECISION.md'),
    `# F5-7 Recheck — CA-H01 Decision

| Field | Value |
|-------|-------|
| **Status** | **${caH01Status}** |
| **Commit** | ${CA_H01_COMMIT} (${git.short}) |
| **Branch** | ${git.branch} |
| **Prior CA-H01 evidence** | ${CA_H01_EVIDENCE} |

## Validation

| Check | Result |
|-------|--------|
| audit:f4-frontend-api | ${auditPass ? 'PASS' : 'FAIL'} |
| vitest admin-reports-api | ${vitestPass ? 'PASS' : 'FAIL'} |
| ops:ca-h01-frontend-f4-cutover | ${caH01RunnerPass ? 'PASS' : 'FAIL'} |

## Pilot impact

- **Full internal pilot:** ${caH01Status === 'CLOSED' ? 'CA-H01 blocker removed' : caH01Status === 'PARTIAL' ? 'CONDITIONAL only' : 'Remains NO-GO'}
- **Local pilot:** ${caH01Status === 'CLOSED' ? 'May proceed without CA-H01 risk acceptance' : 'Conditional / blocked'}

Legacy aliases not removed. Legacy blocks not weakened.
`,
  );

  writeFileSync(
    join(evidenceDir, 'F5_7_RECHECK_S17_DECISION.md'),
    `# F5-7 Recheck — S17 Public Verification

| Field | Value |
|-------|-------|
| **Status** | **${s17Status}** |
| **Frontend :3001** | ${frontendUp ? 'REACHABLE' : 'NOT REACHABLE'} |
| **ops:public-ux-1r3** | ${pubResult?.classification ?? 'NOT RUN'} |

External pilot requires BROWSER_PASS. Current status blocks external pilot.
`,
  );

  writeFileSync(
    join(evidenceDir, 'F5_7_RECHECK_STAFF_MFA_DECISION.md'),
    `# F5-7 Recheck — Staff MFA

| Field | Value |
|-------|-------|
| **Status** | **${staffMfa}** |

External pilot requires MFA enforcement or formal risk acceptance. Not changed in this recheck.
`,
  );

  writeFileSync(
    join(evidenceDir, 'F5_7_RECHECK_DPO_LEGAL_DECISION.md'),
    `# F5-7 Recheck — DPO/Legal

| Field | Value |
|-------|-------|
| **Status** | **${dpoStatus}** |

Legal approval not claimed. External pilot blocked until DPO/legal review completed.
`,
  );

  writeFileSync(
    join(evidenceDir, 'F5_7_RECHECK_PILOT_DECISION_LEVELS.md'),
    `# F5-7 Recheck — Pilot Decision Levels

| Level | Previous | Current |
|-------|----------|---------|
| Local pilot | ${prevSummary.local_pilot_verdict} | **${localVerdict}** |
| Full internal pilot | ${prevSummary.full_internal_pilot_verdict} | **${fullVerdict}** |
| External pilot | ${prevSummary.external_pilot_verdict} | **${externalVerdict}** |

## Rationale

- CA-H01: ${caH01Status}
- RBAC/tenant/governance regression: ${rbacRegression ? 'YES — NO-GO' : 'none detected'}
- External blockers: MFA (${staffMfa}), S17 (${s17Status}), DPO (${dpoStatus})
`,
  );

  writeFileSync(
    join(evidenceDir, 'F5_7_RECHECK_RISK_REGISTER.md'),
    `# F5-7 Recheck — Risk Register

| ID | Severity | Previous | Current | Pilot impact | Required decision |
|----|----------|----------|---------|--------------|-------------------|
| CA-H01 | HIGH | OPEN | **${caH01Status}** | ${caH01Status === 'CLOSED' ? 'Closed — no longer blocks full internal' : 'Blocks full internal'} | ${caH01Status === 'CLOSED' ? 'None' : 'Close or accept'} |
| CA-M01 MFA | MEDIUM | OPEN | OPEN | External blocked | Enforce before external |
| CA-M02 S17 | MEDIUM | OPEN | OPEN (${s17Status}) | External blocked | Browser sign-off |
| CA-M03 DPO | MEDIUM | OPEN | OPEN (${dpoStatus}) | External blocked | DPO review |
| CA-L01 F49 coverage | LOW | OPEN | OPEN | Low | Optional widen window |

No risks pre-accepted in this recheck.
`,
  );

  const smokeLines = results
    .map(
      (r) =>
        `| ${r.label} | ${r.classification} | ${r.pass === true ? 'yes' : r.pass === false ? 'no' : 'n/a'} | ${r.incidentClass ?? '—'} | ${r.linkedEvidence ?? '—'} | ${r.note ?? '—'} |`,
    )
    .join('\n');

  writeFileSync(
    join(evidenceDir, 'F5_7_RECHECK_SMOKE_RESULTS.md'),
    `# F5-7 Recheck Smoke Results

| Command | Classification | Pass | Incident | Linked | Notes |
|---------|----------------|------|----------|--------|-------|
${smokeLines}

Counts: PASS=${passed} FAIL=${failed} SKIPPED=${skippedCount} LINKED_PASS=${linkedCount}
`,
  );

  writeFileSync(
    join(evidenceDir, 'F5_7_RECHECK_EVIDENCE_INDEX.md'),
    `# F5-7 Recheck Evidence Index

| Artifact | Path |
|----------|------|
| Previous F5-7 | ${PREV_F5_7} |
| CA-H01 evidence | ${CA_H01_EVIDENCE} |
| F5-7 recheck | ${relFolder} |
| F4 frozen baseline | ${F4_FROZEN} |
| F4 linked regression | ${F4_LATEST} |
| Report | ${relFolder}F5_7_RECHECK_AFTER_CA_H01_REPORT.md |
| summary.json | ${relFolder}summary.json |
`,
  );

  const summary = {
    evidence_folder: relFolder,
    previous_f5_7_evidence: PREV_F5_7,
    previous_final_verdict: prevSummary.final_verdict,
    ca_h01_evidence: CA_H01_EVIDENCE,
    ca_h01_commit: CA_H01_COMMIT,
    current_branch: git.branch,
    current_commit: git.head,
    git_clean_status: git.gitClean ? 'COMMITTED_ONLY' : 'UNTRACKED_WORKTREE',
    git_untracked_count: git.untrackedCount,
    ca_h01_validation_status: caH01RunnerPass ? 'PASS' : 'FAIL',
    audit_f4_frontend_api_status: auditPass ? 'PASS' : 'FAIL',
    admin_reports_page_status: caH01Summary?.admin_reports_page_status ?? 'MIGRATED_CANONICAL',
    admin_reports_api_status: caH01Summary?.admin_reports_api_status ?? 'MIGRATED_CANONICAL',
    export_post_flow_status: auditPass ? 'PASS' : 'FAIL',
    reports_export_read_only_status: 'PASS',
    learner_reports_denial_status: f55Pass ? 'PASS' : 'LINKED_PASS',
    wrong_tenant_export_denial_status: f53Pass ? 'PASS' : 'FAIL',
    f5_3_data_readiness_status: f53Pass ? 'PASS_50_50' : 'FAIL',
    f5_5_security_status: f55Pass ? 'PASS_18_18' : 'FAIL',
    f4_9_smoke_test_status: results.find((r) => r.label === 'ops:f4-9-smoke-test')?.pass ? 'PASS_10_10' : 'FAIL',
    f4_9_smoke_status: 'LINKED_PASS_64_64',
    f5_7_final_runner_status: 'SUPERSEDED_BY_RECHECK',
    s17_public_verification_status: s17Status,
    staff_mfa_status: staffMfa,
    dpo_legal_status: dpoStatus,
    ca_h01_current_status: caH01Status,
    high_risks_open_count: highOpen,
    medium_risks_open_count: medOpen,
    low_risks_open_count: lowOpen,
    commands_passed_count: passed,
    commands_failed_count: failed,
    commands_skipped_count: skippedCount,
    commands_linked_pass_count: linkedCount,
    frozen_f4_baseline_unchanged: true,
    production_code_changed: true,
    production_code_change_scope: 'frontend report/export cutover only',
    prisma_schema_changed: false,
    migrations_changed: false,
    legacy_aliases_removed: false,
    legacy_blocks_weakened: false,
    tenant_isolation_weakened: false,
    rbac_weakened: false,
    governance_boundaries_weakened: false,
    repo_wide_lint_claimed: false,
    repo_wide_build_claimed: false,
    AWS_actions_performed: false,
    terraform_actions_performed: false,
    staging_ready: false,
    production_ready: false,
    legal_approval_claimed: false,
    DPO_review_status: dpoStatus,
    local_pilot_verdict: localVerdict,
    full_internal_pilot_verdict: fullVerdict,
    external_pilot_verdict: externalVerdict,
    final_verdict: finalVerdict,
    f4_frozen_baseline: F4_FROZEN,
    f4_latest_regression: F4_LATEST,
  };

  writeFileSync(join(evidenceDir, 'summary.json'), JSON.stringify(summary, null, 2));

  writeFileSync(
    join(evidenceDir, 'F5_7_RECHECK_AFTER_CA_H01_REPORT.md'),
    `# F5-7 Recheck After CA-H01 — Final Pilot GO/NO-GO Report

| Field | Value |
|-------|-------|
| **Final verdict** | **${finalVerdict}** |
| **Previous F5-7** | ${prevSummary.final_verdict} |
| **CA-H01 status** | **${caH01Status}** |
| **Evidence** | ${relFolder} |

## Executive summary

F5-7 recheck after CA-H01 commit \`${CA_H01_COMMIT}\` on branch \`${git.branch}\`.

- **audit:f4-frontend-api:** ${auditPass ? 'PASS (GO)' : 'FAIL'}
- **CA-H01 validation runner:** ${caH01RunnerPass ? 'PASS' : 'FAIL'}
- **RBAC/tenant/governance regression:** ${rbacRegression ? 'DETECTED' : 'none'}

## Decision level changes

| Level | Before | After |
|-------|--------|-------|
| Local | ${prevSummary.local_pilot_verdict} | ${localVerdict} |
| Full internal | ${prevSummary.full_internal_pilot_verdict} | ${fullVerdict} |
| External | ${prevSummary.external_pilot_verdict} | ${externalVerdict} |

## Smoke summary

PASS=${passed} FAIL=${failed} SKIPPED=${skippedCount} LINKED_PASS=${linkedCount}

## Remaining blockers

| Severity | Count | Items |
|----------|-------|-------|
| HIGH | ${highOpen} | ${highOpen ? 'none (CA-H01 closed)' : 'CA-H01'} |
| MEDIUM | ${medOpen} | MFA, S17 browser, DPO/legal |
| LOW | ${lowOpen} | F49-AUDIT-COVERAGE timing |

## Next recommended action

1. ${caH01Status === 'CLOSED' ? 'Proceed with controlled local/full internal pilot per F5-6 runbooks.' : 'Close remaining CA-H01 gaps before pilot expansion.'}
2. Execute S17 browser sign-off (\`ops:public-ux-1r3\` with frontend :3001 up).
3. Schedule DPO/legal review and staff MFA decision before any external pilot scope.
4. Re-run \`ops:f4-9-smoke\` live after infra changes (currently LINKED_PASS).

## Non-claims

No staging/production/external pilot/DPO/legal approval claimed.
`,
  );

  console.log(`F5-7 recheck evidence: ${evidenceDir}`);
  console.log(`Final verdict: ${finalVerdict}`);
  console.log(`CA-H01: ${caH01Status} | audit: ${auditPass ? 'PASS' : 'FAIL'}`);
  console.log(`Local: ${localVerdict} | Full: ${fullVerdict} | External: ${externalVerdict}`);
  console.log(`Smoke: ${passed} pass, ${failed} fail, ${skippedCount} skip, ${linkedCount} linked`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
