jest.mock('jwks-rsa', () => ({
  __esModule: true,
  default: {
    passportJwtSecret: () => () => null,
  },
}));

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { ZodValidationPipe } from 'nestjs-zod';

import { DEFAULT_TENANT_ID } from '@confora/shared-kernel';

import { AppModule } from '../src/app.module';
import { KeycloakTokenService } from '../src/auth/keycloak-token.service';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  LEARNER_CERT_WALLET_FORBIDDEN_KEYS,
  LEARNER_CERT_WALLET_PUBLIC_KEYS,
} from '../src/cert-wallet/dto/me-certificates-response.dto';
import {
  PILOT_CERTIFICANT_USER_ID,
  TD_082_CERTIFICATE_UID,
} from '../../../packages/database/prisma/seeds/td-082-pilot-certificant-wallet.ts';

const HS_SECRET = 'td082-wallet-e2e-hs256-secret-min-32-chars!!';
const ISSUER = 'http://keycloak.test/realms/confora';
const KEYCLOAK_SUB_CERTIFICANT = PILOT_CERTIFICANT_USER_ID;
const KEYCLOAK_SUB_OTHER = 'b2000000-0000-4000-8000-000000000001';
const TENANT_B = '00000000-0000-4000-8000-0000000000bb';
const PILOT_CERTIFICANT_EMAIL = 'pilot.learner2@confora.test';

const PRIVATE_FIELD_PATTERN = /tenant|userId|applicationId|pdfStorageKey|withdrawnReason|digitalSignature|@/i;

function certificantToken(overrides: Record<string, unknown> = {}) {
  return jwt.sign(
    {
      sub: KEYCLOAK_SUB_CERTIFICANT,
      preferred_username: PILOT_CERTIFICANT_EMAIL,
      email: PILOT_CERTIFICANT_EMAIL,
      realm_access: { roles: ['USR_CERT'] },
      amr: ['pwd'],
      tenant_id: DEFAULT_TENANT_ID,
      ...overrides,
    },
    HS_SECRET,
    { algorithm: 'HS256', issuer: ISSUER, audience: 'confora-api' },
  );
}

function td082WalletRow() {
  return {
    uid: TD_082_CERTIFICATE_UID,
    type: 'CERTIFICATION',
    status: 'ACTIVE',
    issueDate: new Date('2025-06-01T00:00:00.000Z'),
    expiryDate: new Date('2026-09-01T00:00:00.000Z'),
    scopeText: 'Synthetic pilot person certification fixture (TD-082 local/dev only).',
    qrUrl: null,
    pdfUrl: null,
    scheme: { name: 'Sample certification scheme', revisionSeq: 1 },
  };
}

describe('TD-082 pilot certificant wallet seed (e2e)', () => {
  let app: INestApplication;
  const certificateFindMany = jest.fn();
  const userFindUnique = jest.fn();
  const notificationTemplateFindFirst = jest.fn().mockResolvedValue({ id: 'seed-skip' });

  beforeAll(async () => {
    process.env['DATABASE_URL'] = 'postgresql://mock:mock@127.0.0.1:5432/mock';
    process.env['AUTH_JWT_MODE'] = 'hs256';
    process.env['AUTH_JWT_HS256_SECRET'] = HS_SECRET;
    process.env['KEYCLOAK_ISSUER'] = ISSUER;
    process.env['KEYCLOAK_AUDIENCE'] = 'confora-api';
    process.env['TENANT_ENFORCEMENT'] = 'enforce';
    process.env['AI_GATEWAY_STUB'] = '1';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(KeycloakTokenService)
      .useValue({
        passwordGrant: async () => {
          throw new Error('Keycloak mocked');
        },
        refreshGrant: async () => {
          throw new Error('Keycloak mocked');
        },
      })
      .overrideProvider(PrismaService)
      .useValue({
        db: {
          certificate: { findMany: certificateFindMany },
          user: { findUnique: userFindUnique },
          notificationTemplate: { findFirst: notificationTemplateFindFirst, create: jest.fn() },
          certificationScope: { findMany: jest.fn().mockResolvedValue([]) },
          course: { findMany: jest.fn().mockResolvedValue([]) },
          enrollment: { findMany: jest.fn().mockResolvedValue([]) },
          examSession: { findFirst: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]) },
          lessonProgress: { findMany: jest.fn().mockResolvedValue([]) },
          userInAppNotification: { findMany: jest.fn().mockResolvedValue([]) },
        },
      })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
  });

  beforeEach(() => {
    certificateFindMany.mockReset();
    userFindUnique.mockReset();
    userFindUnique.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      if (where.email === 'learner@confora.test') {
        return Promise.resolve({ id: USER_A, tenantId: DEFAULT_TENANT_ID });
      }
      if (where.id === USER_A) {
        return Promise.resolve({ id: USER_A, tenantId: DEFAULT_TENANT_ID });
      }
      if (where.email === PILOT_CERTIFICANT_EMAIL) {
        return Promise.resolve({ id: PILOT_CERTIFICANT_USER_ID, tenantId: DEFAULT_TENANT_ID });
      }
      if (where.id === PILOT_CERTIFICANT_USER_ID) {
        return Promise.resolve({ id: PILOT_CERTIFICANT_USER_ID, tenantId: DEFAULT_TENANT_ID });
      }
      if (where.id === KEYCLOAK_SUB_OTHER) {
        return Promise.resolve({ id: KEYCLOAK_SUB_OTHER, tenantId: DEFAULT_TENANT_ID });
      }
      return Promise.resolve(null);
    });
  });

  afterAll(async () => {
    await app?.close();
    delete process.env['DATABASE_URL'];
    delete process.env['AUTH_JWT_MODE'];
    delete process.env['AUTH_JWT_HS256_SECRET'];
    delete process.env['KEYCLOAK_ISSUER'];
    delete process.env['KEYCLOAK_AUDIENCE'];
    delete process.env['TENANT_ENFORCEMENT'];
    delete process.env['AI_GATEWAY_STUB'];
  });

  it('GET /v1/me/certificates without auth returns 401', async () => {
    await request(app.getHttpServer()).get('/v1/me/certificates').expect(401);
  });

  it('returns non-empty selector-safe wallet for pilot certificant', async () => {
    certificateFindMany.mockResolvedValue([td082WalletRow()]);

    const res = await request(app.getHttpServer())
      .get('/v1/me/certificates')
      .set('Authorization', `Bearer ${certificantToken()}`)
      .expect(200);

    expect(res.body.items.length).toBeGreaterThan(0);
    const item = res.body.items[0];
    expect(item.certificateId).toBe(TD_082_CERTIFICATE_UID);
    expect(item.schemeTitle).toBe('Sample certification scheme');
    expect(item.recertificationEligible).toBe(true);
    expect(item.cpdEligible).toBe(true);
    expect(item.publicNumber).toBe(TD_082_CERTIFICATE_UID);
    expect(JSON.stringify(res.body)).not.toMatch(PRIVATE_FIELD_PATTERN);
  });

  it('scopes certificate query to authenticated certificant user and tenant', async () => {
    certificateFindMany.mockResolvedValue([td082WalletRow()]);

    await request(app.getHttpServer())
      .get('/v1/me/certificates')
      .set('Authorization', `Bearer ${certificantToken()}`)
      .expect(200);

    expect(certificateFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: DEFAULT_TENANT_ID, userId: PILOT_CERTIFICANT_USER_ID },
      }),
    );
  });

  it('other candidate receives empty wallet when DB has no rows', async () => {
    userFindUnique.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      if (where.email === 'pilot.learner@confora.test') {
        return Promise.resolve({ id: KEYCLOAK_SUB_OTHER });
      }
      if (where.id === KEYCLOAK_SUB_OTHER) {
        return Promise.resolve({ id: KEYCLOAK_SUB_OTHER, tenantId: DEFAULT_TENANT_ID });
      }
      return Promise.resolve(null);
    });
    certificateFindMany.mockResolvedValue([]);

    const token = jwt.sign(
      {
        sub: KEYCLOAK_SUB_OTHER,
        email: 'pilot.learner@confora.test',
        realm_access: { roles: ['USR_CAND'] },
        tenant_id: DEFAULT_TENANT_ID,
      },
      HS_SECRET,
      { algorithm: 'HS256', issuer: ISSUER, audience: 'confora-api' },
    );

    const res = await request(app.getHttpServer())
      .get('/v1/me/certificates')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.items).toEqual([]);
    expect(certificateFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: KEYCLOAK_SUB_OTHER }),
      }),
    );
  });

  it('does not expose forbidden wallet keys', async () => {
    certificateFindMany.mockResolvedValue([td082WalletRow()]);

    const res = await request(app.getHttpServer())
      .get('/v1/me/certificates')
      .set('Authorization', `Bearer ${certificantToken({ tenant_id: TENANT_B })}`)
      .expect(403);
    expect(res.body.items).toBeUndefined();
  });

  it('wrong-tenant JWT returns 403 without wallet leakage', async () => {
    const WRONG_TENANT_ID = '11111111-1111-4111-8111-111111111111';
    userFindUnique.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      if (where.email === 'pilot.wrong-tenant@confora.test') {
        return Promise.resolve({
          id: 'b2000000-0000-4000-8000-000000000004',
          tenantId: DEFAULT_TENANT_ID,
        });
      }
      return Promise.resolve(null);
    });

    const token = jwt.sign(
      {
        sub: 'wrong-tenant-kc-sub',
        email: 'pilot.wrong-tenant@confora.test',
        realm_access: { roles: ['USR_CAND'] },
        tenant_id: WRONG_TENANT_ID,
      },
      HS_SECRET,
      { algorithm: 'HS256', issuer: ISSUER, audience: 'confora-api' },
    );

    const res = await request(app.getHttpServer())
      .get('/v1/me/certificates')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.items).toBeUndefined();
    expect(certificateFindMany).not.toHaveBeenCalled();
  });

  it('public key allowlist holds for seeded item', async () => {
    certificateFindMany.mockResolvedValue([td082WalletRow()]);

    const res = await request(app.getHttpServer())
      .get('/v1/me/certificates')
      .set('Authorization', `Bearer ${certificantToken()}`)
      .expect(200);

    for (const key of LEARNER_CERT_WALLET_FORBIDDEN_KEYS) {
      expect(JSON.stringify(res.body)).not.toContain(`"${key}"`);
    }
    for (const item of res.body.items) {
      for (const key of Object.keys(item)) {
        expect(LEARNER_CERT_WALLET_PUBLIC_KEYS as readonly string[]).toContain(key);
      }
    }
  });
});
