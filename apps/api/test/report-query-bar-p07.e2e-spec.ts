import { type INestApplication } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@confora/database';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from '../src/app.module';
import type { AuthenticatedActor } from '../src/auth/request-principal';
import { REQUEST_PRINCIPAL_KEY } from '../src/auth/request-principal';
import { ReportQueryService } from '../src/report-query/report-query.service';
import { MS_PER_DAY } from '../src/report-query/report-query.input';
import { startSyntheticJwksFixture } from './helpers/synthetic-jwks.fixture';

type AppStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

const IMAGE =
  'pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b';
const CONTAINER = `confora-bar-p07-e2e-${randomUUID().slice(0, 8)}`;

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

describe('BAR-P07 report-query e2e', () => {
  let fixture: Awaited<ReturnType<typeof startSyntheticJwksFixture>>;
  let app: INestApplication;
  let prisma: PrismaClient;
  let moduleRef: Awaited<ReturnType<ReturnType<typeof Test.createTestingModule>['compile']>>;

  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const staffUser = randomUUID();
  const learnerUser = randomUUID();
  const otherTenantUser = randomUUID();
  const subjectStaff = 'e2e-p07-staff';
  const subjectLearner = 'e2e-p07-learner';

  const rangeFrom = new Date('2026-01-01T00:00:00.000Z');
  const rangeTo = new Date('2026-06-01T00:00:00.000Z');

  async function resolveService(actor: AuthenticatedActor): Promise<ReportQueryService> {
    const contextId = ContextIdFactory.create();
    const request = {
      user: actor,
      [REQUEST_PRINCIPAL_KEY]: actor,
    };
    moduleRef.registerRequestByContextId(request, contextId);
    return moduleRef.resolve(ReportQueryService, contextId);
  }

  function staffActor(): AuthenticatedActor {
    return {
      userId: staffUser,
      tenantId: tenantA,
      issuer: fixture.issuer,
      subject: subjectStaff,
      email: 'staff@example.test',
      roles: ['STAFF_DIR'],
      mfaVerified: true,
    };
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
      data: { id: staffUser, tenantId: tenantA, email: 'staff@example.test', isActive: true },
    });
    await prisma.user.create({
      data: { id: learnerUser, tenantId: tenantA, email: 'learner@example.test', isActive: true },
    });
    await prisma.user.create({
      data: {
        id: otherTenantUser,
        tenantId: tenantB,
        email: 'other@example.test',
        isActive: true,
      },
    });
    for (const [userId, subject, tid] of [
      [staffUser, subjectStaff, tenantA],
      [learnerUser, subjectLearner, tenantA],
      [otherTenantUser, 'e2e-p07-other', tenantB],
    ] as const) {
      await prisma.externalIdentityLink.create({
        data: {
          id: randomUUID(),
          tenantId: tid,
          userId,
          issuer: fixture.issuer,
          subject,
        },
      });
    }

    // Tenant A fixtures for status counts: DRAFT=0 (omit), SUBMITTED=1, UNDER_REVIEW=4, APPROVED=5, REJECTED=6
    // scheme alpha: 5, scheme beta: 1, plus cross-tenant noise
    const mk = async (
      status: AppStatus,
      schemeRef: string,
      createdAt: Date,
      submittedAt: Date | null,
      tid: string,
      uid: string,
    ): Promise<void> => {
      await prisma.certificationApplication.create({
        data: {
          id: randomUUID(),
          tenantId: tid,
          applicantUserId: uid,
          status,
          schemeRef,
          submittedAt,
          createdAt,
        },
      });
    };

    await mk(
      'SUBMITTED',
      'alpha',
      new Date('2026-02-01T00:00:00.000Z'),
      new Date('2026-02-02T00:00:00.000Z'),
      tenantA,
      learnerUser,
    );
    for (let i = 0; i < 4; i += 1) {
      await mk(
        'UNDER_REVIEW',
        'alpha',
        new Date('2026-02-03T00:00:00.000Z'),
        new Date('2026-02-04T00:00:00.000Z'),
        tenantA,
        learnerUser,
      );
    }
    for (let i = 0; i < 5; i += 1) {
      await mk(
        'APPROVED',
        'alpha',
        new Date('2026-02-05T00:00:00.000Z'),
        new Date('2026-02-06T00:00:00.000Z'),
        tenantA,
        learnerUser,
      );
    }
    for (let i = 0; i < 6; i += 1) {
      await mk(
        'REJECTED',
        i === 0 ? 'beta' : 'alpha',
        new Date('2026-02-07T00:00:00.000Z'),
        i === 5 ? null : new Date('2026-02-08T00:00:00.000Z'),
        tenantA,
        learnerUser,
      );
    }
    // Boundary inclusivity rows
    await mk('APPROVED', 'gamma', rangeFrom, rangeFrom, tenantA, learnerUser);
    await mk('APPROVED', 'gamma', rangeTo, rangeTo, tenantA, learnerUser);
    // Tenant B noise
    for (let i = 0; i < 10; i += 1) {
      await mk(
        'APPROVED',
        'alpha',
        new Date('2026-02-05T00:00:00.000Z'),
        new Date('2026-02-06T00:00:00.000Z'),
        tenantB,
        otherTenantUser,
      );
    }

    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
  }, 180_000);

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    try {
      execSync(`docker rm -f ${CONTAINER}`, { stdio: 'pipe' });
    } catch {
      /* ignore */
    }
    await fixture.stop();
  });

  it('P07_TEST_029 Tenant A aggregates never contain Tenant B data', async () => {
    const service = await resolveService(staffActor());
    const result = await service.aggregateByStatus(staffActor(), {
      createdFrom: rangeFrom,
      createdTo: rangeTo,
    });
    // Tenant A APPROVED = 5 alpha + 2 gamma boundary = 7. Tenant B has 10 APPROVED noise.
    const approved = result.groups.find((g) => g.status === 'APPROVED');
    expect(approved).toEqual({ status: 'APPROVED', suppressed: false, count: 7 });
  });

  it('P07_TEST_037 status aggregation works over synthetic multi-status fixture', async () => {
    const service = await resolveService(staffActor());
    const result = await service.aggregateByStatus(staffActor(), {
      createdFrom: rangeFrom,
      createdTo: rangeTo,
    });
    expect(result.groups).toHaveLength(5);
    const draft = result.groups.find((g) => g.status === 'DRAFT');
    expect(draft).toEqual({ status: 'DRAFT', suppressed: false, count: 0 });
    const submitted = result.groups.find((g) => g.status === 'SUBMITTED');
    expect(submitted).toEqual({ status: 'SUBMITTED', suppressed: true });
    const under = result.groups.find((g) => g.status === 'UNDER_REVIEW');
    expect(under).toEqual({ status: 'UNDER_REVIEW', suppressed: true });
  });

  it('P07_TEST_038 schemeRef aggregation works over at least two schemes', async () => {
    const service = await resolveService(staffActor());
    const result = await service.aggregateBySchemeRef(staffActor(), {
      createdFrom: rangeFrom,
      createdTo: rangeTo,
    });
    const refs = result.groups.map((g) => g.schemeRef);
    expect(refs).toEqual([...refs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    expect(refs.length).toBeGreaterThanOrEqual(2);
  });

  it('P07_TEST_041 valid exact schemeRef filter', async () => {
    const service = await resolveService(staffActor());
    const result = await service.aggregateBySchemeRef(staffActor(), {
      createdFrom: rangeFrom,
      createdTo: rangeTo,
      schemeRef: 'beta',
    });
    expect(result.groups.every((g) => g.schemeRef === 'beta')).toBe(true);
  });

  it('P07_TEST_049 valid createdFrom + createdTo accepted', async () => {
    const service = await resolveService(staffActor());
    await expect(
      service.aggregateByStatus(staffActor(), { createdFrom: rangeFrom, createdTo: rangeTo }),
    ).resolves.toBeDefined();
  });

  it('P07_TEST_050 valid submittedFrom + submittedTo accepted', async () => {
    const service = await resolveService(staffActor());
    await expect(
      service.aggregateByStatus(staffActor(), {
        submittedFrom: rangeFrom,
        submittedTo: rangeTo,
      }),
    ).resolves.toBeDefined();
  });

  it('P07_TEST_059 created and submitted ranges intersect using AND', async () => {
    const service = await resolveService(staffActor());
    const result = await service.aggregateByStatus(staffActor(), {
      createdFrom: rangeFrom,
      createdTo: rangeTo,
      submittedFrom: new Date('2099-01-01T00:00:00.000Z'),
      submittedTo: new Date('2099-01-02T00:00:00.000Z'),
    });
    expect(result.groups.every((g) => !g.suppressed && g.count === 0)).toBe(true);
  });

  it('P07_TEST_060 null submittedAt excluded from submitted range', async () => {
    const service = await resolveService(staffActor());
    const withSubmitted = await service.aggregateByStatus(staffActor(), {
      submittedFrom: rangeFrom,
      submittedTo: rangeTo,
    });
    const rejected = withSubmitted.groups.find((g) => g.status === 'REJECTED');
    // One REJECTED row has null submittedAt and must not match.
    if (rejected && !rejected.suppressed) {
      expect(rejected.count).toBeLessThanOrEqual(5);
    }
  });

  it('P07_TEST_061 createdFrom boundary inclusive', async () => {
    const service = await resolveService(staffActor());
    const result = await service.aggregateBySchemeRef(staffActor(), {
      createdFrom: rangeFrom,
      createdTo: rangeFrom,
    });
    expect(result.groups.some((g) => g.schemeRef === 'gamma')).toBe(true);
  });

  it('P07_TEST_062 createdTo boundary inclusive', async () => {
    const service = await resolveService(staffActor());
    const result = await service.aggregateBySchemeRef(staffActor(), {
      createdFrom: rangeTo,
      createdTo: rangeTo,
    });
    expect(result.groups.some((g) => g.schemeRef === 'gamma')).toBe(true);
  });

  it('P07_TEST_088 production route delta = 0', () => {
    const adapter = app.getHttpAdapter();
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
    ]);
  });

  it('P07 exact 365 day span works at runtime', async () => {
    const service = await resolveService(staffActor());
    const from = new Date('2025-01-01T00:00:00.000Z');
    const to = new Date(from.getTime() + 365 * MS_PER_DAY);
    await expect(
      service.aggregateByStatus(staffActor(), { createdFrom: from, createdTo: to }),
    ).resolves.toBeDefined();
  });
});
