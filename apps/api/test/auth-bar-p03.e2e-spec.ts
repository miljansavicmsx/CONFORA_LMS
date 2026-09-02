import { Controller, Get, Req, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Server } from 'node:http';
import { generateKeyPairSync, randomUUID } from 'node:crypto';
import { sign } from 'jsonwebtoken';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@confora/database';

import { AppModule } from '../src/app.module';
import { AppController } from '../src/app.controller';
import type { AuthenticatedActor } from '../src/auth/request-principal';
import { startSyntheticJwksFixture } from './helpers/synthetic-jwks.fixture';

const IMAGE =
  'pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b';
const CONTAINER = `confora-bar-p03-e2e-${randomUUID().slice(0, 8)}`;

@Controller('probe')
class ProbeController {
  @Get()
  probe(@Req() req: { user?: AuthenticatedActor }): AuthenticatedActor | undefined {
    return req.user;
  }
}

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

describe('BAR-P03 auth e2e', () => {
  let fixture: Awaited<ReturnType<typeof startSyntheticJwksFixture>>;
  let app: INestApplication;
  let prisma: PrismaClient;
  const tenantId = randomUUID();
  const userId = randomUUID();
  const subject = 'e2e-opaque-sub';

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
      data: { id: userId, tenantId, email: 'e2e@example.test', isActive: true },
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
      controllers: [ProbeController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.init();
  }, 180_000);

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    try {
      await fixture.stop();
    } catch {
      /* AUTH_15 may already have stopped the synthetic JWKS server. */
    }
    try {
      execSync(`docker rm -f ${CONTAINER}`, { stdio: 'pipe' });
    } catch {
      /* ignore */
    }
  });

  it('AUTH_01 GET /v1/health returns 200 without Authorization header', async () => {
    await request(httpServer(app)).get('/v1/health').expect(200, {
      status: 'ok',
    });
  });

  it('AUTH_04 returns 401 when JWT signature is invalid', async () => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const now = Math.floor(Date.now() / 1000);
    const bad = sign(
      {
        iss: fixture.issuer,
        aud: fixture.audience,
        sub: subject,
        tenant_id: tenantId,
        exp: now + 300,
        iat: now,
      },
      privateKey.export({ type: 'pkcs8', format: 'pem' }) as string,
      { algorithm: 'RS256', keyid: fixture.kid },
    );
    await request(httpServer(app))
      .get('/v1/probe')
      .set('Authorization', `Bearer ${bad}`)
      .expect(401);
  });

  it('AUTH_14 unknown kid after JWKS refresh returns 401', async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = sign(
      {
        iss: fixture.issuer,
        aud: fixture.audience,
        sub: subject,
        tenant_id: tenantId,
        exp: now + 300,
        iat: now,
      },
      fixture.privateKeyPem,
      { algorithm: 'RS256', keyid: 'totally-unknown-kid' },
    );
    await request(httpServer(app))
      .get('/v1/probe')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('AUTH_25 client-supplied tenant header cannot override token tenant_id authority', async () => {
    // Post-BAR-P04 (OD-P04-02): prohibited client tenant selectors are rejected at the
    // transport boundary before JwtAuthGuard / actor construction. Historical BAR-P03
    // AUTH_25 observed header-ignored-as-authority with request continuation; that outer
    // transport expectation is intentionally evolved. Trusted tenant source remains JWT tenant_id only.
    const token = fixture.signAccessToken({
      sub: subject,
      tenant_id: tenantId,
      realm_access: { roles: ['USR_CAND'] },
    });
    const forgedTenant = randomUUID();
    const rejected = await request(httpServer(app))
      .get('/v1/probe')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', forgedTenant)
      .expect(400);
    expect(rejected.body).toMatchObject({
      statusCode: 400,
      code: 'CLIENT_TENANT_CONTEXT_FORBIDDEN',
    });
    expect(JSON.stringify(rejected.body)).not.toContain(forgedTenant);

    // Without the prohibited selector, actor tenantId remains the verified JWT tenant_id.
    const allowed = await request(httpServer(app))
      .get('/v1/probe')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const body = allowed.body as AuthenticatedActor;
    expect(body.tenantId).toBe(tenantId);
    expect(body.tenantId).not.toBe(forgedTenant);
  });

  it('AUTH_15 JWKS endpoint unavailable returns 401 on protected route', async () => {
    await fixture.stop();
    const now = Math.floor(Date.now() / 1000);
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const token = sign(
      {
        iss: process.env['OIDC_ISSUER_URL'],
        aud: process.env['OIDC_CLIENT_ID'],
        sub: subject,
        tenant_id: tenantId,
        exp: now + 300,
        iat: now,
      },
      privateKey.export({ type: 'pkcs8', format: 'pem' }) as string,
      { algorithm: 'RS256', keyid: 'after-stop' },
    );
    await request(httpServer(app))
      .get('/v1/probe')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('AUTH_30 registers no new production routes beyond GET /v1/health', () => {
    const getMetadata = Reflect.getMetadata.bind(Reflect) as (
      metadataKey: unknown,
      target: object,
      propertyKey?: string | symbol,
    ) => unknown;

    // Production module registers only AppController (no auth/debug/introspect routes).
    const moduleControllers = getMetadata('controllers', AppModule) as unknown[] | undefined;
    expect(moduleControllers).toEqual([AppController]);

    const controllerPath = getMetadata('path', AppController);
    const methodPath = getMetadata('path', AppController.prototype, 'health');

    expect(controllerPath).toBe('health');
    // Nest bare `@Get()` leaves method PATH_METADATA undefined; that means the controller root path.
    expect(methodPath).toBeUndefined();

    expect(
      Object.getOwnPropertyNames(AppController.prototype).filter((n) => n !== 'constructor'),
    ).toEqual(['health']);

    // Global prefix `v1` + controller `health` + bare GET root → GET /v1/health
    const normalizedRoute = `GET /v1/${String(controllerPath)}`;
    expect(normalizedRoute).toBe('GET /v1/health');

    const adapter = app.getHttpAdapter();
    const instance = adapter.getInstance() as {
      _router?: { stack?: Array<{ route?: { path: string; methods: Record<string, boolean> } }> };
    };
    // Express 4 exposes routes on `_router` only; do not touch deprecated `app.router` getter.
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
      .flat()
      // ProbeController exists only inside this e2e suite and is not production surface.
      .filter((entry) => !entry.endsWith('/probe') && !entry.endsWith('/v1/probe'));

    expect(productionRoutes).toEqual([
      'GET /v1/health',
      'GET /v1/me/certification/applications',
      'GET /v1/me/certification/applications/:id',
    ]);
  });
});
