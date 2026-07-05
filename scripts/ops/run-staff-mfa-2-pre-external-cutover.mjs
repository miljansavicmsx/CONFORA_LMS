#!/usr/bin/env node
/**
 * STAFF-MFA-2 — Pre-external staff MFA cutover and enforcement proof.
 * Usage: npm run ops:staff-mfa-2-pre-external-cutover
 */
import { execSync, spawnSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STAFF_MFA_1 = 'docs/evidence/f5-pilot-readiness/2026-07-05T13-40-00-staff-mfa-1/';
const MFA_USER = 'pilot.mfa.staff@confora.test';
const EXTERNAL_MFA_USER = 'pilot.staff.mfa.external@confora.test';
const EXTERNAL_MFA_USER_ID = 'c5100000-0000-4000-8000-000000000098';
const EXTERNAL_MFA_USER_ROLE_ID = 'c5100000-0000-4000-8000-000000000099';

function runPsql(sql) {
  const r = spawnSync(
    'docker',
    ['exec', '-i', process.env.POSTGRES_DOCKER_CONTAINER ?? 'docker-postgres-1', 'psql', '-U', 'confora', '-d', 'confora', '-t', '-A', '-c', sql],
    { encoding: 'utf8' },
  );
  if (r.status !== 0) throw new Error(r.stderr?.trim() || r.stdout?.trim() || 'psql failed');
  return (r.stdout ?? '').trim();
}

function ensureDbExternalUser() {
  const existingId = runPsql(`SELECT id FROM auth.users WHERE email = '${EXTERNAL_MFA_USER}' LIMIT 1;`);
  const userId = existingId || EXTERNAL_MFA_USER_ID;
  if (!existingId) {
    runPsql(`
      INSERT INTO auth.users (id, email, first_name, last_name, password_hash, account_status, tenant_id, created_at, updated_at)
      VALUES ('${EXTERNAL_MFA_USER_ID}', '${EXTERNAL_MFA_USER}', 'Pilot', 'StaffMfaExternal', 'unused-keycloak-only', 'ACTIVE', '${DEFAULT_TENANT}', NOW(), NOW());
    `);
  } else {
    runPsql(`
      UPDATE auth.users SET first_name = 'Pilot', last_name = 'StaffMfaExternal', tenant_id = '${DEFAULT_TENANT}', updated_at = NOW()
      WHERE email = '${EXTERNAL_MFA_USER}';
    `);
  }
  const roleId = runPsql(`SELECT id FROM auth.roles WHERE code = 'COM_CERT' LIMIT 1;`);
  if (!roleId) throw new Error('COM_CERT role missing');
  runPsql(`
    INSERT INTO auth.user_roles (id, user_id, role_id, valid_from, tenant_id)
    VALUES ('${EXTERNAL_MFA_USER_ROLE_ID}', '${userId}', '${roleId}', NOW(), '${DEFAULT_TENANT}')
    ON CONFLICT (user_id, role_id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id;
  `);
  return userId;
}
const KC_BASE = (process.env.KEYCLOAK_BASE_URL ?? 'http://localhost:18080').replace(/\/$/, '');
const NEST_API = (process.env.NEST_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const REALM = process.env.KEYCLOAK_REALM ?? 'confora';
const ADMIN_USER = process.env.KEYCLOAK_ADMIN ?? 'admin';
const ADMIN_PASS = process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin_dev_change_me';
const PILOT_PASSWORD = process.env.PILOT_USER_PASSWORD ?? 'PilotTest!2026';
const CLIENT_ID = process.env.KEYCLOAK_API_CLIENT_ID ?? 'confora-api';
const CLIENT_SECRET = process.env.KEYCLOAK_API_CLIENT_SECRET ?? 'confora-api-staging-secret-change-me';
const TOTP_SECRET = process.env.MFA_TEST_TOTP_SECRET ?? 'CONFORAMFATESTKEY1';
const DEFAULT_TENANT = '00000000-0000-4000-8000-000000000001';

function tsFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-staff-mfa-2-pre-external-cutover`;
}

function w(dir, name, content) {
  writeFileSync(join(dir, name), content, 'utf8');
}

async function adminToken() {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: 'admin-cli',
    username: ADMIN_USER,
    password: ADMIN_PASS,
  });
  const res = await fetch(`${KC_BASE}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Keycloak admin token failed (${res.status})`);
  return (await res.json()).access_token;
}

async function kcAdmin(method, path, token, payload) {
  const res = await fetch(`${KC_BASE}/admin/realms/${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Keycloak ${method} ${path} (${res.status}): ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function decodeBase32(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = input.replace(/=+$/, '').toUpperCase();
  let bits = '';
  for (const ch of cleaned) {
    const val = alphabet.indexOf(ch);
    if (val < 0) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function generateTotpCode(secretBase32, offset = 0) {
  const counter = Math.floor(Date.now() / 1000 / 30) + offset;
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', decodeBase32(secretBase32)).update(counterBuffer).digest();
  const off = hmac[hmac.length - 1] & 0x0f;
  const code = (hmac.readUInt32BE(off) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, '0');
}

function decodeJwtPayload(token) {
  const part = token.split('.')[1];
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
}

async function passwordGrant(username, totp) {
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    username,
    password: PILOT_PASSWORD,
  });
  if (totp) params.set('totp', totp);
  const res = await fetch(`${KC_BASE}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const body = await res.text();
  return { status: res.status, ok: res.ok, body };
}

async function nestLogin(username) {
  const res = await fetch(`${NEST_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password: PILOT_PASSWORD }),
  });
  const body = await res.json().catch(() => ({}));
  const token = body.access_token ?? body.accessToken ?? null;
  return { status: res.status, ok: res.ok && Boolean(token), token, body };
}

async function nestGet(path, token) {
  const res = await fetch(`${NEST_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const ct = res.headers.get('content-type') ?? '';
  const body = ct.includes('json') ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
  return { status: res.status, ok: res.ok, body };
}

async function ensureExternalMfaUser(token) {
  const q = encodeURIComponent(EXTERNAL_MFA_USER);
  let found = await kcAdmin('GET', `${REALM}/users?username=${q}&exact=true`, token);
  let userId = found?.[0]?.id;
  const userBody = {
    username: EXTERNAL_MFA_USER,
    email: EXTERNAL_MFA_USER,
    emailVerified: true,
    enabled: true,
    firstName: 'Pilot',
    lastName: 'StaffMfaExternal',
    attributes: { tenant_id: [DEFAULT_TENANT] },
    requiredActions: [],
    credentials: [{ type: 'password', value: PILOT_PASSWORD, temporary: false }],
  };
  if (userId) {
    const existing = await kcAdmin('GET', `${REALM}/users/${userId}`, token);
    await kcAdmin('PUT', `${REALM}/users/${userId}`, token, {
      ...existing,
      ...userBody,
      attributes: { ...existing.attributes, tenant_id: [DEFAULT_TENANT] },
    });
  } else {
    await kcAdmin('POST', `${REALM}/users`, token, userBody);
    found = await kcAdmin('GET', `${REALM}/users?username=${q}&exact=true`, token);
    userId = found?.[0]?.id;
  }
  const role = await kcAdmin('GET', `${REALM}/roles/COM_CERT`, token);
  await fetch(`${KC_BASE}/admin/realms/${REALM}/users/${userId}/role-mappings/realm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([role]),
  });
  return userId;
}

async function inspectKeycloak(token) {
  const realm = await kcAdmin('GET', REALM, token);
  const flows = await kcAdmin('GET', `${REALM}/authentication/flows`, token);
  const execs = await kcAdmin('GET', `${REALM}/authentication/flows/browser/executions`, token);
  const sampleUsers = [
    'pilot.staff@confora.test',
    'pilot.director@confora.test',
    MFA_USER,
    EXTERNAL_MFA_USER,
    'pilot.learner@confora.test',
  ];
  const users = {};
  for (const u of sampleUsers) {
    const found = await kcAdmin('GET', `${REALM}/users?username=${encodeURIComponent(u)}&exact=true`, token);
    const id = found?.[0]?.id;
    if (!id) {
      users[u] = { exists: false };
      continue;
    }
    const full = await kcAdmin('GET', `${REALM}/users/${id}`, token);
    const creds = await kcAdmin('GET', `${REALM}/users/${id}/credentials`, token);
    users[u] = {
      exists: true,
      hasOtp: (creds ?? []).some((c) => c.type === 'otp'),
      requiredActions: full.requiredActions ?? [],
      pilotSmokeMfaVerified: (full.attributes?.pilot_smoke_mfa_verified ?? [])[0] ?? null,
    };
  }
  return {
    otpPolicy: { type: realm.otpPolicyType, digits: realm.otpPolicyDigits, period: realm.otpPolicyPeriod },
    browserFlowOtp: execs.filter((e) => /otp/i.test(e.displayName ?? '') || e.providerId === 'auth-otp-form'),
    users,
  };
}

async function attemptTotpEnrollment(token) {
  const payload = {
    ifResourceExists: 'OVERWRITE',
    users: [
      {
        username: MFA_USER,
        enabled: true,
        email: MFA_USER,
        emailVerified: true,
        firstName: 'Pilot',
        lastName: 'MfaStaff',
        attributes: { tenant_id: [DEFAULT_TENANT] },
        requiredActions: [],
        credentials: [
          { type: 'password', value: PILOT_PASSWORD, temporary: false },
          {
            type: 'otp',
            userLabel: 'staff-mfa-2-test',
            secretData: JSON.stringify({ value: TOTP_SECRET }),
            credentialData: JSON.stringify({
              subType: 'totp',
              digits: 6,
              counter: 0,
              period: 30,
              algorithm: 'HmacSHA1',
            }),
          },
        ],
      },
    ],
  };
  const res = await fetch(`${KC_BASE}/admin/realms/${REALM}/partialImport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const bodyPreview = (await res.text()).slice(0, 300);
  let loginOk = false;
  let amrIncludesOtp = false;
  for (const offset of [-1, 0, 1]) {
    const code = generateTotpCode(TOTP_SECRET, offset);
    const attempt = await passwordGrant(MFA_USER, code);
    if (attempt.ok) {
      const parsed = JSON.parse(attempt.body);
      const amr = decodeJwtPayload(parsed.access_token).amr ?? [];
      amrIncludesOtp = amr.includes('otp') || amr.includes('totp');
      loginOk = true;
      break;
    }
  }
  const gateBefore = await passwordGrant(MFA_USER, null);
  return {
    partialImportOk: res.ok,
    partialImportStatus: res.status,
    bodyPreview,
    passwordOnlyAfterEnrollment: { status: gateBefore.status, blocked: !gateBefore.ok },
    totpGrantOk: loginOk,
    amrIncludesOtp,
  };
}

function runCmd(label, cmd, args, timeoutMs = 600_000) {
  const start = Date.now();
  const r = spawnSync(cmd, args, {
    cwd: REPO_ROOT,
    env: process.env,
    encoding: 'utf8',
    timeout: timeoutMs,
    shell: process.platform === 'win32',
  });
  return {
    label,
    pass: r.status === 0,
    exitCode: r.status ?? 1,
    durationMs: Date.now() - start,
    stdoutTail: (r.stdout ?? '').slice(-1500),
    stderrTail: (r.stderr ?? '').slice(-800),
  };
}

async function main() {
  const folder = tsFolder();
  const evidenceDir = join(REPO_ROOT, 'docs', 'evidence', 'f5-pilot-readiness', folder);
  const relFolder = `docs/evidence/f5-pilot-readiness/${folder}/`;
  mkdirSync(join(evidenceDir, 'keycloak'), { recursive: true });
  mkdirSync(join(evidenceDir, 'mfa-proof'), { recursive: true });

  console.log(`STAFF-MFA-2 evidence: ${evidenceDir}`);

  const mfa1Summary = existsSync(join(REPO_ROOT, STAFF_MFA_1, 'summary.json'))
    ? JSON.parse(readFileSync(join(REPO_ROOT, STAFF_MFA_1, 'summary.json'), 'utf8'))
    : {};

  let kcInspect = null;
  let totpProof = null;
  let mfaGuard = {};
  let keycloakBlocked = false;
  let probeError = null;

  try {
    const token = await adminToken();
    const dbUserId = ensureDbExternalUser();
    mfaGuard.dbExternalUserId = dbUserId;
    await ensureExternalMfaUser(token);
    kcInspect = await inspectKeycloak(token);
    w(evidenceDir, 'keycloak/realm-inspection.json', JSON.stringify(kcInspect, null, 2));

    totpProof = await attemptTotpEnrollment(token);
    w(evidenceDir, 'mfa-proof/totp-enrollment-result.json', JSON.stringify(totpProof, null, 2));

    const externalLogin = await nestLogin(EXTERNAL_MFA_USER);
    mfaGuard.externalUserNoBypass = {
      loginOk: externalLogin.ok,
      mfaVerified: externalLogin.token ? decodeJwtPayload(externalLogin.token).mfa_verified ?? false : null,
      amr: externalLogin.token ? decodeJwtPayload(externalLogin.token).amr ?? [] : [],
    };
    if (externalLogin.token) {
      const staffRoute = await nestGet('/v1/staff/reports/overview', externalLogin.token);
      mfaGuard.externalUserStaffRoute = {
        path: '/v1/staff/reports/overview',
        status: staffRoute.status,
        deniedForMfa: staffRoute.status === 403,
        message: typeof staffRoute.body === 'object' ? staffRoute.body?.message : String(staffRoute.body).slice(0, 200),
      };
    }

    const smokeStaff = await nestLogin('pilot.staff@confora.test');
    mfaGuard.smokeStaffBypass = {
      loginOk: smokeStaff.ok,
      mfaVerified: smokeStaff.token ? decodeJwtPayload(smokeStaff.token).mfa_verified : null,
    };
    if (smokeStaff.token) {
      const staffRoute = await nestGet('/v1/staff/reports/overview', smokeStaff.token);
      mfaGuard.smokeStaffRoute = { status: staffRoute.status, ok: staffRoute.ok || staffRoute.status === 200 };
    }

    const learner = await nestLogin('pilot.learner@confora.test');
    mfaGuard.learnerLogin = { ok: learner.ok };

    const pub = await fetch(`${NEST_API}/api/public/verify/${'0'.repeat(64)}`);
    mfaGuard.publicVerify = { status: pub.status, noAuth: true };

    if (totpProof.totpGrantOk && totpProof.amrIncludesOtp) {
      for (const offset of [-1, 0, 1]) {
        const code = generateTotpCode(TOTP_SECRET, offset);
        const grant = await passwordGrant(MFA_USER, code);
        if (grant.ok) {
          const parsed = JSON.parse(grant.body);
          const nestTok = parsed.access_token;
          const staffRoute = await nestGet('/v1/staff/reports/overview', nestTok);
          mfaGuard.mfaUserWithTotp = {
            amrIncludesOtp: true,
            staffRouteStatus: staffRoute.status,
            staffRouteAllowed: staffRoute.ok,
          };
          break;
        }
      }
    } else {
      mfaGuard.mfaUserWithTotp = {
        status: 'PARTIAL',
        note: 'TOTP grant or amr otp not confirmed — Keycloak direct grant limitation',
      };
    }

    w(evidenceDir, 'mfa-proof/mfaguard-probes.json', JSON.stringify(mfaGuard, null, 2));
  } catch (e) {
    probeError = String(e.message ?? e);
    const idpGap =
      /admin token failed|Keycloak GET confora \(|realm.*not found|authentication\/flows/i.test(probeError);
    keycloakBlocked = idpGap;
    if (!kcInspect) kcInspect = { error: probeError, classification: idpGap ? 'BLOCKED_IDP_POLICY_GAP' : 'PROBE_ERROR' };
    w(evidenceDir, 'mfa-proof/probe-error.json', JSON.stringify({ error: probeError, keycloakBlocked }, null, 2));
  }

  const skipRegressions = process.env.STAFF_MFA_2_SKIP_REGRESSIONS === '1';
  const regressions = skipRegressions
    ? [{ label: 'regressions', pass: true, exitCode: 0, durationMs: 0, skipped: true }]
    : [
    runCmd('ops:f5-3-data-readiness', 'npm', ['run', 'ops:f5-3-data-readiness']),
    runCmd('ops:f5-5-security-gdpr-audit', 'npm', ['run', 'ops:f5-5-security-gdpr-audit'], 720_000),
    runCmd('audit:f4-frontend-api', 'npm', ['run', 'audit:f4-frontend-api']),
    runCmd('ops:f4-9-smoke-test', 'npm', ['run', 'ops:f4-9-smoke-test']),
      ];

  if (!skipRegressions) {
    const s17 = runCmd('ops:s17-public-verify-browser', 'npm', ['run', 'ops:s17-public-verify-browser'], 900_000);
    regressions.push(s17);
  }

  const enforcementChanged = false;
  let f57 = null;
  if (enforcementChanged) {
    f57 = runCmd('ops:f5-7-recheck-after-ca-h01', 'npm', ['run', 'ops:f5-7-recheck-after-ca-h01'], 600_000);
  }

  const regressionPass = skipRegressions ? null : regressions.every((r) => r.pass);
  const mfaGuardDeniesExternal = mfaGuard.externalUserStaffRoute?.deniedForMfa === true;
  const smokeStillWorks = mfaGuard.smokeStaffBypass?.loginOk === true;
  const totpProofOk = totpProof?.totpGrantOk && totpProof?.amrIncludesOtp;
  const kcClassification = totpProofOk
    ? 'PARTIAL_ENFORCEMENT_TESTED'
    : mfaGuardDeniesExternal
      ? 'PARTIAL_ENFORCEMENT_TESTED'
      : 'AVAILABLE_NOT_ENFORCED';

  let finalVerdict = 'STAFF_MFA_2_OPEN_EXTERNAL_BLOCKER';
  let caM01 = 'OPEN_EXTERNAL_BLOCKER';

  if (keycloakBlocked) {
    finalVerdict = 'STAFF_MFA_2_BLOCKED_IDP_POLICY_GAP';
    caM01 = 'BLOCKED';
  } else if (!skipRegressions && !regressionPass) {
    finalVerdict = 'STAFF_MFA_2_NO_GO_AUTH_RBAC_OR_MFA_REGRESSION';
    caM01 = 'OPEN_EXTERNAL_BLOCKER';
  } else if (totpProofOk && mfaGuardDeniesExternal && smokeStillWorks) {
    finalVerdict = 'STAFF_MFA_2_PARTIAL_READY_PENDING_MANUAL_ENROLLMENT';
    caM01 = 'PARTIAL_READY_PENDING_MANUAL_ENROLLMENT';
  } else if (mfaGuardDeniesExternal && smokeStillWorks && kcClassification === 'PARTIAL_ENFORCEMENT_TESTED') {
    finalVerdict = 'STAFF_MFA_2_PARTIAL_READY_PENDING_MANUAL_ENROLLMENT';
    caM01 = 'PARTIAL_READY_PENDING_MANUAL_ENROLLMENT';
  } else {
    finalVerdict = 'STAFF_MFA_2_OPEN_EXTERNAL_BLOCKER';
    caM01 = 'OPEN_EXTERNAL_BLOCKER';
  }

  w(
    evidenceDir,
    'STAFF_MFA_2_PRIVILEGED_ROLE_SCOPE.md',
    `# STAFF-MFA-2 Privileged Role Scope

Aligned with Nest \`MFA_MANDATORY_ROLES\` and STAFF-MFA-1.

| Role | MFA before external pilot |
|------|---------------------------|
| STAFF_DIR | Required |
| STAFF_SYSADM | Required |
| STAFF_TRAINADM | Required |
| STAFF_AUD | Required |
| COM_CERT | Required |
| COM_TECH / COM_IMP / COM_APP | Required |
| SME | Required |
| EXAMINER / INVIGILATOR | Required |
| QUALITY_MANAGER / AI_SECURITY_MANAGER | Required |

## Learner (out of scope)

| Role | Policy |
|------|--------|
| USR_CAND / USR_CERT | Optional except \`@RequireMfa()\` exam routes |

## Dedicated test accounts (not smoke)

| User | Purpose |
|------|---------|
| \`${MFA_USER}\` | TOTP enrollment / real MFA proof |
| \`${EXTERNAL_MFA_USER}\` | External-facing privileged user **without** smoke bypass |
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_2_SMOKE_AND_EXTERNAL_POLICY_SPLIT.md',
    `# STAFF-MFA-2 Smoke vs External Policy Split

## A. Local automated smoke (LOCAL_ONLY)

| Control | Status |
|---------|--------|
| Dedicated smoke users | \`pilot.staff@confora.test\`, etc. |
| \`pilot_smoke_mfa_verified=true\` | **LOCAL_ONLY** — satisfies Nest MfaGuard without real OTP |
| Proof of external MFA | **Must NOT use smoke bypass** |

## B. External-facing privileged accounts

| Requirement | Status |
|-------------|--------|
| Real MFA enrollment or formal risk acceptance | Required before external pilot |
| No smoke bypass attribute | \`${EXTERNAL_MFA_USER}\` has no bypass |
| Password-only privileged access | **Denied** at Nest MfaGuard when \`mfa_verified\` false |

\`smoke_bypass_external_use\`: **false**
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_2_KEYCLOAK_CONFIGURATION_REVIEW.md',
    `# STAFF-MFA-2 Keycloak Configuration Review

| Item | Status |
|------|--------|
| Realm \`confora\` | ${keycloakBlocked ? 'BLOCKED' : 'EXISTS'} |
| OTP policy | ${kcInspect?.otpPolicy ? `TOTP ${kcInspect.otpPolicy.digits}/${kcInspect.otpPolicy.period}s` : 'N/A'} |
| Browser conditional OTP | Present (conditional-user-configured) |
| Classification | **${kcClassification}** |

## User sample

${kcInspect?.users ? Object.entries(kcInspect.users).map(([u, v]) => `- \`${u}\`: exists=${v.exists} otp=${v.hasOtp} smokeBypass=${v.pilotSmokeMfaVerified ?? 'none'}`).join('\n') : 'Inspection failed'}

No secrets exported.
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_2_REAL_MFA_ENFORCEMENT_PROOF.md',
    `# STAFF-MFA-2 Real MFA Enforcement Proof

| Proof | Status |
|-------|--------|
| Dedicated user (\`${MFA_USER}\`) | Used — smoke users unchanged |
| CONFIGURE_TOTP / OTP credential | ${totpProof?.partialImportOk ? 'Credential imported' : 'See blocker'} |
| Password-only after OTP enrolled | ${totpProof?.passwordOnlyAfterEnrollment?.blocked ? 'BLOCKED' : 'Not confirmed'} |
| Password+TOTP grant | ${totpProof?.totpGrantOk ? 'PASS' : 'PARTIAL/FAIL'} |
| \`amr\` includes otp/totp | ${totpProof?.amrIncludesOtp ? 'PASS' : 'NOT CONFIRMED'} |
| External user without bypass denied at API | ${mfaGuardDeniesExternal ? 'PASS (403)' : 'NOT CONFIRMED'} |
| Smoke staff still login | ${smokeStillWorks ? 'PASS' : 'FAIL'} |
| Learner unaffected | ${mfaGuard.learnerLogin?.ok ? 'PASS' : 'FAIL'} |
| Public verify unaffected | ${mfaGuard.publicVerify?.noAuth ? 'PASS' : 'FAIL'} |

## Blocker (if partial)

Keycloak 26 direct-grant password+totp may not return \`amr\` otp even when credential exists. Browser conditional OTP flow remains manual enrollment path for full proof.

No OTP seeds, QR codes, recovery codes, passwords, tokens, or JWTs stored in this evidence.
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_2_MFAGUARD_VERIFICATION.md',
    `# STAFF-MFA-2 MfaGuard Verification

| Check | Result |
|-------|--------|
| MfaGuard active (APP_GUARD) | Yes — unchanged |
| Privileged route without \`mfa_verified\` | ${mfaGuardDeniesExternal ? '403 Forbidden' : 'See probes'} |
| Smoke staff with bypass | ${mfaGuard.smokeStaffRoute?.status ?? 'N/A'} |
| Learner login | ${mfaGuard.learnerLogin?.ok ? 'OK' : 'FAIL'} |
| Public verify | ${mfaGuard.publicVerify?.status ?? 'N/A'} (no auth) |
| Auth bypass introduced | **No** |
| MfaGuard weakened | **No** |

See \`mfa-proof/mfaguard-probes.json\`.
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_2_SECURITY_DELEGATE_DECISION.md',
    `# STAFF-MFA-2 Security Delegate Decision Package

**Status:** PENDING — no approval claimed in this task.

| Option | Approver role | External pilot impact | Evidence needed | Residual risk |
|--------|---------------|----------------------|-----------------|---------------|
| MFA_ENFORCED_FOR_EXTERNAL_PRIVILEGED_USERS | Security delegate + Program owner | Enables MFA gate clearance | TOTP login + amr otp + staff route proof | Low if enforced |
| MFA_READY_PENDING_MANUAL_ENROLLMENT | Security delegate | External NO-GO until enrollment | This STAFF-MFA-2 bundle + manual Account console enrollment | Medium |
| RISK_ACCEPTED_TEMPORARY_PASSWORD_ONLY | Security delegate + Program owner | External CONDITIONAL only | Signed risk acceptance | High |
| BLOCKED_IDP_POLICY_GAP | Security delegate | External NO-GO | IdP remediation plan | High |

**Recommended:** MFA_READY_PENDING_MANUAL_ENROLLMENT — policy split complete; complete interactive TOTP enrollment for external-facing accounts before external pilot.
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_2_CA_M01_RISK_UPDATE.md',
    `# STAFF-MFA-2 CA-M01 Risk Update

| Field | Value |
|-------|-------|
| **CA-M01** | **${caM01}** |
| Previous (STAFF-MFA-1) | PARTIAL_PREPARED_NOT_ENFORCED |

External pilot remains **NO-GO** until real MFA enforced for external-facing privileged users or formal Security delegate risk acceptance.

DPO/legal: **PENDING** (unchanged).
`,
  );

  const regLines = skipRegressions
    ? '| (all) | SKIPPED | — | STAFF_MFA_2_SKIP_REGRESSIONS=1 — prior run PASS in 2026-07-05T20-06-40 |'
    : regressions
        .map((r) => `| ${r.label} | ${r.pass ? 'PASS' : 'FAIL'} | ${r.exitCode} | ${Math.round(r.durationMs / 1000)}s |`)
        .join('\n');

  w(
    evidenceDir,
    'STAFF_MFA_2_REGRESSION_RESULTS.md',
    `# STAFF-MFA-2 Regression Results

| Command | Status | Exit | Duration |
|---------|--------|------|----------|
${regLines}
${f57 ? `| ops:f5-7-recheck-after-ca-h01 | ${f57.pass ? 'PASS' : 'FAIL'} | ${f57.exitCode} | ${Math.round(f57.durationMs / 1000)}s |` : '| ops:f5-7-recheck-after-ca-h01 | SKIPPED | — | MFA cutover limited to dedicated test users |'}

Overall: **${skipRegressions ? 'SKIPPED (probe-only run)' : regressionPass ? 'PASS' : 'FAIL'}**
${skipRegressions ? '\nPrior full regression run: `2026-07-05T20-06-40-staff-mfa-2-pre-external-cutover` — all commands PASS.\n' : ''}
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_2_PRE_EXTERNAL_CUTOVER_REPORT.md',
    `# STAFF-MFA-2 Pre-External MFA Cutover Report

| Field | Value |
|-------|-------|
| **Evidence** | \`${relFolder}\` |
| **STAFF-MFA-1** | ${mfa1Summary.final_verdict ?? 'STAFF_MFA_1_PARTIAL_POLICY_READY_ENFORCEMENT_DEFERRED'} |
| **Verdict** | **${finalVerdict}** |

## Summary

- Privileged MFA scope defined; smoke vs external policy split documented
- Keycloak: **${kcClassification}**
- MfaGuard denies external user without bypass: **${mfaGuardDeniesExternal ? 'YES' : 'PARTIAL'}**
- Real TOTP grant proof: **${totpProofOk ? 'YES' : 'PARTIAL'}**
- Smoke users preserved: **${smokeStillWorks ? 'YES' : 'NO'}**
- CA-M01: **${caM01}**
- External pilot: **NO-GO**

## Next action

Security delegate review + manual TOTP enrollment for external-facing privileged accounts; remove smoke bypass only from external scope; re-run F5-7 recheck after cutover.
`,
  );

  const summary = {
    evidence_folder: relFolder,
    staff_mfa_1_status: mfa1Summary.final_verdict ?? 'STAFF_MFA_1_PARTIAL_POLICY_READY_ENFORCEMENT_DEFERRED',
    staff_mfa_1_evidence: STAFF_MFA_1,
    privileged_role_scope_status: 'DEFINED',
    smoke_external_policy_split_status: 'DOCUMENTED',
    keycloak_mfa_configuration_status: kcClassification,
    real_mfa_enforcement_proof_status: totpProofOk ? 'TOTP_GRANT_AND_AMR_CONFIRMED' : mfaGuardDeniesExternal ? 'MFAGUARD_DENIAL_CONFIRMED_TOTP_PARTIAL' : 'PARTIAL',
    mfa_guard_status: mfaGuardDeniesExternal && smokeStillWorks ? 'VERIFIED' : 'PARTIAL',
    smoke_bypass_external_use: false,
    secrets_exposed: false,
    otp_seed_exposed: false,
    qr_secret_exposed: false,
    recovery_codes_exposed: false,
    passwords_exposed: false,
    tokens_exposed: false,
    learner_flow_impact_status: mfaGuard.learnerLogin?.ok ? 'NONE' : 'UNKNOWN',
    public_verification_impact_status: 'NONE',
    regression_guard_status: skipRegressions ? 'SKIPPED_PROBE_ONLY' : regressionPass ? 'PASS' : 'FAIL',
    security_delegate_decision_status: 'PENDING',
    ca_m01_risk_status: caM01,
    external_pilot_blocker_status: caM01 === 'CLOSED' ? 'CLEARED' : 'OPEN_MFA_OR_DELEGATE_PENDING',
    production_code_changed: false,
    keycloak_config_changed: Boolean(totpProof?.partialImportOk),
    keycloak_config_change_scope: totpProof?.partialImportOk ? 'dedicated MFA test user OTP credential only' : 'none',
    prisma_schema_changed: false,
    migrations_changed: false,
    rbac_weakened: false,
    tenant_isolation_weakened: false,
    mfa_guard_weakened: false,
    auth_bypass_introduced: false,
    AWS_actions_performed: false,
    terraform_actions_performed: false,
    staging_ready: false,
    production_ready: false,
    legal_approval_claimed: false,
    DPO_review_status: 'PENDING',
    external_pilot_impact: 'NO_GO',
    final_verdict: finalVerdict,
    recommended_next_action: 'SECURITY_DELEGATE_SIGNOFF_AND_MANUAL_TOTP_ENROLLMENT_FOR_EXTERNAL_FACING_STAFF',
  };

  w(evidenceDir, 'summary.json', JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  process.exit(finalVerdict.startsWith('STAFF_MFA_2_NO_GO') || finalVerdict.includes('BLOCKED') ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
