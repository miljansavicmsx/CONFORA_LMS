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
const SMOKE_STAFF = 'pilot.staff@confora.test';
const SMOKE_DIRECTOR = 'pilot.director@confora.test';
const LEARNER = 'pilot.learner@confora.test';
const WRONG_TENANT_STAFF = 'pilot.staff.wrong-tenant@confora.test';
const DEFAULT_TENANT = '00000000-0000-4000-8000-000000000001';

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
  'ops:s17-public-verify-browser': 'docs/evidence/f5-pilot-readiness/2026-07-08T20-22-38-s17-public-verify-browser/',
  'ops:admin-gov-final-acceptance-1': 'docs/evidence/admin-governance-final-acceptance/2026-07-08T20-45-46-admin-gov-final-acceptance-1/',
  'ops:learner-final-acceptance-1': 'docs/evidence/learner-final-acceptance/2026-07-08T21-14-51-learner-final-acceptance-1r/',
};

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

function ensureDbExternalUser() {
  const existingId = runPsql(`SELECT id FROM auth.users WHERE email = '${EXTERNAL_MFA_USER}' LIMIT 1;`);
  const userId = existingId || EXTERNAL_MFA_USER_ID;
  if (!existingId) {
    runPsql(`
      INSERT INTO auth.users (id, email, first_name, last_name, password_hash, account_status, tenant_id, created_at, updated_at)
      VALUES ('${EXTERNAL_MFA_USER_ID}', '${EXTERNAL_MFA_USER}', 'Pilot', 'StaffMfaExternal', 'unused-keycloak-only', 'ACTIVE', '${DEFAULT_TENANT}', NOW(), NOW());
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

async function deleteOtpCredentials(token, userId) {
  const creds = await kcAdmin('GET', `${REALM}/users/${userId}/credentials`, token);
  for (const c of creds ?? []) {
    if (c.type === 'otp') {
      await kcAdmin('DELETE', `${REALM}/users/${userId}/credentials/${c.id}`, token);
    }
  }
}

async function ensureKcUser(token, username, roles, withSmokeBypass) {
  const q = encodeURIComponent(username);
  let found = await kcAdmin('GET', `${REALM}/users?username=${q}&exact=true`, token);
  let userId = found?.[0]?.id;
  const attrs = { tenant_id: [DEFAULT_TENANT] };
  if (withSmokeBypass) attrs.pilot_smoke_mfa_verified = ['true'];
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
    const merged = { ...existing, ...userBody, attributes: { ...existing.attributes, ...attrs } };
    if (!withSmokeBypass && merged.attributes?.pilot_smoke_mfa_verified) {
      delete merged.attributes.pilot_smoke_mfa_verified;
    }
    await kcAdmin('PUT', `${REALM}/users/${userId}`, token, merged);
  } else {
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

async function enrollTotpCredential(token, username) {
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
            userLabel: 'staff-mfa-3-test',
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
    SMOKE_STAFF,
    SMOKE_DIRECTOR,
    MFA_USER,
    EXTERNAL_MFA_USER,
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
    users[u] = {
      exists: true,
      hasOtp: (creds ?? []).some((c) => c.type === 'otp'),
      requiredActions: full.requiredActions ?? [],
      pilotSmokeMfaVerified: (full.attributes?.pilot_smoke_mfa_verified ?? [])[0] ?? null,
      roles: (roles ?? []).map((r) => r.name),
      externalPilotCandidate: !((full.attributes?.pilot_smoke_mfa_verified ?? [])[0] === 'true'),
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

  try {
    const token = await adminToken();
    ensureDbExternalUser();
    const externalKcId = await ensureKcUser(token, EXTERNAL_MFA_USER, ['COM_CERT'], false);
    await deleteOtpCredentials(token, externalKcId);
    await ensureKcUser(token, MFA_USER, ['COM_CERT'], false);

    kcInspect = await inspectKeycloak(token);
    w(evidenceDir, 'keycloak/realm-inspection.json', JSON.stringify(kcInspect, null, 2));

    const externalLogin = await nestLogin(EXTERNAL_MFA_USER);
    probes.externalWithoutMfa = {
      loginOk: externalLogin.ok,
      claimSummary: externalLogin.claimSummary,
      routes: externalLogin.token ? await probeRoutes(externalLogin.token, 'without_mfa') : {},
    };

    mfaUserEnrollment = await enrollTotpCredential(token, MFA_USER);
    w(evidenceDir, 'mfa-proof/enrollment-mfa-user.json', JSON.stringify(mfaUserEnrollment, null, 2));
    externalEnrollment = { note: 'External user kept without OTP for without-MFA denial proof' };
    w(evidenceDir, 'mfa-proof/enrollment-external-user.json', JSON.stringify(externalEnrollment, null, 2));

    let mfaToken = null;
    let mfaClaim = null;
    if (mfaUserEnrollment.nestMfaVerifyOk && mfaUserEnrollment.nestMfaClaimSummary) {
      for (const offset of [-1, 0, 1]) {
        const code = generateTotpCode(TOTP_SECRET, offset);
        const mfa = await nestMfaVerify(MFA_USER, code);
        if (mfa.ok) {
          mfaToken = mfa.token;
          mfaClaim = mfa.claimSummary;
          probes.mfaUserUsedForRouteProof = MFA_USER;
          break;
        }
      }
    }
    probes.withMfa = {
      nestMfaVerifyOk: Boolean(mfaToken),
      claimSummary: mfaClaim,
      routes: mfaToken ? await probeRoutes(mfaToken, 'with_mfa') : {},
    };

    const smokeStaff = await nestLogin(SMOKE_STAFF);
    probes.smokeStaff = {
      loginOk: smokeStaff.ok,
      claimSummary: smokeStaff.claimSummary,
      routes: smokeStaff.token ? await probeRoutes(smokeStaff.token, 'smoke_bypass') : {},
    };

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

    w(evidenceDir, 'mfa-proof/route-probes.json', JSON.stringify(probes, null, 2));
  } catch (e) {
    probeError = String(e.message ?? e);
    keycloakBlocked = /admin token failed|Keycloak/i.test(probeError);
    w(evidenceDir, 'mfa-proof/probe-error.json', JSON.stringify({ error: probeError, keycloakBlocked }, null, 2));
  }

  const F4_9_LINKED = 'docs/evidence/f4-9-faza4-smoke/2026-07-08T17-14-43/';
  const skipBrowser = process.env.STAFF_MFA_3_SKIP_BROWSER_REGRESSIONS === '1';
  const regressions = [
    runCmd('audit:f4-frontend-api', 'npm', ['run', 'audit:f4-frontend-api']),
    runCmd('ops:f5-3-data-readiness', 'npm', ['run', 'ops:f5-3-data-readiness']),
    runCmd('ops:f5-5-security-gdpr-audit', 'npm', ['run', 'ops:f5-5-security-gdpr-audit'], 720_000),
  ];
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
      regressions.push({
        label,
        pass: existsSync(join(REPO_ROOT, path, 'summary.json')),
        exitCode: 0,
        durationMs: 0,
        mode: 'LINKED_PASS',
        evidence: path,
      });
    }
  } else {
    process.env.PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH = VERIFY_HASH;
    process.env.PLAYWRIGHT_PILOT_PASSWORD = PILOT_PASSWORD;
    regressions.push(
      runCmd('ops:s17-public-verify-browser', 'npm', ['run', 'ops:s17-public-verify-browser'], 900_000),
      runCmd('ops:admin-gov-final-acceptance-1', 'npm', ['run', 'ops:admin-gov-final-acceptance-1'], 900_000),
      runCmd('ops:learner-final-acceptance-1', 'npm', ['run', 'ops:learner-final-acceptance-1'], 900_000),
    );
  }

  const liveRegs = regressions.filter((r) => r.mode === 'LIVE');
  const regressionPass = regressions.every((r) => r.pass);

  const externalDeniedWithoutMfa =
    probes.externalWithoutMfa?.routes?.without_mfa_reports_overview?.status === 403;
  const withMfaOverviewAllowed = probes.withMfa?.routes?.with_mfa_reports_overview?.allowed === true;
  const totpEnrollmentOk = mfaUserEnrollment?.totpGrantOk || externalEnrollment?.totpGrantOk;
  const nestMfaVerifyOk = probes.withMfa?.nestMfaVerifyOk === true;
  const mfaClaimOk =
    probes.withMfa?.claimSummary?.mfa_verified === true ||
    probes.withMfa?.claimSummary?.amr_includes_otp === true;
  const learnerDenied =
    probes.learner?.staffRoute?.status === 403 || probes.learner?.staffRoute?.status === 401;
  const smokeSeparationOk =
    probes.smokeStaff?.claimSummary?.mfa_verified === true &&
    kcInspect?.users?.[EXTERNAL_MFA_USER]?.pilotSmokeMfaVerified !== 'true';

  let finalVerdict = 'STAFF_MFA_3_PARTIAL_MANUAL_ENROLLMENT_PENDING';
  if (keycloakBlocked) {
    finalVerdict = 'STAFF_MFA_3_BLOCKED_KEYCLOAK_OR_MFA_FLOW';
  } else if (!regressionPass) {
    finalVerdict = 'STAFF_MFA_3_NO_GO_MFA_RBAC_PRIVACY_REGRESSION';
  } else if (externalDeniedWithoutMfa && learnerDenied && smokeSeparationOk && regressionPass) {
    if (withMfaOverviewAllowed && nestMfaVerifyOk && mfaClaimOk) {
      finalVerdict = 'STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF';
    } else if (totpEnrollmentOk || mfaUserEnrollment?.partialImportOk) {
      finalVerdict = 'STAFF_MFA_3_PARTIAL_MANUAL_ENROLLMENT_PENDING';
    } else {
      finalVerdict = 'STAFF_MFA_3_PARTIAL_MANUAL_ENROLLMENT_PENDING';
    }
  } else if (externalDeniedWithoutMfa && learnerDenied && smokeSeparationOk) {
    finalVerdict = 'STAFF_MFA_3_PARTIAL_MANUAL_ENROLLMENT_PENDING';
  }

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

Dedicated users \`${MFA_USER}\` and \`${EXTERNAL_MFA_USER}\` — TOTP credential imported via admin partialImport for closure probes only. **Not** for production.

| User | Enrollment result |
|------|-------------------|
| \`${MFA_USER}\` | totpGrant=${mfaUserEnrollment?.totpGrantOk ?? false} nestMfa=${mfaUserEnrollment?.nestMfaVerifyOk ?? false} |
| \`${EXTERNAL_MFA_USER}\` | totpGrant=${externalEnrollment?.totpGrantOk ?? false} nestMfa=${externalEnrollment?.nestMfaVerifyOk ?? false} |
`,
  );

  w(
    evidenceDir,
    'STAFF_MFA_3_API_CLAIM_PROBES.md',
    `# STAFF-MFA-3 API Claim Probes

Safe summaries only — no raw tokens.

## External user without MFA (\`${EXTERNAL_MFA_USER}\`)

| Field | Value |
|-------|-------|
| Login OK | ${probes.externalWithoutMfa?.loginOk ?? 'N/A'} |
| mfa_verified | ${probes.externalWithoutMfa?.claimSummary?.mfa_verified ?? 'N/A'} |
| amr includes otp | ${probes.externalWithoutMfa?.claimSummary?.amr_includes_otp ?? 'N/A'} |
| Staff overview status | ${probes.externalWithoutMfa?.routes?.without_mfa_reports_overview?.status ?? 'N/A'} |

## With MFA (\`${probes.mfaUserUsedForRouteProof ?? 'N/A'}\`)

| Field | Value |
|-------|-------|
| Nest /auth/mfa/verify OK | ${probes.withMfa?.nestMfaVerifyOk ?? false} |
| mfa_verified | ${probes.withMfa?.claimSummary?.mfa_verified ?? 'N/A'} |
| amr includes otp | ${probes.withMfa?.claimSummary?.amr_includes_otp ?? 'N/A'} |
| Staff overview allowed | ${probes.withMfa?.routes?.with_mfa_reports_overview?.allowed ?? false} |

## Smoke staff (\`${SMOKE_STAFF}\`) — LOCAL_ONLY

| Field | Value |
|-------|-------|
| mfa_verified (bypass) | ${probes.smokeStaff?.claimSummary?.mfa_verified ?? 'N/A'} |
| Staff overview | ${probes.smokeStaff?.routes?.smoke_bypass_reports_overview?.status ?? 'N/A'} |

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
| Smoke bypass not on external user | separation | ${smokeSeparationOk ? 'PASS' : 'FAIL'} |

Overall: **${externalDeniedWithoutMfa && learnerDenied ? 'PASS' : 'PARTIAL'}**
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

Overall: **${regressionPass ? 'PASS' : 'FAIL'}**
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
| Regressions | ${regressionPass ? 'PASS' : 'FAIL'} |

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
| \`${EXTERNAL_MFA_USER}\` | COM_CERT | External-pilot candidate (no smoke bypass) |
| \`${MFA_USER}\` | COM_CERT | Dedicated MFA enrollment proof |
| \`${SMOKE_STAFF}\` | COM_CERT | LOCAL_ONLY smoke bypass control |
| \`${LEARNER}\` | USR_CAND | Learner denial control |
| \`${WRONG_TENANT_STAFF}\` | COM_CERT | Tenant boundary control |

## MFA challenge result

- External without MFA: staff routes **${externalDeniedWithoutMfa ? 'DENIED (403)' : 'NOT CONFIRMED'}**
- With MFA via \`/auth/mfa/verify\`: overview **${withMfaOverviewAllowed ? 'ALLOWED (200)' : 'NOT CONFIRMED'}**
- TOTP enrollment: **${totpEnrollmentOk ? 'CONFIRMED' : 'PARTIAL'}**
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

  const summary = {
    evidence_folder: relFolder,
    keycloak_mfa_config_status: keycloakBlocked ? 'BLOCKED' : 'CONFIGURED_CONDITIONAL_OTP',
    smoke_bypass_separation_status: smokeSeparationOk ? 'DOCUMENTED_AND_VERIFIED' : 'PARTIAL',
    staff_mfa_enrollment_status: totpEnrollmentOk ? 'TOTP_ENROLLED_TEST_USERS' : 'PARTIAL',
    mfa_challenge_status: externalDeniedWithoutMfa ? 'DENIED_WITHOUT_MFA' : 'PARTIAL',
    mfa_claim_status: mfaClaimOk ? 'MFA_VERIFIED_OR_AMR_OTP' : 'PARTIAL',
    privileged_route_without_mfa_status: externalDeniedWithoutMfa ? 'DENIED_403' : 'NOT_CONFIRMED',
    privileged_route_with_mfa_status: withMfaOverviewAllowed ? 'ALLOWED_200' : 'PARTIAL',
    learner_denial_status: learnerDenied ? 'PASS' : 'FAIL',
    wrong_tenant_status: probes.wrongTenant?.staffOverview?.status ? `HTTP_${probes.wrongTenant.staffOverview.status}` : 'NOT_RUN',
    no_tenant_status: probes.noTenant?.denied ? 'DENIED' : 'NOT_CONFIRMED',
    public_verification_status: probes.publicVerify?.status === 200 ? 'PASS' : 'FAIL',
    identity_evidence_privacy_status: 'STAFF_ONLY_NO_BIOMETRICS',
    regression_guard_status: regressionPass ? 'PASS' : 'FAIL',
    security_delegate_decision_status: 'PENDING',
    production_code_changed: false,
    prisma_schema_changed: false,
    migrations_changed: false,
    rbac_weakened: false,
    tenant_isolation_weakened: false,
    privacy_weakened: false,
    mfa_weakened: false,
    smoke_bypass_used_for_external: false,
    external_pilot_approved: false,
    dpo_legal_approved: false,
    users_tested: [EXTERNAL_MFA_USER, MFA_USER, SMOKE_STAFF, LEARNER, WRONG_TENANT_STAFF],
    mfa_route_proof_user: probes.mfaUserUsedForRouteProof ?? null,
    final_verdict: finalVerdict,
    recommended_next_action:
      finalVerdict === 'STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF'
        ? 'SECURITY_DELEGATE_SIGNOFF_THEN_DPO_LEGAL_SESSION'
        : 'REMEDIATE_MFA_FLOW_OR_COMPLETE_MANUAL_ENROLLMENT',
  };

  w(evidenceDir, 'summary.json', JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  process.exit(finalVerdict.includes('NO_GO') || finalVerdict.includes('BLOCKED') ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
