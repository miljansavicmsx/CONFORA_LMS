import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Server } from 'node:http';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@confora/database';

import { AppModule } from '../src/app.module';
import type { AuthenticatedActor } from '../src/auth/request-principal';
import { startSyntheticJwksFixture } from './helpers/synthetic-jwks.fixture';
import {
  BarP04SyntheticActorController,
  BarP04SyntheticProbeController,
  BarP04SyntheticRequireMfaController,
} from './helpers/bar-p04-synthetic-controllers';

const IMAGE =
  'pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b';
const CONTAINER = `confora-bar-p04-e2e-${randomUUID().slice(0, 8)}`;

function repoRoot(): string {
  const cwd = process.cwd();
  return cwd.replace(/[\\/]apps[\\/]api$/, '');
}

function dockerHostPort(container: string): string {
  const raw = execSync(`docker port ${container} 5432`, { encoding: 'utf8' }).trim();
  const match = raw.match(/:(\d+)\s*$/);
  if (!match) {
    throw new Error(`Unable to parse docker port mapping: ${raw}`);
  }
  return match[1];
}

function httpServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

describe('BAR-P04 auth e2e', () => {
  let fixture: Awaited<ReturnType<typeof startSyntheticJwksFixture>>;
  let app: INestApplication;
  let prisma: PrismaClient;
  const tenantId = randomUUID();
  const userId = randomUUID();
  const subject = 'e2e-p04-opaque-sub';

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
        execSync(`docker exec ${CONTAINER} pg_isready -U confora -d confora`, {
          stdio: 'pipe',
        });
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
    await prisma.tenant.create({ data: { id: tenantId, isActive: true } });
    await prisma.user.create({
      data: { id: userId, tenantId, email: 'e2e-p04@example.test', isActive: true },
    });
    await prisma.externalIdentityLink.create({
      data: {
        id: randomUUID(),
        tenantId,
        userId,
        issuer: fixture.issuer,
        subject,
      },
    });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [
        BarP04SyntheticProbeController,
        BarP04SyntheticRequireMfaController,
        BarP04SyntheticActorController,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    // Apply AppModule middleware (client tenant rejection)
    const appModule = app.select(AppModule);
    void appModule;
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

  function token(claims: Record<string, unknown>): string {
    return fixture.signAccessToken({
      sub: subject,
      tenant_id: tenantId,
      realm_access: { roles: ['USR_CAND'] },
      ...claims,
    });
  }

  it('P04_TEST_012 client tenant selector never alters actor.tenantId', async () => {
    const res = await request(httpServer(app))
      .get('/v1/p04-synthetic-actor/me')
      .set('Authorization', `Bearer ${token({})}`)
      .expect(200);
    const body = res.body as AuthenticatedActor;
    expect(body.tenantId).toBe(tenantId);
  });

  it('P04_TEST_020 @Public health still rejects prohibited client tenant selectors', async () => {
    const res = await request(httpServer(app))
      .get('/v1/health')
      .set('x-tenant-id', randomUUID())
      .expect(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      code: 'CLIENT_TENANT_CONTEXT_FORBIDDEN',
    });
    expect(JSON.stringify(res.body)).not.toMatch(/11111111|tenantId":"/);
  });

  it('GET /v1/health remains public without selector', async () => {
    await request(httpServer(app)).get('/v1/health').expect(200);
  });

  it('active learner without MFA can access synthetic probe', async () => {
    await request(httpServer(app))
      .get('/v1/p04-synthetic/probe')
      .set('Authorization', `Bearer ${token({ realm_access: { roles: ['USR_CAND'] } })}`)
      .expect(200);
  });

  it('privileged without MFA is rejected on synthetic probe', async () => {
    const res = await request(httpServer(app))
      .get('/v1/p04-synthetic/probe')
      .set(
        'Authorization',
        `Bearer ${token({
          realm_access: { roles: ['STAFF_DIR'] },
          mfa_verified: false,
          amr: ['pwd'],
        })}`,
      )
      .expect(403);
    expect(res.body).toMatchObject({
      statusCode: 403,
      code: 'MFA_REQUIRED',
    });
  });

  it('inactive tenant yields ACCESS_DENIED', async () => {
    await prisma.tenant.update({ where: { id: tenantId }, data: { isActive: false } });
    const res = await request(httpServer(app))
      .get('/v1/p04-synthetic/probe')
      .set('Authorization', `Bearer ${token({})}`)
      .expect(403);
    expect(res.body).toMatchObject({ code: 'ACCESS_DENIED', message: 'Access denied.' });
    await prisma.tenant.update({ where: { id: tenantId }, data: { isActive: true } });
  });
});
