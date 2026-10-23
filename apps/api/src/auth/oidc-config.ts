export const SESSION_COOKIE_NAME = 'confora_sid';
export const TRANSACTION_COOKIE_NAME = 'confora_oidc_tx';

export type OidcBrowserConfig = Readonly<{
  issuerUrl: string;
  clientId: string;
  jwksUri: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  webOrigins: readonly string[];
  sessionSecret: string;
  cookieSecure: boolean;
  idleSeconds: number;
  absoluteSeconds: number;
}>;

function positiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  if (!/^[0-9]+$/.test(raw.trim())) {
    throw new Error('OIDC session lifetime must be a positive integer number of seconds.');
  }
  const value = Number(raw.trim());
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error('OIDC session lifetime must be a positive integer number of seconds.');
  }
  return value;
}

/**
 * Browser-session configuration for the OIDC BFF.
 * JWT validation itself still uses only OIDC_ISSUER_URL and OIDC_CLIENT_ID.
 * A missing session secret disables the browser flow; it does not open a bypass.
 */
export function loadOidcBrowserConfig(env: NodeJS.ProcessEnv = process.env): OidcBrowserConfig {
  const issuerUrl = env['OIDC_ISSUER_URL']?.trim() ?? '';
  const clientId = env['OIDC_CLIENT_ID']?.trim() ?? '';
  const sessionSecret = env['OIDC_SESSION_SECRET']?.trim() ?? '';
  if (issuerUrl === '' || clientId === '' || sessionSecret.length < 32) {
    throw new Error('OIDC browser session is not configured.');
  }
  const webOrigins = (env['OIDC_WEB_ORIGINS'] ?? 'http://localhost:3001,http://127.0.0.1:3001')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  if (webOrigins.length === 0) {
    throw new Error('OIDC_WEB_ORIGINS must list at least one origin.');
  }
  const idleSeconds = positiveInt(env['OIDC_SESSION_IDLE_SECONDS'], 1800);
  const absoluteSeconds = positiveInt(env['OIDC_SESSION_ABSOLUTE_SECONDS'], 28_800);
  if (idleSeconds > absoluteSeconds) {
    throw new Error('OIDC_SESSION_IDLE_SECONDS must not exceed OIDC_SESSION_ABSOLUTE_SECONDS.');
  }
  const secureRaw = (env['SESSION_COOKIE_SECURE'] ?? 'true').trim().toLowerCase();
  const issuer = issuerUrl.replace(/\/$/, '');
  const primary = webOrigins[0] ?? 'http://localhost:3001';
  return {
    issuerUrl: issuer,
    clientId,
    jwksUri: `${issuer}/protocol/openid-connect/certs`,
    redirectUri: (env['OIDC_REDIRECT_URI'] ?? 'http://localhost:4000/v1/auth/oidc/callback').trim(),
    postLogoutRedirectUri: (env['OIDC_POST_LOGOUT_REDIRECT_URI'] ?? `${primary}/login`).trim(),
    webOrigins,
    sessionSecret,
    cookieSecure: secureRaw !== 'false' && secureRaw !== '0',
    idleSeconds,
    absoluteSeconds,
  };
}

export function tryLoadOidcBrowserConfig(
  env: NodeJS.ProcessEnv = process.env,
): OidcBrowserConfig | null {
  try {
    return loadOidcBrowserConfig(env);
  } catch {
    return null;
  }
}
