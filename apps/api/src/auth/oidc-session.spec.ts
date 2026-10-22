import { createHmac } from 'node:crypto';

import { Logger } from '@nestjs/common';

import {
  createPkce,
  openJson,
  safeReturnPath,
  sameString,
  sealJson,
  sessionExpiryReason,
  signSessionId,
  verifySessionId,
  s256,
} from './oidc-crypto';
import type { OidcBrowserConfig } from './oidc-config';
import { revokeRefreshToken } from './oidc-token';

describe('OIDC session primitives', () => {
  const secret = '0123456789abcdef0123456789abcdef';

  it('matches the S256 challenge to the verifier', () => {
    const pkce = createPkce();
    expect(pkce.challenge).toBe(s256(pkce.verifier));
    expect(pkce.challenge).not.toBe(pkce.verifier);
  });

  it('rejects a tampered session cookie', () => {
    const signed = signSessionId(secret, 'a'.repeat(43));
    expect(verifySessionId(secret, signed)).toBe('a'.repeat(43));
    const mac = signed.split('.')[1] ?? '';
    expect(verifySessionId(secret, `${'b'.repeat(43)}.${mac}`)).toBeNull();
    const forged = createHmac('sha256', 'other-secret').update('a'.repeat(43)).digest('base64url');
    expect(verifySessionId(secret, `${'a'.repeat(43)}.${forged}`)).toBeNull();
  });

  it('seals the transaction so a changed byte does not open', () => {
    const sealed = sealJson(secret, { state: 's', nonce: 'n' });
    expect(openJson(secret, sealed)).toEqual({ state: 's', nonce: 'n' });
    expect(openJson(secret, `${sealed}x`)).toBeNull();
    expect(openJson('different-secret-value-32-characters', sealed)).toBeNull();
  });

  it('treats idle expiry separately from the absolute lifetime', () => {
    const createdAt = 1_000_000;
    expect(
      sessionExpiryReason({ createdAt, lastSeenAt: createdAt }, createdAt + 1_000, 2, 10),
    ).toBeNull();
    expect(
      sessionExpiryReason({ createdAt, lastSeenAt: createdAt }, createdAt + 2_000, 2, 10),
    ).toBe('idle');
    expect(
      sessionExpiryReason({ createdAt, lastSeenAt: createdAt + 9_000 }, createdAt + 10_000, 30, 10),
    ).toBe('absolute');
  });

  it('logs a rejected refresh-token revocation without the token', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const previous = globalThis.fetch;
    const config: OidcBrowserConfig = {
      issuerUrl: 'http://issuer.test/realms/confora',
      clientId: 'confora-web',
      jwksUri: 'http://issuer.test/realms/confora/protocol/openid-connect/certs',
      redirectUri: 'http://localhost:4000/v1/auth/oidc/callback',
      postLogoutRedirectUri: 'http://localhost:3001/login',
      webOrigins: ['http://localhost:3001'],
      sessionSecret: secret,
      cookieSecure: false,
      idleSeconds: 1800,
      absoluteSeconds: 28800,
    };
    const secretToken = 'super-secret-refresh-token';
    globalThis.fetch = () => Promise.resolve(new Response('nope', { status: 503 }));
    await revokeRefreshToken(config, secretToken);
    globalThis.fetch = () => Promise.reject(new Error('socket hang up'));
    await revokeRefreshToken(config, secretToken);
    const logged = warn.mock.calls
      .map((call) => call.map((part) => String(part)).join(' '))
      .join('\n');
    expect(logged).toContain('HTTP 503');
    expect(logged).toContain('Error');
    expect(logged).not.toContain(secretToken);
    warn.mockRestore();
    globalThis.fetch = previous;
  });

  it('keeps only a relative return path', () => {
    expect(safeReturnPath('/dashboard/profil')).toBe('/dashboard/profil');
    expect(safeReturnPath('https://evil.test/dashboard')).toBe('/dashboard');
    expect(safeReturnPath('//evil.test')).toBe('/dashboard');
    expect(sameString('state-a', 'state-a')).toBe(true);
    expect(sameString('state-a', 'state-b')).toBe(false);
  });
});
