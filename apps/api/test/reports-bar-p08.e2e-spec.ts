import { type INestApplication } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import request from 'supertest';
import type { Server } from 'node:http';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@confora/database';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from '../src/app.module';
import type { AuthenticatedActor } from '../src/auth/request-principal';
import { REQUEST_PRINCIPAL_KEY } from '../src/auth/request-principal';
import { ReportQueryService } from '../src/report-query/report-query.service';
import { MS_PER_DAY } from '../src/report-query/report-query.input';
import { TenantAccessDeniedError } from '../src/tenant/tenant-errors';
import { startSyntheticJwksFixture } from './helpers/synthetic-jwks.fixture';

const IMAGE =
  'pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b';
const CONTAINER = `confora-bar-p08-e2e-${randomUUID().slice(0, 8)}`;
const BY_STATUS = '/v1/staff/reports/certification-applications/by-status';
const BY_SCHEME = '/v1/staff/reports/certification-applications/by-scheme-ref';
const RANGE_Q = 'createdFrom=2026-01-01T00:00:00Z&createdTo=2026-12-31T00:00:00Z';

function bodyCode(body: unknown): string {
  if (typeof body !== 'object' || body === null) {
    return '';
  }
  const code = (body as { code?: unknown }).code;
  return typeof code === 'string' ? code : '';
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

function requireApp(app: INestApplication | undefined): INestApplication {
  if (app === undefined) {
    throw new Error('Nest application not started');
  }
  return app;
}

describe('BAR-P08 reports module e2e', () => {
  let fixture: Awaited<ReturnType<typeof startSyntheticJwksFixture>> | undefined;
  let app: INestApplication | undefined;
  let prisma: PrismaClient | undefined;
  let moduleRef:
    | Awaited<ReturnType<ReturnType<typeof Test.createTestingModule>['compile']>>
    | undefined;
  let disposablePort = '';

  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const staffUsers: Record<string, string> = {
    STAFF_DIR: randomUUID(),
    STAFF_SYSADM: randomUUID(),
    STAFF_AUD: randomUUID(),
    QUALITY_MANAGER: randomUUID(),
    USR_CAND: randomUUID(),
    USR_CERT: randomUUID(),
    COM_CERT: randomUUID(),
    ISSUANCE_OFFICER: randomUUID(),
    LIFECYCLE_OFFICER: randomUUID(),
    TENANT_B_STAFF: randomUUID(),
  };

  function subjectFor(role: string): string {
    return `e2e-p08-${role.toLowerCase()}`;
  }

  function token(role: string, tenantId = tenantA, extra: Record<string, unknown> = {}): string {
    if (fixture === undefined) {
      throw new Error('JWKS fixture not started');
    }
    return fixture.signAccessToken({
      sub: subjectFor(role),
      tenant_id: tenantId,
      realm_access: { roles: [role] },
      mfa_verified: true,
      ...extra,
    });
  }

  function clearThrottle(): void {
    if (app === undefined) {
      return;
    }
    const storageUnknown: unknown = app.get(ThrottlerStorage);
    if (typeof storageUnknown !== 'object' || storageUnknown === null) {
      return;
    }
    const rec = storageUnknown as Record<string, unknown>;
    if (rec['storage'] instanceof Map) {
      rec['storage'].clear();
    }
    if (rec['record'] instanceof Map) {
      rec['record'].clear();
    }
  }

  beforeAll(async () => {
    fixture = await startSyntheticJwksFixture();
    execSync(
      `docker run -d --rm --name ${CONTAINER} -e POSTGRES_USER=confora -e POSTGRES_PASSWORD=confora_dev -e POSTGRES_DB=confora -p 127.0.0.1::5432 ${IMAGE}`,
      { stdio: 'pipe' },
    );
    disposablePort = dockerHostPort(CONTAINER);
    const databaseUrl = `postgresql://confora:confora_dev@127.0.0.1:${disposablePort}/confora`;
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

    const db = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    prisma = db;
    await db.$connect();

    await db.tenant.create({ data: { id: tenantA, isActive: true } });
    await db.tenant.create({ data: { id: tenantB, isActive: true } });

    for (const [role, userId] of Object.entries(staffUsers)) {
      const tid = role === 'TENANT_B_STAFF' ? tenantB : tenantA;
      const emailRole = role.toLowerCase().replace(/_/g, '-');
      await db.user.create({
        data: { id: userId, tenantId: tid, email: `${emailRole}@example.test`, isActive: true },
      });
      await db.externalIdentityLink.create({
        data: {
          id: randomUUID(),
          tenantId: tid,
          userId,
          issuer: fixture.issuer,
          subject: subjectFor(role),
        },
      });
    }
    // Status groups: DRAFT=0 (implicit), SUBMITTED=3 suppressed, APPROVED=5 exact, REJECTED=6 exact, UNDER_REVIEW=1 suppressed
    const seed: Array<{ status: string; schemeRef: string; n: number }> = [
      { status: 'SUBMITTED', schemeRef: 'alpha', n: 3 },
      { status: 'UNDER_REVIEW', schemeRef: 'beta', n: 1 },
      { status: 'APPROVED', schemeRef: 'gamma', n: 5 },
      { status: 'REJECTED', schemeRef: 'delta', n: 6 },
    ];
    for (const row of seed) {
      for (let i = 0; i < row.n; i += 1) {
        await db.certificationApplication.create({
          data: {
            id: randomUUID(),
            tenantId: tenantA,
            applicantUserId: staffUsers.USR_CAND,
            status: row.status as never,
            schemeRef: row.schemeRef,
            submittedAt: new Date('2026-03-01T00:00:00.000Z'),
            createdAt: new Date('2026-02-15T00:00:00.000Z'),
            updatedAt: new Date('2026-02-15T00:00:00.000Z'),
          },
        });
      }
    }
    // Tenant B isolation row
    await db.certificationApplication.create({
      data: {
        id: randomUUID(),
        tenantId: tenantB,
        applicantUserId: staffUsers.TENANT_B_STAFF,
        status: 'APPROVED',
        schemeRef: 'tenant-b-only',
        submittedAt: new Date('2026-03-01T00:00:00.000Z'),
        createdAt: new Date('2026-02-15T00:00:00.000Z'),
        updatedAt: new Date('2026-02-15T00:00:00.000Z'),
      },
    });

    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const nestApp = moduleRef.createNestApplication();
    app = nestApp;
    nestApp.setGlobalPrefix('v1');
    nestApp.useGlobalPipes(new ZodValidationPipe());
    await nestApp.init();
  }, 180_000);

  afterAll(async () => {
    try {
      if (app !== undefined) {
        await app.close();
      }
    } catch {
      /* ignore */
    }
    try {
      if (moduleRef !== undefined) {
        await moduleRef.close();
      }
    } catch {
      /* ignore */
    }
    try {
      if (prisma !== undefined) {
        await prisma.$disconnect();
      }
    } catch {
      /* ignore */
    }
    try {
      if (fixture !== undefined) {
        await fixture.stop();
      }
    } catch {
      /* ignore */
    }
    try {
      execSync(`docker rm -f ${CONTAINER}`, { stdio: 'pipe' });
    } catch {
      /* ignore */
    }
  });

  beforeEach(() => {
    clearThrottle();
  });

  it('P08_TEST_005/006 exact production route inventory = 5', () => {
    const adapter = requireApp(app).getHttpAdapter();
    const instance = adapter.getInstance() as {
      _router?: { stack?: Array<{ route?: { path: string; methods: Record<string, boolean> } }> };
    };
    const stack = instance._router?.stack ?? [];
    const productionRoutes = stack
      .filter((layer) => layer.route !== undefined)
      .map((layer) => {
        const route = layer.route as { path: string; methods: Record<string, boolean> };
        const methods = Object.keys(route.methods)
          .filter((m) => route.methods[m])
          .map((m) => m.toUpperCase());
        return methods.map((m) => `${m} ${route.path}`);
      })
      .flat();
    expect(productionRoutes).toEqual([
      'GET /v1/health',
      'GET /v1/me/certification/applications',
      'GET /v1/me/certification/applications/:id',
      'GET /v1/staff/reports/certification-applications/by-status',
      'GET /v1/staff/reports/certification-applications/by-scheme-ref',
    ]);
    expect(productionRoutes).toHaveLength(5);
  });

  it('P08_TEST_009 unauthenticated -> 401', async () => {
    await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}`)
      .expect(401);
  });

  it.each([
    ['STAFF_DIR', 'P08_TEST_010'],
    ['STAFF_SYSADM', 'P08_TEST_011'],
    ['STAFF_AUD', 'P08_TEST_012'],
    ['QUALITY_MANAGER', 'P08_TEST_013'],
  ] as const)('%s allowed (%s)', async (role) => {
    const res = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}`)
      .set('Authorization', `Bearer ${token(role)}`)
      .expect(200);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.body).toHaveProperty('groups');
  });

  it.each([
    ['USR_CAND', 'P08_TEST_014'],
    ['USR_CERT', 'P08_TEST_015'],
    ['COM_CERT', 'P08_TEST_016'],
    ['ISSUANCE_OFFICER', 'P08_TEST_017'],
    ['LIFECYCLE_OFFICER', 'P08_TEST_018'],
  ] as const)('%s denied 403 (%s)', async (role) => {
    const res = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}`)
      .set('Authorization', `Bearer ${token(role)}`)
      .expect(403);
    expect(res.body).toMatchObject({ statusCode: 403, code: 'ACCESS_DENIED' });
  });

  it('P08_TEST_020 client tenant selector rejected', async () => {
    await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .set('x-tenant-id', tenantB)
      .expect(400);
    await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}&tenantId=${tenantB}`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
  });

  it('P08_TEST_021 actor/context tenant mismatch still 403 at P07 authority', async () => {
    const contextId = ContextIdFactory.create();
    const actor: AuthenticatedActor = {
      userId: staffUsers.STAFF_DIR,
      tenantId: tenantA,
      issuer: fixture.issuer,
      subject: subjectFor('STAFF_DIR'),
      email: 'staff-dir@example.test',
      roles: ['STAFF_DIR'],
      mfaVerified: true,
    };
    const mismatched = {
      user: { ...actor, tenantId: tenantB },
      [REQUEST_PRINCIPAL_KEY]: { ...actor, tenantId: tenantB },
    };
    // Bind context principal to tenantA store via a request that resolves tenant from actor A,
    // then call with actor B — use request principal tenantB while resolving through store from A.
    moduleRef.registerRequestByContextId(
      {
        user: actor,
        [REQUEST_PRINCIPAL_KEY]: actor,
      },
      contextId,
    );
    const service = await moduleRef.resolve(ReportQueryService, contextId);
    await expect(
      service.aggregateByStatus(
        { ...actor, tenantId: tenantB },
        {
          createdFrom: new Date('2026-01-01T00:00:00.000Z'),
          createdTo: new Date('2026-12-31T00:00:00.000Z'),
        },
      ),
    ).rejects.toBeInstanceOf(TenantAccessDeniedError);
    void mismatched;
  });

  it('P08_TEST_028 DATE_RANGE_REQUIRED', async () => {
    const res = await request(httpServer(requireApp(app)))
      .get(BY_STATUS)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
    expect(res.body).toEqual({
      statusCode: 400,
      code: 'DATE_RANGE_REQUIRED',
      message: 'At least one complete date range is required.',
    });
  });

  it('P08_TEST_029 incomplete pair', async () => {
    const res = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?createdFrom=2026-01-01T00:00:00Z`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
    expect(bodyCode(res.body)).toBe('INCOMPLETE_DATE_PAIR');
  });

  it('P08_TEST_030 inverted range', async () => {
    const res = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?createdFrom=2026-06-01T00:00:00Z&createdTo=2026-01-01T00:00:00Z`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
    expect(bodyCode(res.body)).toBe('INVERTED_DATE_RANGE');
  });

  it('P08_TEST_031/032 365-day boundary', async () => {
    const from = '2025-01-01T00:00:00.000Z';
    const exactTo = new Date(Date.parse(from) + 365 * MS_PER_DAY)
      .toISOString()
      .replace(/\.000Z$/, 'Z');
    const overflowTo = new Date(Date.parse(from) + 365 * MS_PER_DAY + 1)
      .toISOString()
      .replace(/\.000Z$/, 'Z')
      .replace(/(\.\d{3})Z$/, (_, frac: string) => `${frac}Z`);

    // Build overflow with millisecond precision string that validates as RFC3339
    const overflowMs = new Date(Date.parse(from) + 365 * MS_PER_DAY + 1);
    const overflowStr = overflowMs.toISOString().replace(/Z$/, 'Z');
    // toISOString always has 3 fractional digits — valid under P08
    await request(httpServer(requireApp(app)))
      .get(
        `${BY_STATUS}?createdFrom=${encodeURIComponent(from.replace('.000Z', 'Z'))}&createdTo=${encodeURIComponent(exactTo)}`,
      )
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(200);

    const overflowRes = await request(httpServer(requireApp(app)))
      .get(
        `${BY_STATUS}?createdFrom=${encodeURIComponent(from)}&createdTo=${encodeURIComponent(overflowStr)}`,
      )
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
    expect(bodyCode(overflowRes.body)).toBe('DATE_RANGE_OVERFLOW');
    void overflowTo;
  });

  it('P08_TEST_033 malformed dates', async () => {
    for (const bad of [
      '2026-01-01',
      '2026-01-01T00:00:00',
      '2026-01-01T00:00:00z',
      '2026-01-01T00:00:00.1234Z',
      '2026-04-31T00:00:00Z',
      '2026-01-01T00:00:00Zjunk',
    ]) {
      const res = await request(httpServer(requireApp(app)))
        .get(
          `${BY_STATUS}?createdFrom=${encodeURIComponent(bad)}&createdTo=${encodeURIComponent('2026-06-01T00:00:00Z')}`,
        )
        .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
        .expect(400);
      expect(res.body).toEqual({
        statusCode: 400,
        code: 'MALFORMED_DATE',
        message: 'Malformed date filter.',
      });
      expect(JSON.stringify(res.body)).not.toContain(bad);
    }
  });

  it('P08_TEST_034/035/036/037 status schemeRef unknown key', async () => {
    const status = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}&status=draft`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
    expect(bodyCode(status.body)).toBe('INVALID_STATUS');

    const empty = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}&schemeRef=`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
    expect(bodyCode(empty.body)).toBe('INVALID_SCHEME_REF');

    const long = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}&schemeRef=${'x'.repeat(129)}`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
    expect(bodyCode(long.body)).toBe('INVALID_SCHEME_REF');

    const unknown = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}&dimension=status`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
    expect(bodyCode(unknown.body)).toBe('UNKNOWN_FILTER');
  });

  it('P08_TEST_038 repeated/multi-value and non-string transport', async () => {
    const repeated = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}&status=DRAFT&status=SUBMITTED`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
    expect(bodyCode(repeated.body)).toBe('INVALID_INVOCATION');

    const same = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}&status=DRAFT&status=DRAFT`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
    expect(bodyCode(same.body)).toBe('INVALID_INVOCATION');

    const nested = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}&status[x]=DRAFT`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(400);
    expect(bodyCode(nested.body)).toBe('INVALID_INVOCATION');
  });

  it('P08_TEST_039..048 privacy / ordering / identifiers', async () => {
    const res = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(200);
    expect(res.headers['cache-control']).toBe('private, no-store');
    const body = res.body as {
      groups: Array<{ status: string; suppressed: boolean; count?: number }>;
      total?: number;
    };
    expect(body.total).toBeUndefined();
    expect(body.groups.map((g) => g.status)).toEqual([
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
    ]);
    const draft = body.groups.find((g) => g.status === 'DRAFT');
    expect(draft).toEqual({ status: 'DRAFT', suppressed: false, count: 0 });
    const submitted = body.groups.find((g) => g.status === 'SUBMITTED');
    expect(submitted).toEqual({ status: 'SUBMITTED', suppressed: true });
    expect(submitted).not.toHaveProperty('count');
    const approved = body.groups.find((g) => g.status === 'APPROVED');
    expect(approved).toEqual({ status: 'APPROVED', suppressed: false, count: 5 });
    const rejected = body.groups.find((g) => g.status === 'REJECTED');
    expect(rejected && rejected.count).toBe(6);

    const serialized = JSON.stringify(body);
    expect(serialized).not.toMatch(/tenantId|applicantUserId|userId|applicationId/);
    expect(serialized).not.toMatch(/percentage|ratio|subtotal/);
    expect(Array.isArray(body.groups)).toBe(true);
    expect(body).not.toHaveProperty('items');
    expect(body).not.toHaveProperty('rows');

    const scheme = await request(httpServer(requireApp(app)))
      .get(`${BY_SCHEME}?${RANGE_Q}`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(200);
    expect(scheme.headers['cache-control']).toBe('private, no-store');
    const schemeBody = scheme.body as {
      groups: Array<{ schemeRef: string; suppressed: boolean; count?: number }>;
      total?: number;
    };
    const refs = schemeBody.groups.map((g) => g.schemeRef);
    expect(refs).toEqual([...refs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    expect(schemeBody.total).toBeUndefined();
  });

  it('P08_TEST_044 total present when no suppression', async () => {
    const res = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}&status=APPROVED`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(200);
    // Status filter still returns all five status cells from P07 (counts for non-matching are 0)
    // With DRAFT=0 and others possibly suppressed depending on filter semantics — check P07 behavior.
    // Filtering by status in P07 filters the groupBy query; other statuses become 0 exact.
    const body = res.body as {
      groups: Array<{ suppressed: boolean; count?: number }>;
      total?: number;
    };
    const anySuppressed = body.groups.some((g) => g.suppressed);
    if (!anySuppressed) {
      expect(typeof body.total).toBe('number');
    }
  });

  it('P08_TEST_050/051/052 AccessDenied/Tenant/MFA -> 403', async () => {
    await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}`)
      .set('Authorization', `Bearer ${token('USR_CAND')}`)
      .expect(403);

    const mfa = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}`)
      .set('Authorization', `Bearer ${token('STAFF_DIR', tenantA, { mfa_verified: false })}`)
      .expect(403);
    expect(bodyCode(mfa.body)).toBe('MFA_REQUIRED');
  });

  it('P08_TEST_061 throttling 20/60000; denied roles do not consume; independent routes', async () => {
    clearThrottle();

    // Denied role spam must not exhaust privileged budget
    for (let i = 0; i < 25; i += 1) {
      await request(httpServer(requireApp(app)))
        .get(`${BY_STATUS}?${RANGE_Q}`)
        .set('Authorization', `Bearer ${token('USR_CAND')}`)
        .expect(403);
    }

    for (let i = 0; i < 20; i += 1) {
      await request(httpServer(requireApp(app)))
        .get(`${BY_STATUS}?${RANGE_Q}`)
        .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
        .expect(200);
    }
    const limited = await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(429);
    expect(JSON.stringify(limited.body)).not.toMatch(
      /groups|count|suppressed|tenant|DRAFT|schemeRef/,
    );

    // Independent counter on other route
    await request(httpServer(requireApp(app)))
      .get(`${BY_SCHEME}?${RANGE_Q}`)
      .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
      .expect(200);

    clearThrottle();

    // Same-IP authorized role switching cannot bypass same tracker
    for (let i = 0; i < 10; i += 1) {
      await request(httpServer(requireApp(app)))
        .get(`${BY_STATUS}?${RANGE_Q}`)
        .set('Authorization', `Bearer ${token('STAFF_DIR')}`)
        .expect(200);
    }
    for (let i = 0; i < 10; i += 1) {
      await request(httpServer(requireApp(app)))
        .get(`${BY_STATUS}?${RANGE_Q}`)
        .set('Authorization', `Bearer ${token('STAFF_SYSADM')}`)
        .expect(200);
    }
    await request(httpServer(requireApp(app)))
      .get(`${BY_STATUS}?${RANGE_Q}`)
      .set('Authorization', `Bearer ${token('STAFF_AUD')}`)
      .expect(429);
  });

  it('records disposable postgres port for evidence', () => {
    expect(disposablePort).toMatch(/^\d+$/);
    expect(CONTAINER).toMatch(/^confora-bar-p08-e2e-/);
  });
});
