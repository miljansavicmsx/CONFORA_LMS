import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Server } from 'node:http';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { PrismaClient, type CertificationApplicationStatus } from '@confora/database';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from '../src/app.module';
import { startSyntheticJwksFixture } from './helpers/synthetic-jwks.fixture';

const IMAGE =
  'pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b';
const CONTAINER = `confora-bar-p06-e2e-${randomUUID().slice(0, 8)}`;
const NOT_FOUND = 'Certification application not found.';
const RESPONSE_KEYS = ['id', 'status', 'schemeRef', 'submittedAt', 'createdAt', 'updatedAt'];

interface ApplicationItem {
  id: string;
  status: string;
  schemeRef: string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ListResponseBody {
  items: ApplicationItem[];
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface ErrorResponseBody {
  statusCode?: number;
  code?: string;
  message?: string;
}

function asListBody(body: unknown): ListResponseBody {
  return body as ListResponseBody;
}

function asItemBody(body: unknown): ApplicationItem {
  return body as ApplicationItem;
}

function asErrorBody(body: unknown): ErrorResponseBody {
  return body as ErrorResponseBody;
}

function repoRoot(): string {
  const cwd = process.cwd();
  return cwd.replace(/[\\/]apps[\\/]api$/, '');
}

function dockerHostPort(container: string): string {
  const raw = execSync(`docker port ${container} 5432`, { encoding: 'utf8' }).trim();
  const match = raw.match(/:(\d+)\s*$/);
  if (!match) throw new Error(`Unable to parse docker port mapping: ${raw}`);
  return match[1];
}

function httpServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

describe('BAR-P06 certification applications e2e', () => {
  let fixture: Awaited<ReturnType<typeof startSyntheticJwksFixture>>;
  let app: INestApplication;
  let prisma: PrismaClient;

  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const userA = randomUUID();
  const userB = randomUUID();
  const userC = randomUUID();
  const staffUser = randomUUID();
  const subjectA = 'e2e-p06-learner-a';
  const subjectB = 'e2e-p06-learner-b';
  const subjectC = 'e2e-p06-learner-c';
  const subjectStaff = 'e2e-p06-staff';

  const ownIds: Record<string, string> = {};
  let otherUserAppId = '';
  let otherTenantAppId = '';
  const absentId = randomUUID();
  const tieTime = new Date('2026-01-15T12:00:00.000Z');

  function fixtureId(key: string): string {
    const id = ownIds[key];
    if (!id) {
      throw new Error(`Missing fixture application id for key: ${key}`);
    }
    return id;
  }

  beforeAll(async () => {
    fixture = await startSyntheticJwksFixture();
    execSync(
      `docker run -d --rm --name ${CONTAINER} -e POSTGRES_USER=confora -e POSTGRES_PASSWORD=confora_dev -e POSTGRES_DB=confora -p 127.0.0.1::5432 ${IMAGE}`,
      { stdio: 'pipe' },
    );
    const hostPort = dockerHostPort(CONTAINER);
    const databaseUrl = `postgresql://confora:confora_dev@127.0.0.1:${hostPort}/confora`;
    process.env['DATABASE_URL'] = databaseUrl;
    process.env['OIDC_ISSUER_URL'] = fixture.issuer;
    process.env['OIDC_CLIENT_ID'] = fixture.audience;

    for (let i = 0; i < 40; i += 1) {
      try {
        execSync(`docker exec ${CONTAINER} pg_isready -U confora -d confora`, { stdio: 'pipe' });
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    execSync('corepack pnpm@9.14.2 --filter @confora/database run db:migrate:deploy', {
      cwd: repoRoot(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });

    prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    await prisma.$connect();

    await prisma.tenant.create({ data: { id: tenantA, isActive: true } });
    await prisma.tenant.create({ data: { id: tenantB, isActive: true } });
    await prisma.user.create({
      data: { id: userA, tenantId: tenantA, email: 'a@example.test', isActive: true },
    });
    await prisma.user.create({
      data: { id: userB, tenantId: tenantA, email: 'b@example.test', isActive: true },
    });
    await prisma.user.create({
      data: { id: userC, tenantId: tenantB, email: 'c@example.test', isActive: true },
    });
    await prisma.user.create({
      data: { id: staffUser, tenantId: tenantA, email: 'staff@example.test', isActive: true },
    });
    for (const [userId, subject] of [
      [userA, subjectA],
      [userB, subjectB],
      [userC, subjectC],
      [staffUser, subjectStaff],
    ] as const) {
      await prisma.externalIdentityLink.create({
        data: {
          id: randomUUID(),
          tenantId: userId === userC ? tenantB : tenantA,
          userId,
          issuer: fixture.issuer,
          subject,
        },
      });
    }

    const statuses = [
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
    ] as const satisfies readonly CertificationApplicationStatus[];
    for (const status of statuses) {
      const id = randomUUID();
      ownIds[status] = id;
      await prisma.certificationApplication.create({
        data: {
          id,
          tenantId: tenantA,
          applicantUserId: userA,
          status,
          schemeRef: `scheme-${status.toLowerCase()}`,
          submittedAt: status === 'DRAFT' ? null : new Date('2026-02-01T00:00:00.000Z'),
          createdAt: new Date(
            `2026-02-${String(statuses.indexOf(status) + 1).padStart(2, '0')}T00:00:00.000Z`,
          ),
        },
      });
    }

    otherUserAppId = randomUUID();
    await prisma.certificationApplication.create({
      data: {
        id: otherUserAppId,
        tenantId: tenantA,
        applicantUserId: userB,
        status: 'SUBMITTED',
        schemeRef: 'scheme-other-user',
      },
    });

    otherTenantAppId = randomUUID();
    await prisma.certificationApplication.create({
      data: {
        id: otherTenantAppId,
        tenantId: tenantB,
        applicantUserId: userC,
        status: 'SUBMITTED',
        schemeRef: 'scheme-other-tenant',
      },
    });

    const tieId1 = randomUUID();
    const tieId2 = randomUUID();
    ownIds['TIE1'] = tieId1;
    ownIds['TIE2'] = tieId2;
    await prisma.certificationApplication.create({
      data: {
        id: tieId1,
        tenantId: tenantA,
        applicantUserId: userA,
        status: 'DRAFT',
        schemeRef: 'tie-a',
        createdAt: tieTime,
      },
    });
    await prisma.certificationApplication.create({
      data: {
        id: tieId2,
        tenantId: tenantA,
        applicantUserId: userA,
        status: 'DRAFT',
        schemeRef: 'tie-b',
        createdAt: tieTime,
      },
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
  }, 180_000);

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    try {
      await fixture.stop();
    } catch {
      /* ignore */
    }
    try {
      execSync(`docker rm -f ${CONTAINER}`, { stdio: 'pipe' });
    } catch {
      /* ignore */
    }
  });

  function token(
    subject: string,
    tenantId: string,
    roles: string[],
    extra: Record<string, unknown> = {},
  ): string {
    return fixture.signAccessToken({
      sub: subject,
      tenant_id: tenantId,
      realm_access: { roles },
      ...extra,
    });
  }

  it('P06_TEST_013 unauthenticated denied', async () => {
    await request(httpServer(app)).get('/v1/me/certification/applications').expect(401);
  });

  it('P06_TEST_014 invalid token denied', async () => {
    await request(httpServer(app))
      .get('/v1/me/certification/applications')
      .set('Authorization', 'Bearer not-a-jwt')
      .expect(401);
  });

  it('P06_TEST_015 USR_CAND allowed', async () => {
    await request(httpServer(app))
      .get('/v1/me/certification/applications')
      .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
      .expect(200);
  });

  it('P06_TEST_016 USR_CERT allowed', async () => {
    await request(httpServer(app))
      .get('/v1/me/certification/applications')
      .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CERT'])}`)
      .expect(200);
  });

  it('P06_TEST_017 staff-only actor denied', async () => {
    const res = await request(httpServer(app))
      .get('/v1/me/certification/applications')
      .set(
        'Authorization',
        `Bearer ${token(subjectStaff, tenantA, ['STAFF_DIR'], { mfa_verified: true })}`,
      )
      .expect(403);
    expect(res.body).toMatchObject({ code: 'ACCESS_DENIED' });
  });

  it('P06_TEST_018 inactive tenant denied', async () => {
    await prisma.tenant.update({ where: { id: tenantA }, data: { isActive: false } });
    const res = await request(httpServer(app))
      .get('/v1/me/certification/applications')
      .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
      .expect(403);
    expect(res.body).toMatchObject({ code: 'ACCESS_DENIED' });
    await prisma.tenant.update({ where: { id: tenantA }, data: { isActive: true } });
  });

  it('P06_TEST_019 inactive user denied', async () => {
    await prisma.user.update({ where: { id: userA }, data: { isActive: false } });
    const res = await request(httpServer(app))
      .get('/v1/me/certification/applications')
      .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
      .expect(403);
    expect(res.body).toMatchObject({ code: 'ACCESS_DENIED' });
    await prisma.user.update({ where: { id: userA }, data: { isActive: true } });
  });

  it('P06_TEST_020 client tenant selector denied', async () => {
    const res = await request(httpServer(app))
      .get('/v1/me/certification/applications')
      .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
      .set('x-tenant-id', tenantB)
      .expect(400);
    expect(res.body).toMatchObject({ code: 'CLIENT_TENANT_CONTEXT_FORBIDDEN' });
  });

  it('P06_TEST_021 client applicant selector denied', async () => {
    await request(httpServer(app))
      .get('/v1/me/certification/applications')
      .query({ applicantUserId: userB })
      .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
      .expect(400);
  });

  describe('BAR-P06 Phase B disposable runtime read', () => {
    it('P06_TEST_022 empty list for actor with no applications', async () => {
      const emptyTenant = randomUUID();
      const emptyUser = randomUUID();
      const emptySubject = 'e2e-p06-empty';
      await prisma.tenant.create({ data: { id: emptyTenant, isActive: true } });
      await prisma.user.create({
        data: {
          id: emptyUser,
          tenantId: emptyTenant,
          email: 'empty@example.test',
          isActive: true,
        },
      });
      await prisma.externalIdentityLink.create({
        data: {
          id: randomUUID(),
          tenantId: emptyTenant,
          userId: emptyUser,
          issuer: fixture.issuer,
          subject: emptySubject,
        },
      });
      const res = await request(httpServer(app))
        .get('/v1/me/certification/applications')
        .set('Authorization', `Bearer ${token(emptySubject, emptyTenant, ['USR_CAND'])}`)
        .expect(200);
      const body = asListBody(res.body);
      expect(body.items).toEqual([]);
    });

    it('P06_TEST_023 default limit 50', async () => {
      const res = await request(httpServer(app))
        .get('/v1/me/certification/applications')
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      expect(asListBody(res.body).limit).toBe(50);
    });

    it('P06_TEST_030 default offset 0', async () => {
      const res = await request(httpServer(app))
        .get('/v1/me/certification/applications')
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      expect(asListBody(res.body).offset).toBe(0);
    });

    it('P06_TEST_031 valid positive offset', async () => {
      const res = await request(httpServer(app))
        .get('/v1/me/certification/applications')
        .query({ offset: 1, limit: 2 })
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      const body = asListBody(res.body);
      expect(body.offset).toBe(1);
      expect(body.items.length).toBeLessThanOrEqual(2);
    });

    it('P06_TEST_038 createdAt DESC ordering', async () => {
      const res = await request(httpServer(app))
        .get('/v1/me/certification/applications')
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      const dates = asListBody(res.body).items.map((item) => item.createdAt);
      const sorted = [...dates].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
      expect(dates).toEqual(sorted);
    });

    it('P06_TEST_039 id DESC tie-break when createdAt equal', async () => {
      const res = await request(httpServer(app))
        .get('/v1/me/certification/applications')
        .query({ status: 'DRAFT' })
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      const tieItems = asListBody(res.body).items.filter(
        (item) => item.id === fixtureId('TIE1') || item.id === fixtureId('TIE2'),
      );
      if (tieItems.length === 2) {
        const first = tieItems[0];
        const second = tieItems[1];
        if (first && second) {
          expect(first.id > second.id).toBe(true);
        }
      }
    });

    it('P06_TEST_040 no totalCount in response', async () => {
      const res = await request(httpServer(app))
        .get('/v1/me/certification/applications')
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      expect(res.body).not.toHaveProperty('totalCount');
    });

    it('P06_TEST_043 only actor-owned records in list', async () => {
      const res = await request(httpServer(app))
        .get('/v1/me/certification/applications')
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      const ids = asListBody(res.body).items.map((item) => item.id);
      expect(ids).not.toContain(otherUserAppId);
    });

    it('P06_TEST_044 only actor-tenant records in list', async () => {
      const res = await request(httpServer(app))
        .get('/v1/me/certification/applications')
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      const ids = asListBody(res.body).items.map((item) => item.id);
      expect(ids).not.toContain(otherTenantAppId);
    });

    it('P06_TEST_045 own detail returns 200', async () => {
      await request(httpServer(app))
        .get(`/v1/me/certification/applications/${fixtureId('APPROVED')}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
    });

    it('P06_TEST_046 exact six-field projection', async () => {
      const res = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${fixtureId('APPROVED')}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      expect(Object.keys(asItemBody(res.body)).sort()).toEqual([...RESPONSE_KEYS].sort());
    });

    it('P06_TEST_047 invalid UUID returns 400', async () => {
      await request(httpServer(app))
        .get('/v1/me/certification/applications/not-a-uuid')
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(400);
    });

    it('P06_TEST_048 absent UUID returns 404', async () => {
      const res = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${absentId}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(404);
      expect(asErrorBody(res.body).message).toBe(NOT_FOUND);
    });

    it('P06_TEST_049 same-tenant other user returns 404', async () => {
      const res = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${otherUserAppId}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(404);
      expect(asErrorBody(res.body).message).toBe(NOT_FOUND);
    });

    it('P06_TEST_050 other-tenant returns 404', async () => {
      const res = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${otherTenantAppId}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(404);
      expect(asErrorBody(res.body).message).toBe(NOT_FOUND);
    });

    it('P06_TEST_051 foreign 404 bodies materially indistinguishable', async () => {
      const absent = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${absentId}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(404);
      const otherUser = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${otherUserAppId}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(404);
      const otherTenant = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${otherTenantAppId}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(404);
      expect(absent.body).toEqual(otherUser.body);
      expect(absent.body).toEqual(otherTenant.body);
    });

    it('P06_TEST_052 no tenantId in response', async () => {
      const res = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${fixtureId('APPROVED')}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      const item = asItemBody(res.body);
      expect(item).not.toHaveProperty('tenantId');
    });

    it('P06_TEST_053 no applicantUserId in response', async () => {
      const res = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${fixtureId('APPROVED')}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      const item = asItemBody(res.body);
      expect(item).not.toHaveProperty('applicantUserId');
    });

    it('P06_TEST_054 no auth identity fields in response', async () => {
      const res = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${fixtureId('APPROVED')}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      const item = asItemBody(res.body);
      for (const key of ['email', 'issuer', 'subject', 'roles', 'mfaVerified']) {
        expect(item).not.toHaveProperty(key);
      }
    });

    it('P06_TEST_055 no workflow reviewer internals in response', async () => {
      const res = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${fixtureId('APPROVED')}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      const item = asItemBody(res.body);
      for (const key of ['reviewer', 'committee', 'eligibility', 'workflow']) {
        expect(item).not.toHaveProperty(key);
      }
    });

    it('P06_TEST_056 no audit metadata in response', async () => {
      const res = await request(httpServer(app))
        .get(`/v1/me/certification/applications/${fixtureId('APPROVED')}`)
        .set('Authorization', `Bearer ${token(subjectA, tenantA, ['USR_CAND'])}`)
        .expect(200);
      const item = asItemBody(res.body);
      for (const key of ['audit', 'hash', 'metadata', 'storageKey']) {
        expect(item).not.toHaveProperty(key);
      }
    });
  });
});
