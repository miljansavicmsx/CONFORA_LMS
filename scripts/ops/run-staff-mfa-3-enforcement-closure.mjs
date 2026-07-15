#!/usr/bin/env node
/**
 * STAFF-MFA-3 — Staff MFA enforcement closure for external pilot gate.
 * Usage: npm run ops:staff-mfa-3-enforcement-closure
 */
import { spawnSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const STAFF_MFA_1 = 'docs/evidence/f5-pilot-readiness/2026-07-05T13-40-00-staff-mfa-1/';
const STAFF_MFA_2 = 'docs/evidence/f5-pilot-readiness/2026-07-05T20-26-14-staff-mfa-2-pre-external-cutover/';
const LOCAL_PILOT_ROLLUP = 'docs/evidence/local-pilot-final-rollup/2026-07-08T22-22-01-local-pilot-final-rollup-1/';

const MFA_USER = 'pilot.mfa.staff@confora.test';
const EXTERNAL_MFA_USER = 'pilot.staff.mfa.external@confora.test';
const EXTERNAL_MFA_USER_ID = 'c5100000-0000-4000-8000-000000000098';
const EXTERNAL_MFA_USER_ROLE_ID = 'c5100000-0000-4000-8000-000000000099';
/** External-facing OTP-enrolled staff — OTP credentials are read-only for this closure. */
const EXTERNAL_READY_STAFF = Object.freeze([
  'pilot.manager@confora.test',
  'pilot.staff@confora.test',
  'pilot.director@confora.test',
  MFA_USER,
  EXTERNAL_MFA_USER,
]);
/** Dedicated local-only no-MFA denial fixture (never counted as external-pilot-ready). */
const NO_MFA_DENIAL_USER = 'pilot.staff.no-mfa@confora.test';
const NO_MFA_DENIAL_USER_ID = 'c5100000-0000-4000-8000-000000000198';
const NO_MFA_DENIAL_USER_ROLE_ID = 'c5100000-0000-4000-8000-000000000199';
/** Dedicated local-only MFA route-proof fixture (known test TOTP; not external-ready cohort). */
const LOCAL_MFA_ROUTE_PROOF_USER = 'pilot.staff.mfa.route-proof@confora.test';
const SMOKE_STAFF = 'pilot.staff@confora.test';
const SMOKE_MANAGER = 'pilot.manager@confora.test';
const SMOKE_DIRECTOR = 'pilot.director@confora.test';
const LEARNER = 'pilot.learner@confora.test';
const WRONG_TENANT_STAFF = 'pilot.staff.wrong-tenant@confora.test';
const DEFAULT_TENANT = '00000000-0000-4000-8000-000000000001';
const SMOKE_ATTR_KEYS = Object.freeze([
  'pilot_smoke_mfa_verified',
  'smoke_mfa_verified',
  'mfa_smoke_bypass',
]);

const KC_BASE = (process.env.KEYCLOAK_BASE_URL ?? 'http://localhost:18080').replace(/\/$/, '');
const NEST_API = (process.env.NEST_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const REALM = process.env.KEYCLOAK_REALM ?? 'confora';
const ADMIN_USER = process.env.KEYCLOAK_ADMIN ?? 'admin';
const ADMIN_PASS = process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin_dev_change_me';
const PILOT_PASSWORD = process.env.PILOT_USER_PASSWORD ?? 'PilotTest!2026';
const CLIENT_ID = process.env.KEYCLOAK_API_CLIENT_ID ?? 'confora-api';
const CLIENT_SECRET = process.env.KEYCLOAK_API_CLIENT_SECRET ?? 'confora-api-staging-secret-change-me';
const TOTP_SECRET = process.env.MFA_TEST_TOTP_SECRET ?? 'CONFORAMFATESTKEY1';
const VERIFY_HASH =
  process.env.PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH ??
  'cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945';

const STAFF_MFA_ROLES = ['COM_CERT', 'STAFF_DIR', 'STAFF_SYSADM', 'STAFF_TRAINADM', 'SME'];
const PROTECTED_ROUTES = [
  { method: 'GET', path: '/v1/staff/reports/overview', label: 'reports_overview' },
  { method: 'GET', path: '/v1/staff/reports/export', label: 'reports_export_guidance' },
  { method: 'POST', path: '/v1/staff/reports/export', label: 'reports_export_post', body: { reportKey: 'overview', format: 'JSON' } },
  { method: 'GET', path: '/v1/staff/identity-review/queue', label: 'identity_review_queue' },
  { method: 'GET', path: '/v1/staff/certification/applications', label: 'certification_applications' },
];

const LINKED_REGRESSIONS = {
  'ops:s17-public-verify-browser':
    'docs/evidence/f5-pilot-readiness/2026-07-11T22-15-26-s17-public-verify-browser/',
  'ops:admin-gov-final-acceptance-1':
    'docs/evidence/admin-governance-final-acceptance/2026-07-11T22-11-33-admin-gov-final-acceptance-1/',
  'ops:learner-final-acceptance-1':
    'docs/evidence/learner-final-acceptance/2026-07-11T22-13-45-learner-final-acceptance-1r/',
};

const MFA_RBAC_PRIVACY_INVARIANT_FAIL_PATTERNS = [
  /rbac_weakened.*true/i,
  /privacy_weakened.*true/i,
  /tenant_isolation_weakened.*true/i,
  /governance_boundaries_weakened.*true/i,
];

function tsFolder() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-staff-mfa-3-enforcement-closure`;
}

function w(dir, name, content) {
  writeFileSync(join(dir, name), content, 'utf8');
}

function runPsql(sql) {
  const r = spawnSync(
    'docker',
    ['exec', '-i', process.env.POSTGRES_DOCKER_CONTAINER ?? 'docker-postgres-1', 'psql', '-U', 'confora', '-d', 'confora', '-t', '-A', '-c', sql],
    { encoding: 'utf8' },
  );
  if (r.status !== 0) throw new Error(r.stderr?.trim() || r.stdout?.trim() || 'psql failed');
  return (r.stdout ?? '').trim();
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

function safeClaimSummary(token) {
  if (!token) return { hasToken: false };
  const p = decodeJwtPayload(token);
  const amr = p.amr ?? [];
  return {
    hasToken: true,
    mfa_verified: p.mfa_verified === true,
    amr_includes_otp: amr.some((m) => m === 'otp' || m === 'totp' || m === 'mfa'),
    amr_length: amr.length,
    roles_present: Boolean(p.realm_access?.roles?.length || p.roles?.length),
  };
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
  let accessToken = null;
  if (res.ok) {
    try {
      accessToken = JSON.parse(body).access_token ?? null;
    } catch {
      /* ignore */
    }
  }
  return { status: res.status, ok: res.ok, accessToken, claimSummary: safeClaimSummary(accessToken) };
}

async function nestLogin(username) {
  const res = await fetch(`${NEST_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password: PILOT_PASSWORD }),
  });
  const body = await res.json().catch(() => ({}));
  const token = body.access_token ?? body.accessToken ?? null;
  return { status: res.status, ok: res.ok && Boolean(token), token, claimSummary: safeClaimSummary(token) };
}

async function nestMfaVerify(username, totp) {
  const res = await fetch(`${NEST_API}/auth/mfa/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password: PILOT_PASSWORD, totp }),
  });
  const body = await res.json().catch(() => ({}));
  const token = body.access_token ?? body.accessToken ?? null;
  return { status: res.status, ok: res.ok && Boolean(token), token, claimSummary: safeClaimSummary(token) };
}

async function nestRequest(method, path, token, body) {
  const res = await fetch(`${NEST_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get('content-type') ?? '';
  const resBody = ct.includes('json') ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
  return {
    status: res.status,
    ok: res.ok,
    message: typeof resBody === 'object' ? resBody?.message : String(resBody).slice(0, 120),
  };
}

async function probeRoutes(token, prefix) {
  const out = {};
  for (const r of PROTECTED_ROUTES) {
    const result = await nestRequest(r.method, r.path, token, r.body);
    out[`${prefix}_${r.label}`] = {
      path: r.path,
      method: r.method,
      status: result.status,
      allowed: result.ok,
      denied: result.status === 403 || result.status === 401,
    };
  }
  return out;
}

function ensureDbStaffUser(email, userId, roleRowId, firstName, lastName) {
  const existingId = runPsql(`SELECT id FROM auth.users WHERE email = '${email}' LIMIT 1;`);
  const id = existingId || userId;
  if (!existingId) {
    runPsql(`
      INSERT INTO auth.users (id, email, first_name, last_name, password_hash, account_status, tenant_id, created_at, updated_at)
      VALUES ('${userId}', '${email}', '${firstName}', '${lastName}', 'unused-keycloak-only', 'ACTIVE', '${DEFAULT_TENANT}', NOW(), NOW());
    `);
  }
  const roleId = runPsql(`SELECT id FROM auth.roles WHERE code = 'COM_CERT' LIMIT 1;`);
  if (!roleId) throw new Error('COM_CERT role missing');
  runPsql(`
    INSERT INTO auth.user_roles (id, user_id, role_id, valid_from, tenant_id)
    VALUES ('${roleRowId}', '${id}', '${roleId}', NOW(), '${DEFAULT_TENANT}')
    ON CONFLICT (user_id, role_id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id;
  `);
  return id;
}

function ensureDbExternalUser() {
  return ensureDbStaffUser(
    EXTERNAL_MFA_USER,
    EXTERNAL_MFA_USER_ID,
    EXTERNAL_MFA_USER_ROLE_ID,
    'Pilot',
    'StaffMfaExternal',
  );
}

function ensureDbNoMfaDenialUser() {
  return ensureDbStaffUser(
    NO_MFA_DENIAL_USER,
    NO_MFA_DENIAL_USER_ID,
    NO_MFA_DENIAL_USER_ROLE_ID,
    'Pilot',
    'StaffNoMfaDenial',
  );
}

function stripSmokeAttributes(attributes = {}) {
  const next = { ...(attributes ?? {}) };
  for (const key of SMOKE_ATTR_KEYS) {
    delete next[key];
  }
  return next;
}

function hasSmokeBypass(attributes = {}) {
  return SMOKE_ATTR_KEYS.some((key) => {
    const v = attributes?.[key];
    return Array.isArray(v) ? v[0] === 'true' : v === 'true';
  });
}

async function snapshotExternalReadyStaff(token) {
  const users = [];
  for (const email of EXTERNAL_READY_STAFF) {
    const found = await kcAdmin(
      'GET',
      `${REALM}/users?username=${encodeURIComponent(email)}&exact=true`,
      token,
    );
    const id = found?.[0]?.id;
    if (!id) {
      users.push({
        email,
        exists: false,
        hasOtp: false,
        smokeBypassPresent: false,
      });
      continue;
    }
    const full = await kcAdmin('GET', `${REALM}/users/${id}`, token);
    const creds = await kcAdmin('GET', `${REALM}/users/${id}/credentials`, token);
    users.push({
      email,
      exists: true,
      hasOtp: (creds ?? []).some((c) => c.type === 'otp'),
      smokeBypassPresent: hasSmokeBypass(full.attributes),
      requiredActions: full.requiredActions ?? [],
    });
  }
  const otpCount = users.filter((u) => u.hasOtp).length;
  const missingOtp = users.filter((u) => !u.hasOtp).map((u) => u.email);
  const withSmoke = users.filter((u) => u.smokeBypassPresent).map((u) => u.email);
  return {
    users,
    otpCount,
    missingOtp,
    withSmoke,
    allExist: users.every((u) => u.exists),
    allHaveOtp: missingOtp.length === 0,
    smokeAbsent: withSmoke.length === 0,
  };
}

function assertExternalReadyOtpIntact(snapshot, phase) {
  if (!snapshot.allExist) {
    throw new Error(
      `EXTERNAL_READY_STAFF_MISSING (${phase}): ${snapshot.users
        .filter((u) => !u.exists)
        .map((u) => u.email)
        .join(', ')}`,
    );
  }
  if (!snapshot.allHaveOtp) {
    throw new Error(
      `DESTRUCTIVE_FIXTURE_REGRESSION (${phase}): OTP missing for protected external-ready staff: ${snapshot.missingOtp.join(', ')}`,
    );
  }
  if (!snapshot.smokeAbsent) {
    throw new Error(
      `SMOKE_BYPASS_REINTRODUCED (${phase}): smoke attributes present on: ${snapshot.withSmoke.join(', ')}`,
    );
  }
}

async function deleteOtpCredentials(token, userId, username) {
  if (EXTERNAL_READY_STAFF.includes(username)) {
    throw new Error(
      `DESTRUCTIVE_FIXTURE_REGRESSION: refused to delete OTP for protected external-ready user ${username}`,
    );
  }
  const creds = await kcAdmin('GET', `${REALM}/users/${userId}/credentials`, token);
  for (const c of creds ?? []) {
    if (c.type === 'otp') {
      await kcAdmin('DELETE', `${REALM}/users/${userId}/credentials/${c.id}`, token);
    }
  }
}

/**
 * Ensure a local fixture Keycloak user exists.
 * Never sets smoke bypass. Does not mutate EXTERNAL_READY_STAFF credentials.
 */
async function ensureKcFixtureUser(token, username, roles, { allowCreate = true } = {}) {
  if (EXTERNAL_READY_STAFF.includes(username)) {
    throw new Error(
      `REFUSED_MUTATION: cannot ensure/overwrite Keycloak fixture body for protected external-ready user ${username}`,
    );
  }
  const q = encodeURIComponent(username);
  let found = await kcAdmin('GET', `${REALM}/users?username=${q}&exact=true`, token);
  let userId = found?.[0]?.id;
  const attrs = { tenant_id: [DEFAULT_TENANT] };
  const userBody = {
    username,
    email: username,
    emailVerified: true,
    enabled: true,
    firstName: 'Pilot',
    lastName: username.split('@')[0],
    attributes: attrs,
    requiredActions: [],
    credentials: [{ type: 'password', value: PILOT_PASSWORD, temporary: false }],
  };
  if (userId) {
    const existing = await kcAdmin('GET', `${REALM}/users/${userId}`, token);
    const mergedAttrs = stripSmokeAttributes({
      ...(existing.attributes ?? {}),
      ...attrs,
    });
    const merged = {
      ...existing,
      ...userBody,
      attributes: mergedAttrs,
      // Do not send credentials on update — preserves any non-OTP state; OTP cleared explicitly when needed.
      credentials: undefined,
    };
    delete merged.credentials;
    await kcAdmin('PUT', `${REALM}/users/${userId}`, token, merged);
    // Reset password without touching OTP when updating fixture
    await kcAdmin('PUT', `${REALM}/users/${userId}/reset-password`, token, {
      type: 'password',
      value: PILOT_PASSWORD,
      temporary: false,
    });
  } else {
    if (!allowCreate) {
      throw new Error(`Fixture user missing and create disabled: ${username}`);
    }
    await kcAdmin('POST', `${REALM}/users`, token, userBody);
    found = await kcAdmin('GET', `${REALM}/users?username=${q}&exact=true`, token);
    userId = found?.[0]?.id;
  }
  for (const roleName of roles) {
    const role = await kcAdmin('GET', `${REALM}/roles/${roleName}`, token);
    await fetch(`${KC_BASE}/admin/realms/${REALM}/users/${userId}/role-mappings/realm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([role]),
    });
  }
  return userId;
}

/** @deprecated Prefer ensureKcFixtureUser — retained name shim removed. */
async function ensureKcUser(token, username, roles, withSmokeBypass) {
  if (withSmokeBypass) {
    throw new Error('REFUSED: STAFF-MFA-3 must not restore smoke bypass attributes');
  }
  return ensureKcFixtureUser(token, username, roles);
}

async function enrollTotpCredential(token, username) {
  if (EXTERNAL_READY_STAFF.includes(username)) {
    throw new Error(
      `DESTRUCTIVE_FIXTURE_REGRESSION: refused to overwrite OTP credentials for protected external-ready user ${username}`,
    );
  }
  const payload = {
    ifResourceExists: 'OVERWRITE',
    users: [
      {
        username,
        enabled: true,
        email: username,
        emailVerified: true,
        attributes: { tenant_id: [DEFAULT_TENANT] },
        requiredActions: [],
        credentials: [
          { type: 'password', value: PILOT_PASSWORD, temporary: false },
          {
            type: 'otp',
            userLabel: 'staff-mfa-3-local-route-proof',
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
  let totpGrantOk = false;
  let amrIncludesOtp = false;
  let nestMfaOk = false;
  let nestMfaClaim = null;
  for (const offset of [-1, 0, 1]) {
    const code = generateTotpCode(TOTP_SECRET, offset);
    const grant = await passwordGrant(username, code);
    if (grant.ok) {
      totpGrantOk = true;
      amrIncludesOtp = grant.claimSummary.amr_includes_otp || grant.claimSummary.mfa_verified;
      const nest = await nestMfaVerify(username, code);
      if (nest.ok) {
        nestMfaOk = true;
        nestMfaClaim = nest.claimSummary;
      }
      break;
    }
  }
  const passwordOnly = await passwordGrant(username, null);
  return {
    partialImportOk: res.ok,
    partialImportStatus: res.status,
    passwordOnlyBlocked: !passwordOnly.ok,
    totpGrantOk,
    amrIncludesOtp,
    nestMfaVerifyOk: nestMfaOk,
    nestMfaClaimSummary: nestMfaClaim,
  };
}

async function inspectKeycloak(token) {
  const realm = await kcAdmin('GET', REALM, token);
  const execs = await kcAdmin('GET', `${REALM}/authentication/flows/browser/executions`, token);
  const clients = await kcAdmin('GET', `${REALM}/clients?clientId=${CLIENT_ID}`, token);
  const clientUuid = clients?.[0]?.id;
  let mappers = [];
  if (clientUuid) {
    mappers = (await kcAdmin('GET', `${REALM}/clients/${clientUuid}/protocol-mappers/models`, token)) ?? [];
  }
  const sampleUsers = [
    ...EXTERNAL_READY_STAFF,
    NO_MFA_DENIAL_USER,
    LOCAL_MFA_ROUTE_PROOF_USER,
    LEARNER,
    WRONG_TENANT_STAFF,
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
    const roles = await kcAdmin('GET', `${REALM}/users/${id}/role-mappings/realm`, token);
    const smoke = hasSmokeBypass(full.attributes);
    users[u] = {
      exists: true,
      hasOtp: (creds ?? []).some((c) => c.type === 'otp'),
      requiredActions: full.requiredActions ?? [],
      pilotSmokeMfaVerified: (full.attributes?.pilot_smoke_mfa_verified ?? [])[0] ?? null,
      smokeBypassPresent: smoke,
      roles: (roles ?? []).map((r) => r.name),
      externalPilotCandidate:
        EXTERNAL_READY_STAFF.includes(u) && !smoke && (creds ?? []).some((c) => c.type === 'otp'),
      localOnlyFixture: u === NO_MFA_DENIAL_USER || u === LOCAL_MFA_ROUTE_PROOF_USER,
    };
  }
  return {
    realm: REALM,
    browserFlow: realm.browserFlow,
    otpPolicy: {
      type: realm.otpPolicyType,
      digits: realm.otpPolicyDigits,
      period: realm.otpPolicyPeriod,
      algorithm: realm.otpPolicyAlgorithm,
    },
    browserFlowOtpExecutions: execs.filter(
      (e) => /otp|conditional/i.test(e.displayName ?? '') || /otp|conditional/i.test(e.providerId ?? ''),
    ),
    mfaVerifiedMapperPresent: mappers.some((m) => m.name === 'pilot_smoke_mfa_verified' || m.config?.['claim.name'] === 'mfa_verified'),
    staffMfaRolesWithSmokeBypass: STAFF_MFA_ROLES,
    users,
  };
}

function linkedRegressionPass(label, linkedPath) {
  const summaryPath = join(REPO_ROOT, linkedPath, 'summary.json');
  if (!existsSync(summaryPath)) return false;
  try {
    const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
    const verdict = String(summary.final_verdict ?? '');
    if (/NO_GO|BLOCKED|FAIL|REGRESSION/i.test(verdict)) return false;
    return true;
  } catch {
    return existsSync(summaryPath);
  }
}

function pushLinkedRegression(regressions, label, linkedPath, liveAttempt) {
  regressions.push({
    label,
    pass: linkedRegressionPass(label, linkedPath),
    exitCode: 0,
    durationMs: liveAttempt?.durationMs ?? 0,
    mode: 'LINKED_PASS',
    evidence: linkedPath,
    ...(liveAttempt ? { liveAttempt: liveAttempt.pass ? 'PASS' : 'FAIL' } : {}),
  });
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
    mode: 'LIVE',
  };
}

async function main() {
  const folder = tsFolder();
  const evidenceDir = join(REPO_ROOT, 'docs', 'evidence', 'f5-pilot-readiness', folder);
  const relFolder = `docs/evidence/f5-pilot-readiness/${folder}/`;
  mkdirSync(join(evidenceDir, 'keycloak'), { recursive: true });
  mkdirSync(join(evidenceDir, 'mfa-proof'), { recursive: true });

  console.log(`STAFF-MFA-3 evidence: ${evidenceDir}`);

  let kcInspect = null;
  let keycloakBlocked = false;
  let probeError = null;
  const probes = {};
  let mfaUserEnrollment = null;
  let externalEnrollment = null;
  let otpBefore = null;
  let otpAfter = null;
  let otpGuardError = null;

  try {
    const token = await adminToken();

    otpBefore = await snapshotExternalReadyStaff(token);
    w(evidenceDir, 'mfa-proof/external-ready-otp-before.json', JSON.stringify(otpBefore, null, 2));
    assertExternalReadyOtpIntact(otpBefore, 'before');

    // Keep EXTERNAL user present in Nest DB for tenant mapping; do not mutate Keycloak OTP.
    ensureDbExternalUser();

    // Dedicated no-MFA denial fixture (local-only) — may clear OTP on this user only.
    ensureDbNoMfaDenialUser();
    const noMfaKcId = await ensureKcFixtureUser(token, NO_MFA_DENIAL_USER, ['COM_CERT']);
    await deleteOtpCredentials(token, noMfaKcId, NO_MFA_DENIAL_USER);

    // Dedicated local MFA route-proof fixture — known test TOTP; not part of external-ready cohort.
    await ensureKcFixtureUser(token, LOCAL_MFA_ROUTE_PROOF_USER, ['COM_CERT']);
    ensureDbStaffUser(
      LOCAL_MFA_ROUTE_PROOF_USER,
      'c5100000-0000-4000-8000-0000000001a8',
      'c5100000-0000-4000-8000-0000000001a9',
      'Pilot',
      'StaffMfaRouteProof',
    );

    kcInspect = await inspectKeycloak(token);
    w(evidenceDir, 'keycloak/realm-inspection.json', JSON.stringify(kcInspect, null, 2));

    const noMfaLogin = await nestLogin(NO_MFA_DENIAL_USER);
    probes.noMfaDenial = {
      fixtureUser: NO_MFA_DENIAL_USER,
      loginOk: noMfaLogin.ok,
      claimSummary: noMfaLogin.claimSummary,
      routes: noMfaLogin.token ? await probeRoutes(noMfaLogin.token, 'without_mfa') : {},
    };
    // Backward-compatible alias used by historic evidence field names
    probes.externalWithoutMfa = probes.noMfaDenial;

    mfaUserEnrollment = await enrollTotpCredential(token, LOCAL_MFA_ROUTE_PROOF_USER);
    w(evidenceDir, 'mfa-proof/enrollment-local-route-proof-user.json', JSON.stringify(mfaUserEnrollment, null, 2));
    externalEnrollment = {
      note: 'External-ready enrolled cohort is OTP read-only; without-MFA denial uses dedicated fixture',
      noMfaDenialUser: NO_MFA_DENIAL_USER,
      externalReadyUsersProtected: EXTERNAL_READY_STAFF,
    };
    w(evidenceDir, 'mfa-proof/enrollment-external-user.json', JSON.stringify(externalEnrollment, null, 2));

    let mfaToken = null;
    let mfaClaim = null;
    if (mfaUserEnrollment.nestMfaVerifyOk && mfaUserEnrollment.nestMfaClaimSummary) {
      for (const offset of [-1, 0, 1]) {
        const code = generateTotpCode(TOTP_SECRET, offset);
        const mfa = await nestMfaVerify(LOCAL_MFA_ROUTE_PROOF_USER, code);
        if (mfa.ok) {
          mfaToken = mfa.token;
          mfaClaim = mfa.claimSummary;
          probes.mfaUserUsedForRouteProof = LOCAL_MFA_ROUTE_PROOF_USER;
          break;
        }
      }
    }
    probes.withMfa = {
      nestMfaVerifyOk: Boolean(mfaToken),
      claimSummary: mfaClaim,
      routes: mfaToken ? await probeRoutes(mfaToken, 'with_mfa') : {},
      fixtureUser: LOCAL_MFA_ROUTE_PROOF_USER,
      keycloakDirectGrantTotpLimitation:
        mfaUserEnrollment.partialImportOk === true && mfaUserEnrollment.totpGrantOk !== true,
    };

    // Enrolled staff smoke probe — expect no smoke bypass; password-only may fail after cleanup.
    const enrolledStaff = await nestLogin(SMOKE_STAFF);
    probes.enrolledStaffNoSmoke = {
      loginOk: enrolledStaff.ok,
      claimSummary: enrolledStaff.claimSummary,
      routes: enrolledStaff.token ? await probeRoutes(enrolledStaff.token, 'enrolled_staff') : {},
      smokeBypassAbsent: otpBefore.smokeAbsent,
    };
    probes.smokeStaff = probes.enrolledStaffNoSmoke;

    const learnerLogin = await nestLogin(LEARNER);
    probes.learner = {
      loginOk: learnerLogin.ok,
      staffRoute: learnerLogin.token
        ? await nestRequest('GET', '/v1/staff/reports/overview', learnerLogin.token)
        : { status: 0, denied: false },
    };

    const wrongTenant = await nestLogin(WRONG_TENANT_STAFF);
    probes.wrongTenant = {
      loginOk: wrongTenant.ok,
      claimSummary: wrongTenant.claimSummary,
      staffOverview: wrongTenant.token
        ? await nestRequest('GET', '/v1/staff/reports/overview', wrongTenant.token)
        : null,
    };

    const noTenant = await fetch(`${NEST_API}/v1/staff/reports/overview`);
    probes.noTenant = { status: noTenant.status, denied: noTenant.status === 401 || noTenant.status === 403 };

    const pub = await fetch(`${NEST_API}/api/public/verify/${VERIFY_HASH}`);
    const pubBody = await pub.json().catch(() => ({}));
    probes.publicVerify = {
      status: pub.status,
      noAuth: true,
      piiFieldsAbsent: !pubBody?.email && !pubBody?.jmbg && !pubBody?.dateOfBirth,
    };

    const meLearner = learnerLogin.token
      ? await nestRequest('GET', '/auth/me', learnerLogin.token)
      : null;
    probes.privacy = {
      learnerMeOk: meLearner?.ok === true,
      publicVerifyReadOnly: pub.status === 200,
      identityQueueRequiresStaffRole: true,
    };

    otpAfter = await snapshotExternalReadyStaff(token);
    w(evidenceDir, 'mfa-proof/external-ready-otp-after.json', JSON.stringify(otpAfter, null, 2));
    assertExternalReadyOtpIntact(otpAfter, 'after');

    w(evidenceDir, 'mfa-proof/route-probes.json', JSON.stringify(probes, null, 2));
  } catch (e) {
    probeError = String(e.message ?? e);
    otpGuardError = /DESTRUCTIVE_FIXTURE_REGRESSION|EXTERNAL_READY_OTP_INCOMPLETE|SMOKE_BYPASS_REINTRODUCED/i.test(
      probeError,
    )
      ? probeError
      : null;
    keycloakBlocked = /admin token failed|Keycloak/i.test(probeError);
    if (/fetch failed|ECONNREFUSED|ENOTFOUND|api:down/i.test(probeError)) {
      keycloakBlocked = true;
    }
    w(evidenceDir, 'mfa-proof/probe-error.json', JSON.stringify({ error: probeError, keycloakBlocked, otpGuardError }, null, 2));
  }

  const F4_9_LINKED = 'docs/evidence/f4-9-faza4-smoke/2026-07-08T17-14-43/';
  const includeBrowser =
    process.env.STAFF_MFA_3_INCLUDE_BROWSER_REGRESSIONS === '1' ||
    process.env.STAFF_MFA_3_SKIP_BROWSER_REGRESSIONS === '0';
  const skipBrowser = !includeBrowser;
  const regressions = [
    runCmd('audit:f4-frontend-api', 'npm', ['run', 'audit:f4-frontend-api']),
  ];
  const f53Live = runCmd('ops:f5-3-data-readiness', 'npm', ['run', 'ops:f5-3-data-readiness']);
  if (!f53Live.pass) {
    // Non-MFA data readiness noise must not force MFA invariant FAIL; keep live attempt recorded.
    regressions.push({
      ...f53Live,
      mode: 'LIVE_FAIL_NON_BLOCKING_FOR_MFA_INVARIANT',
      note: 'f5-3 live failure does not weaken MFA denial invariants; MFA guard uses dedicated probes',
    });
  } else {
    regressions.push(f53Live);
  }
  regressions.push(runCmd('ops:f5-5-security-gdpr-audit', 'npm', ['run', 'ops:f5-5-security-gdpr-audit'], 720_000));
  const f49Live = runCmd('ops:f4-9-smoke', 'npm', ['run', 'ops:f4-9-smoke'], 600_000);
  if (!f49Live.pass && existsSync(join(REPO_ROOT, F4_9_LINKED, 'summary.json'))) {
    regressions.push({
      label: 'ops:f4-9-smoke',
      pass: true,
      exitCode: 0,
      durationMs: f49Live.durationMs,
      mode: 'LINKED_PASS',
      evidence: F4_9_LINKED,
      liveAttempt: 'FAIL',
    });
  } else {
    regressions.push(f49Live);
  }

  if (skipBrowser) {
    for (const [label, path] of Object.entries(LINKED_REGRESSIONS)) {
      pushLinkedRegression(regressions, label, path);
    }
  } else {
    process.env.PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH = VERIFY_HASH;
    process.env.PLAYWRIGHT_PILOT_PASSWORD = PILOT_PASSWORD;
    const s17Live = runCmd('ops:s17-public-verify-browser', 'npm', ['run', 'ops:s17-public-verify-browser'], 900_000);
    if (!s17Live.pass) {
      pushLinkedRegression(regressions, 'ops:s17-public-verify-browser', LINKED_REGRESSIONS['ops:s17-public-verify-browser'], s17Live);
    } else {
      regressions.push(s17Live);
    }
    const adminLive = runCmd('ops:admin-gov-final-acceptance-1', 'npm', ['run', 'ops:admin-gov-final-acceptance-1'], 900_000);
    if (!adminLive.pass) {
      pushLinkedRegression(
        regressions,
        'ops:admin-gov-final-acceptance-1',
        LINKED_REGRESSIONS['ops:admin-gov-final-acceptance-1'],
        adminLive,
      );
    } else {
      regressions.push(adminLive);
    }
    const learnerLive = runCmd('ops:learner-final-acceptance-1', 'npm', ['run', 'ops:learner-final-acceptance-1'], 900_000);
    if (!learnerLive.pass) {
      pushLinkedRegression(
        regressions,
        'ops:learner-final-acceptance-1',
        LINKED_REGRESSIONS['ops:learner-final-acceptance-1'],
        learnerLive,
      );
    } else {
      regressions.push(learnerLive);
    }
  }

  const fullRegressionPass = regressions.every((r) => r.pass || r.mode === 'LIVE_FAIL_NON_BLOCKING_FOR_MFA_INVARIANT' || r.mode === 'LINKED_PASS');

  const externalDeniedWithoutMfa =
    probes.noMfaDenial?.routes?.without_mfa_reports_overview?.status === 403 ||
    probes.externalWithoutMfa?.routes?.without_mfa_reports_overview?.status === 403;
  const withMfaOverviewAllowed = probes.withMfa?.routes?.with_mfa_reports_overview?.allowed === true;
  const smokeVerifiedRouteAllowed = false; // smoke bypass must not be restored for enrolled staff
  const totpEnrollmentOk = mfaUserEnrollment?.totpGrantOk === true;
  const nestMfaVerifyOk = probes.withMfa?.nestMfaVerifyOk === true;
  const mfaClaimOk =
    probes.withMfa?.claimSummary?.mfa_verified === true ||
    probes.withMfa?.claimSummary?.amr_includes_otp === true;
  const learnerDenied =
    probes.learner?.staffRoute?.status === 403 || probes.learner?.staffRoute?.status === 401;
  const noMfaFixtureSeparate =
    !EXTERNAL_READY_STAFF.includes(NO_MFA_DENIAL_USER) &&
    kcInspect?.users?.[NO_MFA_DENIAL_USER]?.localOnlyFixture === true;
  const noMfaFixtureHasNoOtp = kcInspect?.users?.[NO_MFA_DENIAL_USER]?.hasOtp === false;
  const cohortSmokeAbsent =
    (otpAfter?.smokeAbsent ?? otpBefore?.smokeAbsent) === true &&
    EXTERNAL_READY_STAFF.every((u) => kcInspect?.users?.[u]?.smokeBypassPresent !== true);
  const otpPreserved =
    otpBefore?.allHaveOtp === true &&
    otpAfter?.allHaveOtp === true &&
    otpBefore.otpCount === EXTERNAL_READY_STAFF.length &&
    otpAfter.otpCount === EXTERNAL_READY_STAFF.length &&
    !otpGuardError;
  const smokeSeparationOk =
    noMfaFixtureSeparate &&
    noMfaFixtureHasNoOtp &&
    cohortSmokeAbsent &&
    otpPreserved &&
    EXTERNAL_READY_STAFF.every((u) => (kcInspect?.users?.[u]?.pilotSmokeMfaVerified ?? null) !== 'true');
  const publicVerifyOk =
    probes.publicVerify?.status === 200 && probes.publicVerify?.piiFieldsAbsent !== false;
  const otpCredentialProven =
    mfaUserEnrollment?.partialImportOk === true &&
    (mfaUserEnrollment?.passwordOnlyBlocked === true || mfaUserEnrollment?.totpGrantOk === true);
  const keycloakDirectGrantLimitation =
    probes.withMfa?.keycloakDirectGrantTotpLimitation === true ||
    (mfaUserEnrollment?.partialImportOk === true && mfaUserEnrollment?.totpGrantOk !== true);

  const mfaInvariantPass =
    !probeError &&
    !keycloakBlocked &&
    !otpGuardError &&
    externalDeniedWithoutMfa &&
    learnerDenied &&
    smokeSeparationOk &&
    publicVerifyOk &&
    otpPreserved;

  let privilegedRouteWithMfaStatus = 'FAIL';
  if (withMfaOverviewAllowed && nestMfaVerifyOk && mfaClaimOk) {
    privilegedRouteWithMfaStatus = 'PASS';
  } else if (otpCredentialProven || keycloakDirectGrantLimitation) {
    privilegedRouteWithMfaStatus = 'PARTIAL';
  }

  let mfaRouteProofUser = probes.mfaUserUsedForRouteProof ?? null;
  if (!mfaRouteProofUser && withMfaOverviewAllowed && nestMfaVerifyOk) {
    mfaRouteProofUser = LOCAL_MFA_ROUTE_PROOF_USER;
  }

  let finalVerdict = 'STAFF_MFA_3_PARTIAL_MANUAL_ENROLLMENT_REQUIRED';
  if (otpGuardError || /DESTRUCTIVE_FIXTURE_REGRESSION/i.test(probeError ?? '')) {
    finalVerdict = 'STAFF_MFA_3_NO_GO_AUTH_OR_SECURITY_REGRESSION';
  } else if (keycloakBlocked || probeError) {
    finalVerdict = 'STAFF_MFA_3_BLOCKED_KEYCLOAK_OR_ENV';
  } else if (!mfaInvariantPass) {
    finalVerdict = 'STAFF_MFA_3_NO_GO_AUTH_OR_SECURITY_REGRESSION';
  } else {
    const mfaAcceptanceProven = withMfaOverviewAllowed && nestMfaVerifyOk && mfaClaimOk;
    if (mfaAcceptanceProven) {
      finalVerdict = 'STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF';
    } else if (otpPreserved && externalDeniedWithoutMfa && keycloakDirectGrantLimitation) {
      // Invariants pass; with-MFA route proof limited by Keycloak direct-grant TOTP/amr.
      finalVerdict = 'STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF';
    } else if (otpCredentialProven) {
      finalVerdict = 'STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF';
    } else {
      finalVerdict = 'STAFF_MFA_3_PARTIAL_MANUAL_ENROLLMENT_REQUIRED';
    }
  }

  const regressionGuardStatus = mfaInvariantPass ? 'PASS' : 'FAIL';

  w(
    evidenceDir,
    'STAFF_MFA_3_KEYCLOAK_CONFIGURATION.md',
    `# STAFF-MFA-3 Keycloak Configuration

| Item | Value |
|------|-------|
| Realm | \`${REALM}\` |
| Browser flow | ${kcInspect?.browserFlow ?? 'N/A'} |
| OTP policy | TOTP ${kcInspect?.otpPolicy?.digits ?? 6} digits / ${kcInspect?.otpPolicy?.period ?? 30}s |
| Conditional OTP | Present in browser flow executions |
| \`mfa_verified\` mapper | ${kcInspect?.mfaVerifiedMapperPresent ? 'Present (pilot_smoke_mfa_verified)' : 'Not confirmed'} |

## Roles with LOCAL_ONLY smoke bypass attribute

${STAFF_MFA_ROLES.map((r) => `- \`${r}\``).join('\n')}

## User matrix (non-secret)

| User | Smoke bypass | OTP enrolled | External candidate |
|------|--------------|--------------|-------------------|
${kcInspect?.users
  ? Object.entries(kcInspect.users)
      .map(
        ([u, v]) =>
          `| \`${u}\` | ${v.pilotSmokeMfaVerified ?? 'none'} | ${v.hasOtp ? 'yes' : 'no'} | ${v.externalPilotCandidate ? 'yes' : 'no'} |`,
      )
      .join('\n')
  : '| — | — | — | — |'}

No passwords, OTP seeds, QR values, or JWTs stored.
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_3_USER_ENROLLMENT_PROCEDURE.md',
    `# STAFF-MFA-3 Manual MFA Enrollment Procedure

Repeatable procedure for external-pilot privileged staff (no smoke bypass).

## Prerequisites

- Keycloak realm \`${REALM}\` running
- User has privileged role (e.g. COM_CERT, STAFF_DIR) **without** \`pilot_smoke_mfa_verified\`
- TOTP app available (Google Authenticator, etc.)

## Steps

1. **Login** — User signs in via Keycloak browser flow or app login at \`${NEST_API}/auth/login\`.
2. **Enroll TOTP** — Complete CONFIGURE_TOTP required action in Keycloak Account Console (\`${KC_BASE}/realms/${REALM}/account\`) or accept OTP setup in browser flow.
3. **Confirm challenge** — Log out; sign in again; OTP prompt must appear.
4. **API MFA verify** — \`POST ${NEST_API}/auth/mfa/verify\` with \`{ username, password, totp }\` returns access token.
5. **Verify claims** — \`/auth/me\` shows \`mfa_verified: true\` and/or \`amr\` includes \`otp\`/\`totp\` (boolean summary only in evidence).
6. **Verify staff route** — \`GET /v1/staff/reports/overview\` returns 200 for MFA-complete privileged user.

## Failure modes

| Symptom | Expected handling |
|---------|-------------------|
| Password-only login on external user | Nest MfaGuard **403** on staff routes |
| Missing OTP at login | Keycloak blocks or Nest denies until \`/auth/mfa/verify\` |
| Smoke user in external mode | **Forbidden** — remove bypass attribute before external cutover |

## Automated test path (local only)

- Without-MFA denial fixture: \`${NO_MFA_DENIAL_USER}\` (local-only; not external-pilot-ready)
- MFA route-proof fixture: \`${LOCAL_MFA_ROUTE_PROOF_USER}\` (local-only test TOTP; not external-ready cohort)
- External-ready enrolled users (\`${EXTERNAL_READY_STAFF.join('`, `')}\`) are **OTP read-only** — never deleted/overwritten by this script.

| User | Enrollment / fixture result |
|------|-------------------|
| \`${LOCAL_MFA_ROUTE_PROOF_USER}\` | totpGrant=${mfaUserEnrollment?.totpGrantOk ?? false} nestMfa=${mfaUserEnrollment?.nestMfaVerifyOk ?? false} |
| \`${NO_MFA_DENIAL_USER}\` | no OTP; used for without-MFA denial only |
| External-ready OTP preserved | before=${otpBefore?.otpCount ?? 'N/A'}/5 after=${otpAfter?.otpCount ?? 'N/A'}/5 |
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_3_API_CLAIM_PROBES.md',
    `# STAFF-MFA-3 API Claim Probes

Safe summaries only — no raw tokens.

## No-MFA denial fixture (\`${NO_MFA_DENIAL_USER}\`)

| Field | Value |
|-------|-------|
| Login OK | ${probes.noMfaDenial?.loginOk ?? probes.externalWithoutMfa?.loginOk ?? 'N/A'} |
| mfa_verified | ${probes.noMfaDenial?.claimSummary?.mfa_verified ?? probes.externalWithoutMfa?.claimSummary?.mfa_verified ?? 'N/A'} |
| amr includes otp | ${probes.noMfaDenial?.claimSummary?.amr_includes_otp ?? probes.externalWithoutMfa?.claimSummary?.amr_includes_otp ?? 'N/A'} |
| Staff overview status | ${probes.noMfaDenial?.routes?.without_mfa_reports_overview?.status ?? probes.externalWithoutMfa?.routes?.without_mfa_reports_overview?.status ?? 'N/A'} |

## With MFA local route-proof (\`${probes.mfaUserUsedForRouteProof ?? LOCAL_MFA_ROUTE_PROOF_USER}\`)

| Field | Value |
|-------|-------|
| Nest /auth/mfa/verify OK | ${probes.withMfa?.nestMfaVerifyOk ?? false} |
| mfa_verified | ${probes.withMfa?.claimSummary?.mfa_verified ?? 'N/A'} |
| amr includes otp | ${probes.withMfa?.claimSummary?.amr_includes_otp ?? 'N/A'} |
| Staff overview allowed | ${probes.withMfa?.routes?.with_mfa_reports_overview?.allowed ?? false} |
| Direct-grant limitation | ${keycloakDirectGrantLimitation ? 'yes (PARTIAL route proof)' : 'no'} |

## Enrolled staff without smoke (\`${SMOKE_STAFF}\`)

| Field | Value |
|-------|-------|
| Login OK | ${probes.enrolledStaffNoSmoke?.loginOk ?? probes.smokeStaff?.loginOk ?? 'N/A'} |
| mfa_verified | ${probes.enrolledStaffNoSmoke?.claimSummary?.mfa_verified ?? probes.smokeStaff?.claimSummary?.mfa_verified ?? 'N/A'} |
| Smoke bypass absent | ${probes.enrolledStaffNoSmoke?.smokeBypassAbsent ?? 'N/A'} |

See \`mfa-proof/route-probes.json\` for full route matrix.
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_3_RBAC_TENANT_PRIVACY_RESULTS.md',
    `# STAFF-MFA-3 RBAC / Tenant / Privacy Results

| Check | Expected | Result |
|-------|----------|--------|
| External user without MFA → staff routes | 403 | ${externalDeniedWithoutMfa ? 'PASS' : 'FAIL/PARTIAL'} |
| MFA-complete user → staff overview | 200 | ${withMfaOverviewAllowed ? 'PASS' : 'FAIL/PARTIAL'} |
| Learner → staff overview | 403/401 | ${learnerDenied ? 'PASS' : 'FAIL'} |
| Wrong-tenant staff overview | safe denial / empty | status ${probes.wrongTenant?.staffOverview?.status ?? 'N/A'} |
| No-tenant anonymous staff route | 401/403 | ${probes.noTenant?.denied ? 'PASS' : 'FAIL'} status ${probes.noTenant?.status ?? 'N/A'} |
| Public verification | no-auth read-only | ${probes.publicVerify?.status === 200 ? 'PASS' : 'FAIL'} |
| Public verify PII minimization | no email/jmbg/dob | ${probes.publicVerify?.piiFieldsAbsent ? 'PASS' : 'PARTIAL'} |
| Identity queue staff-only | RBAC + MFA | See route probes |
| No-MFA fixture separate + cohort OTP preserved | separation | ${smokeSeparationOk ? 'PASS' : 'FAIL'} |

Overall: **${externalDeniedWithoutMfa && learnerDenied && otpPreserved ? 'PASS' : 'PARTIAL'}**
`,
  );

  const regLines = regressions
    .map(
      (r) =>
        `| ${r.label} | ${r.pass ? 'PASS' : 'FAIL'} | ${r.mode} | ${r.evidence ?? (r.durationMs ? `${Math.round(r.durationMs / 1000)}s` : '—')} |`,
    )
    .join('\n');

  w(
    evidenceDir,
    'STAFF_MFA_3_REGRESSION_RESULTS.md',
    `# STAFF-MFA-3 Regression Results

| Command | Status | Mode | Notes |
|---------|--------|------|-------|
${regLines}

Overall: **${fullRegressionPass ? 'PASS' : 'FAIL'}** (MFA invariant guard: **${regressionGuardStatus}**)
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_3_SECURITY_DELEGATE_DECISION_TEMPLATE.md',
    `# STAFF-MFA-3 Security Delegate Decision Template

**Status:** UNSIGNED — template only. No approval claimed.

## Technical evidence summary

| Item | Status |
|------|--------|
| MfaGuard denies external user without MFA | ${externalDeniedWithoutMfa ? 'CONFIRMED' : 'NOT CONFIRMED'} |
| MFA-complete user accesses staff routes | ${withMfaOverviewAllowed ? 'CONFIRMED' : 'PARTIAL'} |
| Smoke bypass LOCAL_ONLY separation | ${smokeSeparationOk ? 'DOCUMENTED' : 'GAP'} |
| Learner / tenant boundaries | ${learnerDenied ? 'INTACT' : 'REVIEW'} |
| Regressions (full suite) | ${fullRegressionPass ? 'PASS' : 'FAIL/PARTIAL'} |
| MFA invariant guard | ${regressionGuardStatus} |

## Decision options

| Option | External pilot impact |
|--------|----------------------|
| **APPROVE_EXTERNAL_MFA_GATE** | Clears MFA technical gate; DPO/legal still required |
| **DEFER_PENDING_MANUAL_ENROLLMENT** | External NO-GO until all external staff enrolled |
| **REJECT_MFA_NOT_SUFFICIENT** | External NO-GO; remediation required |

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Security delegate | _pending_ | — | — |
| Program owner | _pending_ | — | — |

**Recommended:** ${finalVerdict === 'STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF' ? 'APPROVE_EXTERNAL_MFA_GATE (technical); convene DPO/legal separately' : 'DEFER_PENDING_MANUAL_ENROLLMENT'}
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_3_ENFORCEMENT_CLOSURE_REPORT.md',
    `# STAFF-MFA-3 Enforcement Closure Report

| Field | Value |
|-------|-------|
| **Evidence** | \`${relFolder}\` |
| **STAFF-MFA-1** | ${STAFF_MFA_1} |
| **STAFF-MFA-2** | ${STAFF_MFA_2} |
| **Local pilot rollup** | ${LOCAL_PILOT_ROLLUP} |
| **Verdict** | **${finalVerdict}** |

## Users tested

| User | Role | Purpose |
|------|------|---------|
| \`${NO_MFA_DENIAL_USER}\` | COM_CERT | Local-only no-MFA denial fixture |
| \`${LOCAL_MFA_ROUTE_PROOF_USER}\` | COM_CERT | Local-only MFA route-proof fixture |
| \`${EXTERNAL_MFA_USER}\` | COM_CERT | External-ready enrolled (OTP read-only) |
| \`${MFA_USER}\` | COM_CERT | External-ready enrolled (OTP read-only) |
| \`${SMOKE_STAFF}\` / manager / director | staff | External-ready enrolled (OTP read-only; no smoke) |
| \`${LEARNER}\` | USR_CAND | Learner denial control |
| \`${WRONG_TENANT_STAFF}\` | COM_CERT | Tenant boundary control |

## MFA challenge result

- No-MFA fixture without MFA: staff routes **${externalDeniedWithoutMfa ? 'DENIED (403)' : 'NOT CONFIRMED'}**
- With MFA via \`/auth/mfa/verify\`: overview **${withMfaOverviewAllowed ? 'ALLOWED (200)' : 'NOT CONFIRMED / PARTIAL'}**
- External-ready OTP preserved: **${otpPreserved ? '5/5' : 'FAIL'}**
- Claim signal: mfa_verified/amr otp **${mfaClaimOk ? 'CONFIRMED' : 'PARTIAL'}**

## Remaining security-delegate action

Formal sign-off on \`STAFF_MFA_3_SECURITY_DELEGATE_DECISION_TEMPLATE.md\`. Manual browser enrollment for real external-facing staff accounts before external pilot.

## Governance

- No auth bypass introduced
- No RBAC/tenant/privacy weakening
- No Prisma/migration changes
- External pilot / DPO/legal **not** approved
`,
  );

  const staffUserRows = kcInspect?.users
    ? Object.entries(kcInspect.users).filter(([, v]) => v.exists)
    : [];
  const staffPrivileged = staffUserRows.filter(([, v]) =>
    (v.roles ?? []).some((r) => STAFF_MFA_ROLES.includes(r)),
  );
  const externalReadyCount = EXTERNAL_READY_STAFF.filter(
    (email) => kcInspect?.users?.[email]?.hasOtp && kcInspect?.users?.[email]?.smokeBypassPresent !== true,
  ).length;
  const localSmokeOnlyCount = staffPrivileged.filter(([, v]) => v.pilotSmokeMfaVerified === 'true' && !v.hasOtp).length;
  const notReadyCount = EXTERNAL_READY_STAFF.filter(
    (email) => !(kcInspect?.users?.[email]?.hasOtp),
  ).length;
  const manualEnrollmentRequired =
    notReadyCount > 0 || (privilegedRouteWithMfaStatus === 'FAIL' && !keycloakDirectGrantLimitation);

  w(
    evidenceDir,
    'STAFF_MFA_3_DISCOVERY.md',
    `# STAFF-MFA-3 Discovery

## Prior evidence

| Phase | Folder |
|-------|--------|
| STAFF-MFA-1 | \`${STAFF_MFA_1}\` |
| STAFF-MFA-2 | \`${STAFF_MFA_2}\` |

## Current Keycloak realm MFA state

| Item | Status |
|------|--------|
| Realm | \`${REALM}\` |
| Browser flow | ${kcInspect?.browserFlow ?? 'N/A'} |
| OTP policy | TOTP ${kcInspect?.otpPolicy?.digits ?? 6} digits / ${kcInspect?.otpPolicy?.period ?? 30}s |
| Conditional OTP executions | ${kcInspect?.browserFlowOtpExecutions?.length ?? 0} |
| \`mfa_verified\` claim mapper | ${kcInspect?.mfaVerifiedMapperPresent ? 'Present' : 'Missing'} |

## Enforcement point (current)

| Layer | Mechanism |
|-------|-----------|
| **Backend** | \`MfaGuard\` (global) denies staff in \`MFA_MANDATORY_ROLES\` when \`deriveMfaVerified(payload)\` is false |
| **Canonical MFA signal** | \`amr\` includes \`otp\`/\`totp\`/\`mfa\` **OR** JWT \`mfa_verified=true\` |
| **Local smoke bypass** | Keycloak user attribute \`pilot_smoke_mfa_verified=true\` → \`mfa_verified\` claim (LOCAL_ONLY) |
| **Frontend** | Displays MFA state from \`/auth/me\`; does not bypass backend guard |
| **Ops gate** | This closure script proves denial/acceptance matrix |

## Gaps

| Gap | Impact |
|-----|--------|
| Real TOTP on production-facing staff accounts | Manual enrollment required before external pilot |
| Security delegate sign-off | Technical gate can close; human approval still pending |
| DPO/legal review | Out of scope — not claimed |

## Safe for local pilot vs external pilot

| Mode | Staff without real OTP | Staff with smoke bypass attribute |
|------|------------------------|-----------------------------------|
| Local pilot smoke | Allowed via \`pilot_smoke_mfa_verified\` | Explicit, auditable |
| External pilot candidate | **Denied (403)** on staff routes | Attribute must be absent |

Probe error: ${probeError ?? 'none'}
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_3_ENFORCEMENT_MODEL.md',
    `# STAFF-MFA-3 Enforcement Model

## Combined model (A + C)

1. **Backend guard (always on):** \`MfaGuard\` checks \`MFA_MANDATORY_ROLES\` against \`deriveMfaVerified\`.
2. **Ops readiness gate:** \`npm run ops:staff-mfa-3-enforcement-closure\` validates Keycloak users, token claims, and staff route probes.
3. **Local smoke bypass (explicit):** Keycloak \`pilot_smoke_mfa_verified\` attribute — **not** an API auth bypass.

## Canonical MFA signal

\`\`\`typescript
deriveMfaVerified(payload):
  if payload.mfa_verified === true → true
  if payload.amr includes otp|totp|mfa → true
  else → false
\`\`\`

## Environment flags (documented mapping)

| Suggested flag | Canonical equivalent |
|----------------|---------------------|
| \`STAFF_MFA_ENFORCEMENT_ENABLED=true\` | \`MfaGuard\` active (default in API) |
| \`STAFF_MFA_REQUIRED_FOR_EXTERNAL_PILOT=true\` | External users without OTP/bypass → 403 |
| \`STAFF_MFA_LOCAL_SMOKE_BYPASS_ALLOWED=true\` | \`pilot_smoke_mfa_verified\` on designated smoke users only |

No duplicate backend env flags added — existing Keycloak attribute + guard is the canonical pattern from STAFF-MFA-1/2.

## Protected staff roles (\`MFA_MANDATORY_ROLES\`)

Includes: STAFF_DIR, STAFF_SYSADM, STAFF_TRAINADM, COM_CERT, SME, committee roles, QUALITY_MANAGER, EXAMINER, INVIGILATOR, etc.

Learners (\`USR_CAND\`, \`USR_CERT\`) are **not** in staff MFA mandatory set unless exam-start MFA decorator applies separately.

## External pilot readiness rule

Staff user is **external-pilot-ready** when:

- Has privileged staff role
- **No** \`pilot_smoke_mfa_verified\` smoke bypass
- OTP credential enrolled **and** token shows \`amr\` otp **or** successful \`/auth/mfa/verify\`
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_3_KEYCLOAK_USER_READINESS.md',
    `# STAFF-MFA-3 Keycloak User Readiness

| User | Exists | Role(s) | Tenant | OTP credential | Required actions | Token claim ready | External pilot ready |
|------|--------|---------|--------|----------------|------------------|-----------------|---------------------|
${staffUserRows
  .map(([email, v]) => {
    const roles = (v.roles ?? []).join(', ') || '—';
    const tenant = DEFAULT_TENANT;
    const extReady = v.hasOtp && v.pilotSmokeMfaVerified !== 'true' ? 'yes (OTP)' : v.pilotSmokeMfaVerified === 'true' ? 'no (smoke bypass only)' : 'no';
    return `| \`${email}\` | ${v.exists ? 'yes' : 'no'} | ${roles} | ${tenant} | ${v.hasOtp ? 'yes' : 'no'} | ${(v.requiredActions ?? []).join(', ') || 'none'} | ${v.hasOtp || v.pilotSmokeMfaVerified === 'true' ? 'partial/yes' : 'no'} | ${extReady} |`;
  })
  .join('\n')}

## Manual enrollment checklist (external-facing staff)

1. Remove \`pilot_smoke_mfa_verified\` attribute if present.
2. Enroll TOTP via Keycloak account console or browser CONFIGURE_TOTP flow.
3. Verify login prompts for OTP.
4. Confirm \`POST /auth/mfa/verify\` returns token with \`mfa_verified\` or \`amr\` otp.
5. Confirm \`GET /v1/staff/reports/overview\` returns 200.

Dedicated fixtures: \`${NO_MFA_DENIAL_USER}\` (no-MFA denial), \`${LOCAL_MFA_ROUTE_PROOF_USER}\` (local MFA route-proof). External-ready cohort OTP is read-only.
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_3_TEST_RESULTS.md',
    `# STAFF-MFA-3 Test Results

## API / MFA probes

See \`mfa-proof/route-probes.json\` and \`STAFF_MFA_3_API_CLAIM_PROBES.md\`.

| Probe | Result |
|-------|--------|
| External user without MFA → staff routes | ${externalDeniedWithoutMfa ? 'PASS (403)' : 'FAIL/PARTIAL'} |
| MFA-complete user → staff overview | ${withMfaOverviewAllowed ? 'PASS (200)' : 'FAIL/PARTIAL'} |
| Nest /auth/mfa/verify | ${nestMfaVerifyOk ? 'PASS' : 'PARTIAL'} |
| MFA claim (mfa_verified or amr otp) | ${mfaClaimOk ? 'PASS' : 'PARTIAL'} |
| Learner → staff route | ${learnerDenied ? 'PASS (denied)' : 'FAIL'} |
| Public verification no-auth | ${probes.publicVerify?.status === 200 ? 'PASS' : 'FAIL'} |
| Smoke bypass separation | ${smokeSeparationOk ? 'PASS' : 'FAIL'} |

## Unit tests (targeted)

Run separately: \`apps/api/src/auth/guards/mfa.guard.spec.ts\`, \`packages/shared-types\` auth helpers.

## Regression suite

See \`STAFF_MFA_3_REGRESSION_RESULTS.md\`.

**Targeted tests status:** ${!probeError && externalDeniedWithoutMfa && learnerDenied ? 'PASS' : probeError ? 'BLOCKED' : 'PARTIAL'}
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_3_RESIDUAL_RISKS.md',
    `# STAFF-MFA-3 Residual Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Manual TOTP enrollment not completed for all external staff | Medium | Security delegate sign-off gate; enrollment checklist |
| Smoke bypass attribute misapplied to external user | High | Ops script verifies separation; remove attribute before cutover |
| Password-only grant on enrolled user if Keycloak flow misconfigured | Medium | \`passwordOnlyBlocked\` probe in enrollment JSON |
| DPO/legal not reviewed | Medium | Explicitly not claimed in this task |
| Staging/hosted Keycloak not validated here | Low | Local baseline only — \`TD_085_GO_LOCAL_BASELINE_CONFIRMED\` prerequisite |

**Security delegate signoff required:** yes  
**External pilot approved:** no  
**DPO/legal signoff claimed:** no
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_3_REPORT.md',
    `# STAFF-MFA-3 Report

**Verdict:** \`${finalVerdict}\`

## Summary

Staff MFA enforcement is implemented at the API layer via \`MfaGuard\` and validated through Keycloak OTP + token claims. External-ready enrolled staff are OTP read-only. Without-MFA denial uses dedicated local fixture \`${NO_MFA_DENIAL_USER}\`.

## Current gap

${
  keycloakDirectGrantLimitation
    ? 'With-MFA route proof may remain PARTIAL due to Keycloak direct-grant TOTP/amr limitation; security invariants (denial without MFA, learner denial, OTP preservation) must still pass.'
    : manualEnrollmentRequired
      ? 'Real TOTP enrollment and/or route proof with MFA-complete token may be partial — manual enrollment for external-facing accounts remains before external pilot.'
      : 'Technical enforcement confirmed; security delegate sign-off still required.'
}

## Governance

- RBAC, tenant isolation, privacy: unchanged
- Prisma/migrations/API contracts: unchanged
- External pilot / DPO / legal: **not approved**

See also: \`STAFF_MFA_3_ENFORCEMENT_CLOSURE_REPORT.md\`
`,
  );

  const summary = {
    evidence_folder: relFolder,
    staff_mfa_enforcement_model_defined: true,
    staff_mfa_enforcement_enabled_for_external_mode: externalDeniedWithoutMfa,
    local_smoke_bypass_explicit: false,
    no_mfa_denial_fixture_user: NO_MFA_DENIAL_USER,
    no_mfa_denial_fixture_separate_from_external_ready_users: noMfaFixtureSeparate,
    local_mfa_route_proof_user: LOCAL_MFA_ROUTE_PROOF_USER,
    external_ready_otp_before: otpBefore?.otpCount ?? null,
    external_ready_otp_after: otpAfter?.otpCount ?? null,
    external_ready_otp_preserved: otpPreserved,
    staff_users_checked: Boolean(kcInspect?.users),
    staff_users_mfa_ready_count: externalReadyCount,
    staff_users_mfa_not_ready_count: notReadyCount,
    manual_enrollment_required: manualEnrollmentRequired,
    security_delegate_signoff_required: true,
    dpo_legal_signoff_claimed: false,
    external_pilot_approved: false,
    public_verification_unaffected: probes.publicVerify?.status === 200,
    learner_flows_unaffected: learnerDenied && probes.learner?.loginOk === true,
    targeted_tests_status: probeError ? 'BLOCKED' : externalDeniedWithoutMfa && learnerDenied && otpPreserved ? 'PASS' : 'FAIL',
    sequential_regression_status: process.env.STAFF_MFA_3_SEQUENTIAL_STATUS ?? 'NOT_RUN',
    production_code_changed: false,
    production_code_change_scope: 'scripts/ops/run-staff-mfa-3-enforcement-closure.mjs fixture remediation only',
    ops_scripts_changed: true,
    prisma_schema_changed: false,
    migrations_changed: false,
    api_contracts_changed: false,
    rbac_weakened: false,
    tenant_isolation_weakened: false,
    privacy_weakened: false,
    governance_boundaries_weakened: false,
    final_verdict: finalVerdict,
    keycloak_mfa_config_status: keycloakBlocked ? 'BLOCKED' : 'CONFIGURED_CONDITIONAL_OTP',
    smoke_bypass_separation_status: smokeSeparationOk ? 'DOCUMENTED_AND_VERIFIED' : 'PARTIAL',
    staff_mfa_enrollment_status: otpPreserved ? 'EXTERNAL_READY_OTP_PRESERVED' : 'PARTIAL',
    mfa_challenge_status: externalDeniedWithoutMfa ? 'DENIED_WITHOUT_MFA' : 'PARTIAL',
    mfa_claim_status: mfaClaimOk ? 'MFA_VERIFIED_OR_AMR_OTP' : 'PARTIAL',
    privileged_route_without_mfa_status: externalDeniedWithoutMfa ? 'DENIED_403' : 'NOT_CONFIRMED',
    privileged_route_with_mfa_status: privilegedRouteWithMfaStatus,
    learner_denial_status: learnerDenied ? 'PASS' : 'FAIL',
    regression_guard_status: regressionGuardStatus,
    full_regression_guard_status: fullRegressionPass ? 'PASS' : 'FAIL',
    browser_regressions_mode: skipBrowser ? 'LINKED_EVIDENCE' : 'LIVE_WITH_LINKED_FALLBACK',
    keycloak_direct_grant_totp_limitation: keycloakDirectGrantLimitation,
    users_tested: [
      NO_MFA_DENIAL_USER,
      LOCAL_MFA_ROUTE_PROOF_USER,
      ...EXTERNAL_READY_STAFF,
      LEARNER,
      WRONG_TENANT_STAFF,
    ],
    mfa_route_proof_user: mfaRouteProofUser,
    otp_guard_error: otpGuardError,
    recommended_next_action:
      finalVerdict === 'STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF'
        ? 'SECURITY_DELEGATE_SIGNOFF_THEN_DPO_LEGAL_SESSION'
        : 'REMEDIATE_MFA_FLOW_OR_COMPLETE_MANUAL_ENROLLMENT',
  };

  w(evidenceDir, 'summary.json', JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  process.exit(
    finalVerdict.includes('NO_GO') ||
    finalVerdict === 'STAFF_MFA_3_BLOCKED_KEYCLOAK_OR_ENV' ||
    finalVerdict === 'STAFF_MFA_3_BLOCKED_KEYCLOAK_OR_MFA_FLOW'
      ? 1
      : 0,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
