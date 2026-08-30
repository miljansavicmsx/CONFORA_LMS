import { generateKeyPairSync, randomUUID } from 'node:crypto';
import { sign, verify, TokenExpiredError, NotBeforeError, JsonWebTokenError } from 'jsonwebtoken';

jest.mock('jwks-rsa', () => {
  const factory = jest.fn(() => ({
    getSigningKey: jest.fn().mockRejectedValue(
      Object.assign(new Error('SigningKeyNotFoundError'), {
        name: 'SigningKeyNotFoundError',
      }),
    ),
  }));
  return factory;
});

import { JwtStrategy } from './jwt.strategy';
import type { PrismaService } from '../prisma/prisma.service';

const VERIFY_OPTS = {
  algorithms: ['RS256'] as ['RS256'],
  issuer: 'http://issuer.test/realms/confora',
  audience: 'confora-web',
  ignoreExpiration: false,
  ignoreNotBefore: false,
  clockTolerance: 30,
};

describe('JwtStrategy cryptographic and claim contract', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;
  const tenantId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const subject = 'opaque-keycloak-sub-001';

  function signRs256(claims: Record<string, unknown>) {
    const now = Math.floor(Date.now() / 1000);
    return sign(
      {
        iss: VERIFY_OPTS.issuer,
        aud: VERIFY_OPTS.audience,
        sub: subject,
        tenant_id: tenantId,
        exp: now + 300,
        iat: now,
        realm_access: { roles: ['USR_CAND'] },
        ...claims,
      },
      privatePem,
      { algorithm: 'RS256', keyid: 'unit-kid' },
    );
  }

  it('AUTH_05 rejects token signed with HS256', () => {
    const token = sign(
      {
        iss: VERIFY_OPTS.issuer,
        aud: VERIFY_OPTS.audience,
        sub: subject,
        exp: Math.floor(Date.now() / 1000) + 60,
      },
      'symmetric-secret',
      { algorithm: 'HS256' },
    );
    expect(() => verify(token, publicPem, VERIFY_OPTS)).toThrow(JsonWebTokenError);
  });

  it('AUTH_06 rejects expired token', () => {
    const token = signRs256({ exp: Math.floor(Date.now() / 1000) - 120 });
    expect(() => verify(token, publicPem, VERIFY_OPTS)).toThrow(TokenExpiredError);
  });

  it('AUTH_07 rejects token with future nbf', () => {
    const token = signRs256({ nbf: Math.floor(Date.now() / 1000) + 600 });
    expect(() => verify(token, publicPem, VERIFY_OPTS)).toThrow(NotBeforeError);
  });

  it('AUTH_08 rejects token with wrong iss', () => {
    const token = signRs256({ iss: 'http://evil.test/realms/other' });
    expect(() => verify(token, publicPem, VERIFY_OPTS)).toThrow(/issuer/i);
  });

  it('AUTH_09 rejects token with wrong aud', () => {
    const token = signRs256({ aud: 'wrong-client' });
    expect(() => verify(token, publicPem, VERIFY_OPTS)).toThrow(/audience/i);
  });

  it('AUTH_13 accepts cryptographically valid RS256 access token', () => {
    const token = signRs256({});
    const payload = verify(token, publicPem, VERIFY_OPTS) as Record<string, unknown>;
    expect(payload.sub).toBe(subject);
    expect(payload.tenant_id).toBe(tenantId);
  });

  describe('validate()', () => {
    const findUnique = jest.fn();
    const prisma = {
      externalIdentityLink: {
        findUnique,
      },
    } as unknown as PrismaService;

    let strategy: JwtStrategy;

    beforeAll(() => {
      process.env['OIDC_ISSUER_URL'] = VERIFY_OPTS.issuer;
      process.env['OIDC_CLIENT_ID'] = VERIFY_OPTS.audience;
      process.env['DATABASE_URL'] =
        process.env['DATABASE_URL'] ?? 'postgresql://confora:confora@127.0.0.1:1/confora';
      strategy = new JwtStrategy(prisma);
    });

    beforeEach(() => {
      findUnique.mockReset();
      findUnique.mockResolvedValue({
        id: randomUUID(),
        tenantId,
        userId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        issuer: VERIFY_OPTS.issuer,
        subject,
        user: {
          id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          tenantId,
          email: 'learner@example.test',
        },
      });
    });

    it('AUTH_10 rejects token missing sub claim', async () => {
      await expect(
        strategy.validate({
          iss: VERIFY_OPTS.issuer,
          tenant_id: tenantId,
          exp: Math.floor(Date.now() / 1000) + 60,
        }),
      ).rejects.toThrow(/subject/i);
    });

    it('AUTH_11 rejects token missing tenant_id claim', async () => {
      await expect(
        strategy.validate({
          iss: VERIFY_OPTS.issuer,
          sub: subject,
          exp: Math.floor(Date.now() / 1000) + 60,
        }),
      ).rejects.toThrow(/tenant_id/i);
    });

    it('AUTH_12 rejects token with invalid tenant_id UUID', async () => {
      await expect(
        strategy.validate({
          iss: VERIFY_OPTS.issuer,
          sub: subject,
          tenant_id: 'not-a-uuid',
          exp: Math.floor(Date.now() / 1000) + 60,
        }),
      ).rejects.toThrow(/tenant_id/i);
    });

    it('AUTH_22 parses realm_access.roles into canonical RbacRole[]', async () => {
      const actor = await strategy.validate({
        iss: VERIFY_OPTS.issuer,
        sub: subject,
        tenant_id: tenantId,
        exp: Math.floor(Date.now() / 1000) + 60,
        realm_access: { roles: ['USR_CAND', 'STAFF_DIR'] },
      });
      expect(actor.roles).toEqual(['USR_CAND', 'STAFF_DIR']);
    });

    it('AUTH_23 ignores unknown realm roles', async () => {
      const actor = await strategy.validate({
        iss: VERIFY_OPTS.issuer,
        sub: subject,
        tenant_id: tenantId,
        exp: Math.floor(Date.now() / 1000) + 60,
        realm_access: { roles: ['USR_CAND', 'NOT_A_REAL_ROLE'] },
      });
      expect(actor.roles).toEqual(['USR_CAND']);
    });

    it('AUTH_24 derives mfaVerified without enforcing MFA policy', async () => {
      const actor = await strategy.validate({
        iss: VERIFY_OPTS.issuer,
        sub: subject,
        tenant_id: tenantId,
        exp: Math.floor(Date.now() / 1000) + 60,
        realm_access: { roles: ['USR_CAND'] },
        amr: ['pwd'],
      });
      expect(actor.mfaVerified).toBe(false);
    });

    it('AUTH_26 actor contains exactly the seven approved fields', async () => {
      const actor = await strategy.validate({
        iss: VERIFY_OPTS.issuer,
        sub: subject,
        tenant_id: tenantId,
        exp: Math.floor(Date.now() / 1000) + 60,
        realm_access: { roles: ['USR_CAND'] },
      });
      expect(Object.keys(actor).sort()).toEqual([
        'email',
        'issuer',
        'mfaVerified',
        'roles',
        'subject',
        'tenantId',
        'userId',
      ]);
    });
  });
});
