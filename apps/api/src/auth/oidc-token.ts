import { decode, verify, type JwtPayload } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

import type { OidcBrowserConfig } from './oidc-config';

const jwksClients = new Map<string, ReturnType<typeof jwksRsa>>();

export type TokenSet = Readonly<{
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}>;

export type RefreshTokenSet = Readonly<{
  accessToken: string;
  refreshToken: string;
  idToken: string | null;
  expiresIn: number;
}>;

function jwks(jwksUri: string): ReturnType<typeof jwksRsa> {
  const existing = jwksClients.get(jwksUri);
  if (existing) {
    return existing;
  }
  const created = jwksRsa({
    jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600_000,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    timeout: 5_000,
  });
  jwksClients.set(jwksUri, created);
  return created;
}

/** RS256 + issuer + audience + expiry. Does not replace JwtStrategy; the BFF stores only tokens that already pass this check. */
export type VerifiedOidcToken = JwtPayload & { readonly sub: string; readonly exp: number };

export async function verifyOidcToken(
  token: string,
  config: OidcBrowserConfig,
): Promise<VerifiedOidcToken> {
  const decoded = decode(token, { complete: true });
  if (decoded === null || typeof decoded === 'string' || decoded.header.alg !== 'RS256') {
    throw new Error('oidc.token.rejected');
  }
  const key = await jwks(config.jwksUri).getSigningKey(decoded.header.kid);
  const payload = verify(token, key.getPublicKey(), {
    algorithms: ['RS256'],
    issuer: config.issuerUrl,
    audience: config.clientId,
    clockTolerance: 30,
    ignoreExpiration: false,
  });
  if (
    typeof payload === 'string' ||
    typeof payload.exp !== 'number' ||
    typeof payload.sub !== 'string'
  ) {
    throw new Error('oidc.token.rejected');
  }
  return payload as VerifiedOidcToken;
}

async function postForm(url: string, body: URLSearchParams): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error('oidc.token.rejected');
  }
  return response.json();
}

function readTokenSet(payload: unknown): TokenSet {
  if (!payload || typeof payload !== 'object') {
    throw new Error('oidc.token.rejected');
  }
  const record = payload as Record<string, unknown>;
  const accessToken = record['access_token'];
  const refreshToken = record['refresh_token'];
  const idToken = record['id_token'];
  const expiresIn = record['expires_in'];
  if (
    typeof accessToken !== 'string' ||
    accessToken.length === 0 ||
    typeof refreshToken !== 'string' ||
    refreshToken.length === 0 ||
    typeof idToken !== 'string' ||
    idToken.length === 0
  ) {
    throw new Error('oidc.token.rejected');
  }
  return {
    accessToken,
    refreshToken,
    idToken,
    expiresIn: typeof expiresIn === 'number' && expiresIn > 0 ? expiresIn : 60,
  };
}

export function authorizeUrl(
  config: OidcBrowserConfig,
  input: {
    readonly state: string;
    readonly nonce: string;
    readonly challenge: string;
    readonly promptLogin: boolean;
  },
): string {
  const url = new URL(`${config.issuerUrl}/protocol/openid-connect/auth`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('scope', 'openid');
  url.searchParams.set('state', input.state);
  url.searchParams.set('nonce', input.nonce);
  url.searchParams.set('code_challenge', input.challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  if (input.promptLogin) {
    url.searchParams.set('prompt', 'login');
  }
  return url.toString();
}

export async function exchangeAuthorizationCode(
  config: OidcBrowserConfig,
  code: string,
  verifier: string,
): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    code_verifier: verifier,
  });
  return readTokenSet(await postForm(`${config.issuerUrl}/protocol/openid-connect/token`, body));
}

export async function refreshTokens(
  config: OidcBrowserConfig,
  refreshToken: string,
): Promise<RefreshTokenSet> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
  });
  const payload = await postForm(`${config.issuerUrl}/protocol/openid-connect/token`, body);
  if (!payload || typeof payload !== 'object') {
    throw new Error('oidc.token.rejected');
  }
  const record = payload as Record<string, unknown>;
  const accessToken = record['access_token'];
  const nextRefresh = record['refresh_token'];
  const idToken = record['id_token'];
  const expiresIn = record['expires_in'];
  if (
    typeof accessToken !== 'string' ||
    accessToken.length === 0 ||
    typeof nextRefresh !== 'string' ||
    nextRefresh.length === 0
  ) {
    throw new Error('oidc.token.rejected');
  }
  return {
    accessToken,
    refreshToken: nextRefresh,
    idToken: typeof idToken === 'string' && idToken.length > 0 ? idToken : null,
    expiresIn: typeof expiresIn === 'number' && expiresIn > 0 ? expiresIn : 60,
  };
}

export async function revokeRefreshToken(
  config: OidcBrowserConfig,
  refreshToken: string,
): Promise<void> {
  const body = new URLSearchParams({
    token: refreshToken,
    token_type_hint: 'refresh_token',
    client_id: config.clientId,
  });
  try {
    await fetch(`${config.issuerUrl}/protocol/openid-connect/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    /* Local session deletion still proceeds. A failed revoke must not keep the browser session. */
  }
}

export function endSessionUrl(config: OidcBrowserConfig, idToken: string): string {
  const url = new URL(`${config.issuerUrl}/protocol/openid-connect/logout`);
  url.searchParams.set('id_token_hint', idToken);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('post_logout_redirect_uri', config.postLogoutRedirectUri);
  return url.toString();
}
