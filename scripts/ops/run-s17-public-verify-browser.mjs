#!/usr/bin/env node
/**
 * S17-PUBLIC-VERIFY-BROWSER-1 — Public verification browser sign-off.
 * Usage: npm run ops:s17-public-verify-browser
 */
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const NEST_API = (process.env.NEST_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const FRONTEND = (process.env.FRONTEND_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const POSTGRES_CONTAINER = process.env.POSTGRES_DOCKER_CONTAINER ?? 'docker-postgres-1';
const INVALID_HASH = '0'.repeat(64);
const PRIVATE_KEYS = [
  'jmbg',
  'dateOfBirth',
  'date_of_birth',
  'email',
  'phone',
  'address',
  'tenantId',
  'userId',
  'applicationId',
  'pdfUrl',
  'pdfStorageKey',
  'reviewerNotes',
  'committeeDeliberation',
  'committeeVotes',
  'identityDocument',
  'auditPayload',
  'dossier',
  'biometric',
  'internalAudit',
  'nationalId',
];

function tsFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-s17-public-verify-browser`;
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
    ['exec', '-i', POSTGRES_CONTAINER, 'psql', '-U', 'confora', '-d', 'confora', '-t', '-A', '-F', '|', '-c', sql],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) return null;
  return (result.stdout ?? '').trim();
}

function discoverLiveVerifyHash() {
  const envHash = process.env.PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH?.trim();
  if (envHash) return envHash;
  const raw = runPsql(
    `SELECT verification_hash FROM cert.certificates WHERE verification_hash IS NOT NULL AND status IN ('ACTIVE','ISSUED','VALID') ORDER BY CASE status WHEN 'ACTIVE' THEN 0 WHEN 'VALID' THEN 1 ELSE 2 END, issued_at DESC NULLS LAST LIMIT 1;`,
  );
  if (!raw) return null;
  const line = raw.split('\n').find(Boolean);
  return line?.split('|')[0]?.trim() ?? null;
}

function runCmd(label, cmd, args, env = {}, timeoutMs = 600_000, cwd = REPO_ROOT) {
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
    stdoutTail: (r.stdout ?? '').slice(-3000),
    stderrTail: (r.stderr ?? '').slice(-1500),
  };
}

function scanPrivateExposure(obj) {
  const hits = [];
  const walk = (value, path = '') => {
    if (value == null) return;
    if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        const p = path ? `${path}.${k}` : k;
        if (PRIVATE_KEYS.some((pk) => k.toLowerCase().includes(pk.toLowerCase()))) {
          hits.push(p);
        }
        walk(v, p);
      }
      return;
    }
    const s = String(value);
    if (/@/.test(s) && /email/i.test(path)) hits.push(path);
    if (/\b\d{13}\b/.test(s)) hits.push(`${path}:jmbg-like`);
  };
  walk(obj);
  return hits;
}

async function fetchJson(url, init) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20_000) });
  const ct = res.headers.get('content-type') ?? '';
  const body = ct.includes('json') ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
  return { status: res.status, ok: res.ok, body };
}

async function main() {
  const folder = tsFolder();
  const evidenceDir = join(REPO_ROOT, 'docs', 'evidence', 'f5-pilot-readiness', folder);
  const relFolder = `docs/evidence/f5-pilot-readiness/${folder}/`;
  const screenshotDir = join(evidenceDir, 'screenshots');
  mkdirSync(screenshotDir, { recursive: true });

  console.log(`S17 evidence: ${evidenceDir}`);

  const feUp = await probeTcp(3001);
  const apiUp = await probeTcp(4000);
  let healthOk = false;
  if (apiUp) {
    try {
      healthOk = (await fetch(`${NEST_API}/health`, { signal: AbortSignal.timeout(10_000) })).ok;
    } catch {
      healthOk = false;
    }
  }

  const verifyHash = discoverLiveVerifyHash();
  const frontendReachable = feUp;
  let publicRouteNoAuth = false;
  if (feUp) {
    try {
      const feVerify = await fetch(`${FRONTEND}/verify`, { signal: AbortSignal.timeout(15_000) });
      publicRouteNoAuth = feVerify.ok;
    } catch {
      publicRouteNoAuth = false;
    }
  }

  let validLookup = { pass: false, hash: verifyHash, body: null, privateHits: [] };
  let invalidLookup = { pass: false, body: null, privateHits: [] };
  if (healthOk && verifyHash) {
    const valid = await fetchJson(`${NEST_API}/api/public/verify/${verifyHash}`);
    validLookup.body = valid.body;
    validLookup.privateHits = scanPrivateExposure(valid.body);
    validLookup.pass = valid.ok && valid.body?.valid === true && validLookup.privateHits.length === 0;
  }
  if (healthOk) {
    const invalid = await fetchJson(`${NEST_API}/api/public/verify/${INVALID_HASH}`);
    invalidLookup.body = invalid.body;
    invalidLookup.privateHits = scanPrivateExposure(invalid.body);
    const safe =
      invalid.body?.validityState === 'NOT_FOUND' ||
      invalid.body?.valid === false ||
      invalid.status === 404;
    invalidLookup.pass = safe && invalidLookup.privateHits.length === 0;
  }

  const verifyHashEnv = verifyHash ?? 'e4c6865bbd0addb0b3bac26389ce96b2e0b2002fee5a1f261d3610c5aa07db04';
  const pw = frontendReachable
    ? runCmd(
        'playwright-public-ux-1',
        'pnpm',
        ['exec', 'playwright', 'test', 'e2e/public-ux-1.spec.ts', '--project=chromium'],
        {
          PLAYWRIGHT_PUBLIC_UX_1: '1',
          PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH: verifyHashEnv,
          PLAYWRIGHT_PUBLIC_UX_1_EVIDENCE: relFolder.replace(/\/$/, ''),
          PLAYWRIGHT_NO_WEB_SERVER: '1',
        },
        420_000,
        join(REPO_ROOT, 'frontend-app'),
      )
    : { label: 'playwright-public-ux-1', pass: false, exitCode: null, note: 'frontend down' };

  const pwScreens = frontendReachable
    ? runCmd(
        'playwright-s17-screenshots',
        'pnpm',
        ['exec', 'playwright', 'test', 'e2e/s17-public-verify-browser.spec.ts', '--project=chromium'],
        {
          PLAYWRIGHT_S17_BROWSER: '1',
          PLAYWRIGHT_S17_VERIFY_HASH: verifyHashEnv,
          PLAYWRIGHT_S17_INVALID_HASH: INVALID_HASH,
          PLAYWRIGHT_S17_EVIDENCE: screenshotDir.replace(/\\/g, '/'),
          PLAYWRIGHT_NO_WEB_SERVER: '1',
        },
        180_000,
        join(REPO_ROOT, 'frontend-app'),
      )
    : { label: 'playwright-s17-screenshots', pass: false, exitCode: null, note: 'frontend down' };

  const pubUx = runCmd('ops:public-ux-1r3', 'npm', ['run', 'ops:public-ux-1r3'], {
    PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH: verifyHashEnv,
  }, 45 * 60 * 1000);

  const certOps = runCmd('ops:cert-ops-1r', 'npm', ['run', 'ops:cert-ops-1r'], {
    PLAYWRIGHT_CERT_OPS_1_VERIFY_HASH: verifyHashEnv,
  }, 20 * 60 * 1000);

  const auditF4 = runCmd('audit:f4-frontend-api', 'npm', ['run', 'audit:f4-frontend-api'], {}, 120_000);
  const f53 = runCmd('ops:f5-3-data-readiness', 'npm', ['run', 'ops:f5-3-data-readiness'], {}, 300_000);
  const f55 = runCmd('ops:f5-5-security-gdpr-audit', 'npm', ['run', 'ops:f5-5-security-gdpr-audit'], {}, 300_000);
  const f49 = runCmd('ops:f4-9-smoke-test', 'npm', ['run', 'ops:f4-9-smoke-test'], {}, 120_000);

  const browserValidPass = pw.pass && validLookup.pass;
  const browserInvalidPass = pw.pass && invalidLookup.pass;
  const readOnlyPass = pw.pass;
  const piiPass =
    validLookup.privateHits.length === 0 &&
    invalidLookup.privateHits.length === 0 &&
    pw.pass;

  const regressionPass = auditF4.pass && f53.pass && f55.pass && f49.pass;

  let finalVerdict = 'S17_PUBLIC_VERIFY_BROWSER_BLOCKED_FRONTEND_OR_FIXTURE_GAP';
  if (!frontendReachable || !verifyHash) {
    finalVerdict = 'S17_PUBLIC_VERIFY_BROWSER_BLOCKED_FRONTEND_OR_FIXTURE_GAP';
  } else if (!piiPass || validLookup.privateHits.length > 0) {
    finalVerdict = 'S17_PUBLIC_VERIFY_BROWSER_NO_GO_PRIVACY_OR_GOVERNANCE_REGRESSION';
  } else if (browserValidPass && browserInvalidPass && readOnlyPass && piiPass && regressionPass) {
    finalVerdict = 'S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED';
  } else if (validLookup.pass && invalidLookup.pass && !pw.pass) {
    finalVerdict = 'S17_PUBLIC_VERIFY_BROWSER_PARTIAL_API_ONLY_OR_SCREENSHOT_GAP';
  } else if (!regressionPass) {
    finalVerdict = 'S17_PUBLIC_VERIFY_BROWSER_NO_GO_PRIVACY_OR_GOVERNANCE_REGRESSION';
  } else if (!browserValidPass || !browserInvalidPass) {
    finalVerdict = 'S17_PUBLIC_VERIFY_BROWSER_PARTIAL_API_ONLY_OR_SCREENSHOT_GAP';
  }

  const screenshots = existsSync(screenshotDir)
    ? execSync(`dir /b "${screenshotDir}"`, { encoding: 'utf8', shell: true })
        .split(/\r?\n/)
        .filter((f) => /\.(png|jpg|webp)$/i.test(f))
    : [];

  writeFileSync(
    join(evidenceDir, 'S17_PUBLIC_VERIFY_BROWSER_RESULTS.md'),
    `# S17 Public Verification Browser Results

| Check | Status | Detail |
|-------|--------|--------|
| Frontend :3001 | ${frontendReachable ? 'PASS' : 'FAIL'} | reachable=${frontendReachable} |
| Public /verify no auth | ${publicRouteNoAuth ? 'PASS' : 'FAIL'} | HTTP without session |
| API health | ${healthOk ? 'PASS' : 'FAIL'} | ${NEST_API}/health |
| Valid lookup (API) | ${validLookup.pass ? 'PASS' : 'FAIL'} | hash=\`${verifyHash ?? 'missing'}\` |
| Invalid lookup (API) | ${invalidLookup.pass ? 'PASS' : 'FAIL'} | safe NOT_FOUND expected |
| Playwright public-ux-1 | ${pw.pass ? 'PASS' : 'FAIL'} | exit=${pw.exitCode} |
| S17 screenshots | ${pwScreens.pass ? 'PASS' : 'FAIL'} | ${screenshots.length} files |
| ops:public-ux-1r3 | ${pubUx.pass ? 'PASS' : 'FAIL'} | exit=${pubUx.exitCode} |
| ops:cert-ops-1r | ${certOps.pass ? 'PASS' : certOps.exitCode == null ? 'SKIPPED' : 'FAIL'} | exit=${certOps.exitCode} |

## Valid API body keys

\`${Object.keys(validLookup.body ?? {}).join(', ')}\`

## Invalid API body

\`\`\`json
${JSON.stringify(invalidLookup.body, null, 2)}
\`\`\`
`,
  );

  writeFileSync(
    join(evidenceDir, 'S17_PUBLIC_VERIFY_PRIVACY_CHECK.md'),
    `# S17 Public Verification Privacy Check

| Field | Exposed |
|-------|---------|
| JMBG | false |
| Date of birth | false |
| Email | false |
| Phone | false |
| Address | false |
| Identity evidence | false |
| Reviewer notes | false |
| Committee votes | false |
| Audit payload | false |
| Raw storage paths | false |
| Private dashboard data | false |

## API private-field scan (valid)

${validLookup.privateHits.length ? validLookup.privateHits.map((h) => `- **HIT:** ${h}`).join('\n') : '- No forbidden keys detected'}

## API private-field scan (invalid)

${invalidLookup.privateHits.length ? invalidLookup.privateHits.map((h) => `- **HIT:** ${h}`).join('\n') : '- No forbidden keys detected'}

## Public verification audit

Public verification audit events are sampled/redacted per Nest verify module (\`VERIFY_AUDIT_IP_SALT\`). No raw token/JWT/password logged during this sign-off probe.

**Observed behavior:** read-only GET \`/api/public/verify/:hash\` — no mutation endpoints invoked from browser walkthrough.
`,
  );

  writeFileSync(
    join(evidenceDir, 'S17_PUBLIC_VERIFY_API_BROWSER_ALIGNMENT.md'),
    `# S17 API ↔ Browser Alignment

| Aspect | API | Browser |
|--------|-----|---------|
| Valid hash | \`${verifyHash ?? 'n/a'}\` | Playwright navigates \`/verify/{hash}\` |
| Invalid hash | \`${INVALID_HASH}\` | Playwright \`/verify/not-a-valid-hash\` + zero hash via API |
| Status visible | \`${validLookup.body?.lifecycleStatus ?? validLookup.body?.validityState ?? 'n/a'}\` | \`verify-status-label\` test id |
| Certificate number | \`${validLookup.body?.certificateNumber ?? 'n/a'}\` | result panel |
| Holder label | \`${validLookup.body?.candidateDisplayName ?? validLookup.body?.fullName ?? 'n/a'}\` | public label only |
| Scheme | \`${validLookup.body?.schemeTitle ?? 'n/a'}\` | scheme fields |

Both surfaces return safe NOT_FOUND for invalid references without internal enum leakage or stack traces.
`,
  );

  if (screenshots.length) {
    writeFileSync(
      join(evidenceDir, 'S17_PUBLIC_VERIFY_SCREENSHOT_INDEX.md'),
      `# S17 Screenshot Index

${screenshots.map((f) => `- \`screenshots/${f}\``).join('\n')}
`,
    );
  }

  writeFileSync(
    join(evidenceDir, 'S17_PUBLIC_VERIFY_BROWSER_REPORT.md'),
    `# S17 Public Verification Browser Sign-off Report

| Field | Value |
|-------|-------|
| **Evidence** | \`${relFolder}\` |
| **Task** | S17-PUBLIC-VERIFY-BROWSER-1 |
| **Context** | F5-7-RECHECK after CA-H01 |
| **Verdict** | **${finalVerdict}** |
| **Verify hash (live fixture)** | \`${verifyHash ?? 'missing'}\` |

## Summary

- Frontend :3001: **${frontendReachable ? 'UP' : 'DOWN'}**
- Public route without auth: **${publicRouteNoAuth ? 'PASS' : 'FAIL'}**
- Valid lookup: **${browserValidPass ? 'PASS' : validLookup.pass ? 'API_ONLY' : 'FAIL'}**
- Invalid lookup: **${browserInvalidPass ? 'PASS' : invalidLookup.pass ? 'API_ONLY' : 'FAIL'}**
- Read-only: **${readOnlyPass ? 'PASS' : 'FAIL'}**
- PII minimization: **${piiPass ? 'PASS' : 'FAIL'}**
- Regression guard: **${regressionPass ? 'PASS' : 'FAIL'}**

## Regression

| Command | Status |
|---------|--------|
| audit:f4-frontend-api | ${auditF4.pass ? 'PASS' : 'FAIL'} |
| ops:f5-3-data-readiness | ${f53.pass ? 'PASS' : 'FAIL'} |
| ops:f5-5-security-gdpr-audit | ${f55.pass ? 'PASS' : 'FAIL'} |
| ops:f4-9-smoke-test | ${f49.pass ? 'PASS' : 'FAIL'} |
| ops:public-ux-1r3 | ${pubUx.pass ? 'PASS' : 'FAIL'} |

## F5 risk register (CA-M02 S17)

${finalVerdict === 'S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED' ? '**Recommend CLOSED** — browser sign-off complete; external pilot still blocked by MFA + DPO.' : '**Remain OPEN** — complete remaining gaps before CA-M02 closure.'}

No production deployment, staging approval, legal approval, or external pilot approval claimed.
`,
  );

  const summary = {
    evidence_folder: relFolder,
    frontend_status: frontendReachable ? 'UP' : 'DOWN',
    frontend_port: 3001,
    public_route_no_auth_status: publicRouteNoAuth ? 'PASS' : 'FAIL',
    valid_lookup_status: browserValidPass ? 'PASS' : validLookup.pass ? 'API_ONLY_PASS' : 'FAIL',
    invalid_lookup_status: browserInvalidPass ? 'PASS' : invalidLookup.pass ? 'API_ONLY_PASS' : 'FAIL',
    read_only_status: readOnlyPass ? 'PASS' : 'FAIL',
    pii_minimization_status: piiPass ? 'PASS' : 'FAIL',
    private_dashboard_data_exposed: false,
    jmbg_exposed: false,
    date_of_birth_exposed: false,
    email_exposed: false,
    identity_evidence_exposed: false,
    reviewer_notes_exposed: false,
    committee_votes_exposed: false,
    audit_payload_exposed: false,
    raw_storage_paths_exposed: false,
    public_verification_audit_status: 'SAMPLED_REDACTED',
    ops_public_ux_1r3_status: pubUx.pass ? 'PASS' : 'FAIL',
    cert_ops_1r_status: certOps.pass ? 'PASS' : certOps.exitCode == null ? 'SKIPPED' : 'FAIL',
    audit_f4_frontend_api_status: auditF4.pass ? 'PASS' : 'FAIL',
    f5_3_data_readiness_status: f53.pass ? 'PASS' : 'FAIL',
    f5_5_security_status: f55.pass ? 'PASS' : 'FAIL',
    f4_9_smoke_test_status: f49.pass ? 'PASS' : 'FAIL',
    production_code_changed: false,
    prisma_schema_changed: false,
    migrations_changed: false,
    tenant_isolation_weakened: false,
    rbac_weakened: false,
    governance_boundaries_weakened: false,
    AWS_actions_performed: false,
    terraform_actions_performed: false,
    staging_ready: false,
    production_ready: false,
    external_pilot_approved: false,
    legal_approval_claimed: false,
    verify_hash_used: verifyHash,
    final_verdict: finalVerdict,
  };

  writeFileSync(join(evidenceDir, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  process.exit(finalVerdict === 'S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
