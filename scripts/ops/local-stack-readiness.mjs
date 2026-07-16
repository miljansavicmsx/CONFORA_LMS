#!/usr/bin/env node
/**
 * Local stack readiness probes for pilot Playwright orchestrators.
 * TCP + health + Keycloak token + Nest login + optional frontend env check.
 *
 * Secret hygiene: passwords and client secrets come from env only.
 * Returned JSON never includes token or password values — only presence booleans.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import net from 'node:net';

export const PILOT_LEARNER_EMAIL = 'pilot.learner@confora.test';

/** @deprecated Prefer PILOT_LEARNER_EMAIL — password must come from env. */
export const PILOT_LEARNER = {
  email: PILOT_LEARNER_EMAIL,
};

export const LOCAL_STACK = {
  postgresPort: 15432,
  keycloakPort: 18080,
  keycloakUrl: 'http://localhost:18080',
  keycloakRealm: 'confora',
  keycloakClientId: 'confora-api',
  apiPort: 4000,
  apiUrl: 'http://localhost:4000',
  frontendPort: 3001,
  frontendUrl: 'http://localhost:3001',
  e2eFrontendPort: 3011,
  e2eFrontendUrl: 'http://localhost:3011',
};

const PASSWORD_ENV_CANDIDATES = ['PLAYWRIGHT_PILOT_PASSWORD', 'PILOT_USER_PASSWORD'];
const CLIENT_SECRET_ENV_CANDIDATES = ['KEYCLOAK_API_CLIENT_SECRET', 'KEYCLOAK_CLIENT_SECRET'];

function requireEnv(candidates) {
  for (const name of candidates) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim().length > 0) {
      return { name, value: value.trim() };
    }
  }
  throw new Error(`Missing required environment variable: ${candidates.join(' or ')}`);
}

/** Resolve pilot password from env (never hardcoded). */
export function resolvePilotPasswordFromEnv() {
  return requireEnv(PASSWORD_ENV_CANDIDATES).value;
}

function resolveKeycloakClientSecretFromEnv() {
  return requireEnv(CLIENT_SECRET_ENV_CANDIDATES).value;
}

export function probeTcp(port, host = '127.0.0.1') {
  return new Promise((res) => {
    const s = net.createConnection({ host, port, timeout: 3000 }, () => {
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

export async function probeApiHealth(apiUrl = LOCAL_STACK.apiUrl) {
  try {
    const r = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(10_000) });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, status: 0, error: String(e?.message ?? e) };
  }
}

/**
 * Keycloak password-grant probe.
 * @returns {{ ok: boolean, accessTokenPresent?: boolean, status?: number, detail?: string, error?: string, _accessToken?: string }}
 * `_accessToken` is ephemeral for in-process chaining only — stripped before evidence return.
 */
export async function probeKeycloakToken(credentials) {
  const email = credentials?.email ?? PILOT_LEARNER_EMAIL;
  const password = credentials?.password ?? resolvePilotPasswordFromEnv();
  const clientSecret = credentials?.clientSecret ?? resolveKeycloakClientSecretFromEnv();
  try {
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: LOCAL_STACK.keycloakClientId,
      client_secret: clientSecret,
      username: email,
      password,
    });
    const r = await fetch(
      `${LOCAL_STACK.keycloakUrl}/realms/${LOCAL_STACK.keycloakRealm}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(20_000),
      },
    );
    if (!r.ok) {
      return { ok: false, accessTokenPresent: false, status: r.status, detail: 'token_grant_failed' };
    }
    const j = await r.json();
    const present = Boolean(j.access_token);
    return {
      ok: present,
      accessTokenPresent: present,
      _accessToken: present ? j.access_token : undefined,
    };
  } catch (e) {
    return { ok: false, accessTokenPresent: false, error: String(e?.message ?? e) };
  }
}

/**
 * Nest /auth/login probe.
 * @returns safe public fields + ephemeral `_accessToken` for chaining only.
 */
export async function probeNestLogin(credentials, apiUrl = LOCAL_STACK.apiUrl) {
  const email = credentials?.email ?? PILOT_LEARNER_EMAIL;
  const password = credentials?.password ?? resolvePilotPasswordFromEnv();
  try {
    const r = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username: email, password }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) {
      return {
        ok: false,
        accessTokenPresent: false,
        refreshTokenPresent: false,
        status: r.status,
        detail: 'nest_login_failed',
      };
    }
    const j = await r.json();
    const accessPresent = Boolean(j.access_token);
    const refreshPresent = Boolean(j.refresh_token);
    return {
      ok: accessPresent && refreshPresent,
      accessTokenPresent: accessPresent,
      refreshTokenPresent: refreshPresent,
      _accessToken: accessPresent ? j.access_token : undefined,
    };
  } catch (e) {
    return {
      ok: false,
      accessTokenPresent: false,
      refreshTokenPresent: false,
      error: String(e?.message ?? e),
    };
  }
}

export async function probeApiTokenValidation(accessToken, apiUrl = LOCAL_STACK.apiUrl) {
  if (!accessToken) return { ok: false, detail: 'missing token' };
  try {
    const r = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) {
      return { ok: false, status: r.status, detail: 'auth_me_failed' };
    }
    const j = await r.json();
    return {
      ok: Boolean(j.email || j.userId || j.sub),
      profileValidated: Boolean(j.email || j.userId || j.sub),
      rolePresent: Boolean(j.role || (Array.isArray(j.roles) && j.roles.length > 0)),
    };
  } catch (e) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}

export async function probeExamRegistrationOptions(accessToken, apiUrl = LOCAL_STACK.apiUrl) {
  if (!accessToken) return { ok: false, detail: 'missing token' };
  try {
    const r = await fetch(`${apiUrl}/v1/me/exams/registration-options`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) {
      return { ok: false, status: r.status, detail: 'exam_registration_options_failed' };
    }
    const j = await r.json();
    return { ok: Boolean(j.contractVersion), status: r.status };
  } catch (e) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}

export async function probeFrontendReachable(frontendUrl = LOCAL_STACK.frontendUrl) {
  try {
    const r = await fetch(`${frontendUrl}/login`, { signal: AbortSignal.timeout(10_000) });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}

/** Whether frontend-app/.env.local enables Nest auth pilot (requires Vite restart after write). */
export function readPilotFrontendEnvStatus(repoRoot) {
  const envPath = join(repoRoot, 'frontend-app', '.env.local');
  if (!existsSync(envPath)) {
    return { configured: false, path: envPath, detail: 'missing .env.local — Vite defaults to legacy auth' };
  }
  const raw = readFileSync(envPath, 'utf8');
  const nestAuth = /^\s*VITE_AUTH_PROVIDER\s*=\s*nest\s*$/m.test(raw);
  const pilot = /^\s*VITE_NEST_AUTH_PILOT_ENABLED\s*=\s*true\s*$/m.test(raw);
  return {
    configured: nestAuth && pilot,
    path: envPath,
    nestAuth,
    pilot,
    detail: nestAuth && pilot ? 'nest pilot env present' : 'incomplete nest pilot env',
  };
}

function stripEphemeralTokens(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const { _accessToken: _drop, ...rest } = obj;
  return rest;
}

export async function waitForLocalStackReadiness(options = {}) {
  const {
    maxAttempts = 12,
    delayMs = 5000,
    requireFrontendEnv = false,
    repoRoot = null,
  } = options;

  let last = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    last = await assessLocalStackReadiness({ requireFrontendEnv, repoRoot });
    if (last.ready) {
      return { ...last, attempts: attempt };
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return { ...last, attempts: maxAttempts, timedOut: true };
}

export async function assessLocalStackReadiness(options = {}) {
  const { requireFrontendEnv = false, repoRoot = null } = options;

  let password;
  let clientSecret;
  try {
    password = resolvePilotPasswordFromEnv();
    clientSecret = resolveKeycloakClientSecretFromEnv();
  } catch (e) {
    return {
      ready: false,
      stackOk: false,
      authOk: false,
      healthOk: false,
      frontendEnvOk: false,
      rootCause: String(e?.message ?? e),
      stack: { pg: false, kc: false, api: false, fe: false },
      health: { ok: false },
      frontend: { ok: false },
      keycloak: { ok: false, accessTokenPresent: false },
      nestLogin: { ok: false, accessTokenPresent: false, refreshTokenPresent: false },
      apiMe: { ok: false },
      examReg: { ok: false },
      frontendEnv: { configured: null, detail: 'not checked' },
    };
  }

  const credentials = {
    email: PILOT_LEARNER_EMAIL,
    password,
    clientSecret,
  };

  const stack = {
    pg: await probeTcp(LOCAL_STACK.postgresPort),
    kc: await probeTcp(LOCAL_STACK.keycloakPort),
    api: await probeTcp(LOCAL_STACK.apiPort),
    fe: await probeTcp(LOCAL_STACK.frontendPort),
  };

  const health = stack.api ? await probeApiHealth() : { ok: false, status: 0 };
  const frontend = stack.fe ? await probeFrontendReachable() : { ok: false };
  const keycloakRaw = stack.kc ? await probeKeycloakToken(credentials) : { ok: false, accessTokenPresent: false };
  const nestLoginRaw =
    stack.api && health.ok
      ? await probeNestLogin(credentials)
      : { ok: false, accessTokenPresent: false, refreshTokenPresent: false };

  const ephemeralToken = nestLoginRaw._accessToken ?? keycloakRaw._accessToken ?? null;
  const apiMe = ephemeralToken
    ? await probeApiTokenValidation(ephemeralToken)
    : { ok: false, detail: 'no token' };
  const examReg =
    ephemeralToken && apiMe.ok
      ? await probeExamRegistrationOptions(ephemeralToken)
      : { ok: false, detail: 'skipped' };

  const keycloak = stripEphemeralTokens(keycloakRaw);
  const nestLogin = stripEphemeralTokens(nestLoginRaw);

  const frontendEnv =
    repoRoot != null ? readPilotFrontendEnvStatus(repoRoot) : { configured: null, detail: 'not checked' };

  const stackUp = stack.pg && stack.kc && stack.api && stack.fe && health.ok && frontend.ok;
  const authOk = keycloak.ok && nestLogin.ok && apiMe.ok && examReg.ok;
  const frontendEnvOk = requireFrontendEnv ? Boolean(frontendEnv.configured) : true;

  const ready = stackUp && authOk && frontendEnvOk;

  let rootCause = null;
  if (!stack.pg) rootCause = 'postgresql_not_ready';
  else if (!stack.kc) rootCause = 'keycloak_not_ready';
  else if (!stack.api || !health.ok) rootCause = 'nest_api_not_ready';
  else if (!stack.fe || !frontend.ok) rootCause = 'frontend_not_reachable';
  else if (!keycloak.ok) rootCause = 'keycloak_token_grant_failed';
  else if (!nestLogin.ok) rootCause = 'nest_auth_login_failed';
  else if (!apiMe.ok) rootCause = 'api_token_validation_failed';
  else if (!examReg.ok) rootCause = 'exam_registration_endpoint_unavailable';
  else if (!frontendEnvOk) rootCause = 'frontend_missing_nest_auth_env';

  return {
    ready,
    stackOk: stackUp,
    authOk,
    healthOk: health.ok,
    frontendEnvOk,
    rootCause,
    stack,
    health,
    frontend,
    keycloak,
    nestLogin,
    apiMe,
    examReg,
    frontendEnv,
  };
}

/** Playwright env for pilot E2E on dedicated port (avoids stale Vite without nest auth). */
export function getPilotPlaywrightEnv(overrides = {}) {
  const password = resolvePilotPasswordFromEnv();
  const port = String(overrides.port ?? process.env.PLAYWRIGHT_E2E_PORT ?? LOCAL_STACK.e2eFrontendPort);
  const base = {
    PLAYWRIGHT_PILOT_AUTH: '1',
    PLAYWRIGHT_PILOT_PASSWORD: password,
    PLAYWRIGHT_E2E_PORT: port,
    PLAYWRIGHT_BASE_URL: `http://localhost:${port}`,
    PLAYWRIGHT_FORCE_FRESH_SERVER: '1',
    VITE_API_PROVIDER: 'hybrid',
    VITE_AUTH_PROVIDER: 'nest',
    VITE_NEST_AUTH_PILOT_ENABLED: 'true',
    VITE_CONFORA_API_URL: LOCAL_STACK.apiUrl,
    VITE_LEGACY_API_URL: 'http://localhost:8000',
    VITE_API_URL: 'http://localhost:8000',
  };
  return { ...base, ...overrides.extra };
}
