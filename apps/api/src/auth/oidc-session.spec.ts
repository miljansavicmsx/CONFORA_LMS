import { createHmac } from 'node:crypto';

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

  it('keeps only a relative return path', () => {
    expect(safeReturnPath('/dashboard/profil')).toBe('/dashboard/profil');
    expect(safeReturnPath('https://evil.test/dashboard')).toBe('/dashboard');
    expect(safeReturnPath('//evil.test')).toBe('/dashboard');
    expect(sameString('state-a', 'state-a')).toBe(true);
    expect(sameString('state-a', 'state-b')).toBe(false);
  });
});
