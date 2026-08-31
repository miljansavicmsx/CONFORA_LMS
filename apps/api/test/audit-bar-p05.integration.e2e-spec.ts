import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@confora/database';

import type { AuthenticatedActor } from '../src/auth/request-principal';
import { AuditError, AUDIT_IDEMPOTENCY_CONFLICT } from '../src/audit/audit-errors';
import { AuditEventRegistry } from '../src/audit/audit-event.registry';
import { INITIAL_PREV_HASH } from '../src/audit/audit-event.types';
import { AuditHashService } from '../src/audit/audit-hash.service';
import { AuditIntegrityService } from '../src/audit/audit-integrity.service';
import { AuditRepository } from '../src/audit/audit.repository';
import { AuditService } from '../src/audit/audit.service';
import type { TenantContextStore } from '../src/tenant/tenant-context.store';
import { runSyntheticBusinessWithAudit } from './helpers/audit-transaction.harness';

const IMAGE =
  'pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b';
const CONTAINER = `confora-bar-p05-e2e-${randomUUID().slice(0, 8)}`;

function repoRoot(): string {
  return process.cwd().replace(/[\\/]apps[\\/]api$/, '');
}

function dockerHostPort(container: string): string {
  const raw = execSync(`docker port ${container} 5432`, { encoding: 'utf8' }).trim();
  const match = raw.match(/:(\d+)\s*$/);
  const port = match?.[1];
  if (!port) throw new Error(`Unable to parse docker port mapping: ${raw}`);
  return port;
}

function testRegistry(): AuditEventRegistry {
  return new AuditEventRegistry([
    {
      eventType: 'TEST_EVENT',
      resourceTypePolicy: 'OPTIONAL',
      metadataSchema: {
        type: 'object',
        properties: { note: { type: 'string' } },
      },
    },
    {
      eventType: 'TEST_EVENT_STRICT',
      resourceTypePolicy: 'FORBIDDEN',
      metadataSchema: null,
    },
  ]);
}

function actorFor(tenantId: string, userId: string): AuthenticatedActor {
  return {
    userId,
    tenantId,
    issuer: 'https://issuer.example.test',
    subject: `sub-${userId}`,
    email: `${userId}@example.test`,
    roles: ['USR_CAND'],
    mfaVerified: true,
  };
}

describe('BAR-P05 audit integration e2e', () => {
  let prisma: PrismaClient;
  let databaseUrl: string;
  let tenantA: string;
  let tenantB: string;
  let userA: string;
  let userB: string;

  function makeService(tenantId: string): AuditService {
    const repo = new AuditRepository(prisma as never);
    const tenantContext = {
      getRequiredTenantId: () => tenantId,
    } as unknown as TenantContextStore;
    return new AuditService(repo, new AuditHashService(), tenantContext, testRegistry());
  }

  function makeIntegrity(): AuditIntegrityService {
    return new AuditIntegrityService(new AuditRepository(prisma as never), new AuditHashService());
  }

  beforeAll(async () => {
    execSync(
      `docker run -d --rm --name ${CONTAINER} -e POSTGRES_USER=confora -e POSTGRES_PASSWORD=confora_dev -e POSTGRES_DB=confora -p 127.0.0.1::5432 ${IMAGE}`,
      { stdio: 'pipe' },
    );
    const hostPort = dockerHostPort(CONTAINER);
    databaseUrl = `postgresql://confora:confora_dev@127.0.0.1:${hostPort}/confora`;
    process.env['DATABASE_URL'] = databaseUrl;

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

    tenantA = randomUUID();
    tenantB = randomUUID();
    userA = randomUUID();
    userB = randomUUID();

    await prisma.tenant.create({ data: { id: tenantA, isActive: true } });
    await prisma.tenant.create({ data: { id: tenantB, isActive: true } });
    await prisma.user.create({
      data: { id: userA, tenantId: tenantA, email: 'a@example.test', isActive: true },
    });
    await prisma.user.create({
      data: { id: userB, tenantId: tenantB, email: 'b@example.test', isActive: true },
    });
  }, 180_000);

  afterAll(async () => {
    await prisma.$disconnect();
    try {
      execSync(`docker rm -f ${CONTAINER}`, { stdio: 'pipe' });
    } catch {
      /* ignore */
    }
  });

  beforeEach(async () => {
    await prisma.auditEvent.deleteMany({});
    await prisma.auditChainHead.deleteMany({});
    await prisma.user.update({
      where: { tenantId_id: { tenantId: tenantA, id: userA } },
      data: { email: 'a@example.test' },
    });
  });

  it('P05_TEST_033 First event prevHash = zero hash', async () => {
    const service = makeService(tenantA);
    const view = await service.append(actorFor(tenantA, userA), {
      idempotencyKey: randomUUID(),
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt: new Date('2026-08-31T12:00:00.000Z'),
    });
    expect(view.prevHash).toBe(INITIAL_PREV_HASH);
  });

  it('P05_TEST_034 First event sequence = 1', async () => {
    const service = makeService(tenantA);
    const view = await service.append(actorFor(tenantA, userA), {
      idempotencyKey: randomUUID(),
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt: new Date('2026-08-31T12:00:01.000Z'),
    });
    expect(view.sequence).toBe(1n);
  });

  it('P05_TEST_035 Linear appends produce contiguous sequence', async () => {
    const service = makeService(tenantA);
    const actor = actorFor(tenantA, userA);
    const a = await service.append(actor, {
      idempotencyKey: randomUUID(),
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt: new Date('2026-08-31T12:00:02.000Z'),
    });
    const b = await service.append(actor, {
      idempotencyKey: randomUUID(),
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt: new Date('2026-08-31T12:00:03.000Z'),
    });
    const c = await service.append(actor, {
      idempotencyKey: randomUUID(),
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt: new Date('2026-08-31T12:00:04.000Z'),
    });
    expect([a.sequence, b.sequence, c.sequence]).toEqual([1n, 2n, 3n]);
    expect(b.prevHash).toBe(a.chainHash);
    expect(c.prevHash).toBe(b.chainHash);
  });

  it('P05_TEST_036 Chain head advances to final event', async () => {
    const service = makeService(tenantA);
    const actor = actorFor(tenantA, userA);
    let last = await service.append(actor, {
      idempotencyKey: randomUUID(),
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt: new Date('2026-08-31T12:00:05.000Z'),
    });
    last = await service.append(actor, {
      idempotencyKey: randomUUID(),
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt: new Date('2026-08-31T12:00:06.000Z'),
    });
    const head = await prisma.auditChainHead.findUniqueOrThrow({ where: { tenantId: tenantA } });
    expect(head.lastSequence).toBe(last.sequence);
    expect(head.lastHash).toBe(last.chainHash);
  });

  it('P05_TEST_037 Cross-tenant chains independent', async () => {
    const serviceA = makeService(tenantA);
    const serviceB = makeService(tenantB);
    const a = await serviceA.append(actorFor(tenantA, userA), {
      idempotencyKey: randomUUID(),
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt: new Date('2026-08-31T12:00:07.000Z'),
    });
    const b = await serviceB.append(actorFor(tenantB, userB), {
      idempotencyKey: randomUUID(),
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt: new Date('2026-08-31T12:00:08.000Z'),
    });
    expect(a.sequence).toBe(1n);
    expect(b.sequence).toBe(1n);
    expect(a.prevHash).toBe(INITIAL_PREV_HASH);
    expect(b.prevHash).toBe(INITIAL_PREV_HASH);
    expect(a.chainHash).not.toBe(b.chainHash);
  });

  it('P05_TEST_038 Exact idempotent replay returns existing event', async () => {
    const service = makeService(tenantA);
    const actor = actorFor(tenantA, userA);
    const key = randomUUID();
    const input = {
      idempotencyKey: key,
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS' as const,
      occurredAt: new Date('2026-08-31T12:00:09.000Z'),
      metadata: { note: 'same' },
    };
    const first = await service.append(actor, input);
    const second = await service.append(actor, input);
    expect(second.id).toBe(first.id);
    expect(second.sequence).toBe(first.sequence);
    expect(await prisma.auditEvent.count({ where: { tenantId: tenantA } })).toBe(1);
  });

  it('P05_TEST_039 Exact replay does not advance chain', async () => {
    const service = makeService(tenantA);
    const actor = actorFor(tenantA, userA);
    const key = randomUUID();
    const input = {
      idempotencyKey: key,
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS' as const,
      occurredAt: new Date('2026-08-31T12:00:10.000Z'),
    };
    const first = await service.append(actor, input);
    const headBefore = await prisma.auditChainHead.findUniqueOrThrow({
      where: { tenantId: tenantA },
    });
    await service.append(actor, input);
    const headAfter = await prisma.auditChainHead.findUniqueOrThrow({
      where: { tenantId: tenantA },
    });
    expect(headAfter.lastSequence).toBe(headBefore.lastSequence);
    expect(headAfter.lastHash).toBe(first.chainHash);
  });

  it('P05_TEST_040 Conflicting replay -> AUDIT_IDEMPOTENCY_CONFLICT', async () => {
    const service = makeService(tenantA);
    const actor = actorFor(tenantA, userA);
    const key = randomUUID();
    await service.append(actor, {
      idempotencyKey: key,
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt: new Date('2026-08-31T12:00:11.000Z'),
    });
    const headBefore = await prisma.auditChainHead.findUniqueOrThrow({
      where: { tenantId: tenantA },
    });
    await expect(
      service.append(actor, {
        idempotencyKey: key,
        eventType: 'TEST_EVENT',
        outcome: 'DENIED',
        occurredAt: new Date('2026-08-31T12:00:11.000Z'),
      }),
    ).rejects.toMatchObject({ code: AUDIT_IDEMPOTENCY_CONFLICT });
    expect(await prisma.auditEvent.count({ where: { tenantId: tenantA } })).toBe(1);
    const headAfter = await prisma.auditChainHead.findUniqueOrThrow({
      where: { tenantId: tenantA },
    });
    expect(headAfter.lastSequence).toBe(headBefore.lastSequence);
  });

  it('P05_TEST_041 Same idempotency key under another tenant is independent', async () => {
    const key = randomUUID();
    const occurredAt = new Date('2026-08-31T12:00:12.000Z');
    const a = await makeService(tenantA).append(actorFor(tenantA, userA), {
      idempotencyKey: key,
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt,
    });
    const b = await makeService(tenantB).append(actorFor(tenantB, userB), {
      idempotencyKey: key,
      eventType: 'TEST_EVENT',
      outcome: 'SUCCESS',
      occurredAt,
    });
    expect(a.id).not.toBe(b.id);
    expect(a.tenantId).toBe(tenantA);
    expect(b.tenantId).toBe(tenantB);
  });

  it('P05_TEST_042 Concurrent same-tenant appends linearize', async () => {
    const service = makeService(tenantA);
    const actor = actorFor(tenantA, userA);
    const results = await Promise.all(
      [0, 1, 2, 3].map((i) =>
        service.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'TEST_EVENT',
          outcome: 'SUCCESS',
          occurredAt: new Date(`2026-08-31T12:01:0${String(i)}.000Z`),
        }),
      ),
    );
    expect(results).toHaveLength(4);
    const sequences = results.map((r) => r.sequence).sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
    expect(sequences).toEqual([1n, 2n, 3n, 4n]);
    expect(new Set(results.map((r) => r.id)).size).toBe(4);
    const head = await prisma.auditChainHead.findUniqueOrThrow({ where: { tenantId: tenantA } });
    expect(head.lastSequence).toBe(4n);
    const integrity = await makeIntegrity().verifyTenantChain(tenantA);
    expect(integrity).toEqual({ status: 'PASS', chainLength: 4 });
  });

  it('P05_TEST_043 Concurrent different-tenant appends remain independent', async () => {
    const serviceA = makeService(tenantA);
    const serviceB = makeService(tenantB);
    await Promise.all([
      serviceA.append(actorFor(tenantA, userA), {
        idempotencyKey: randomUUID(),
        eventType: 'TEST_EVENT',
        outcome: 'SUCCESS',
        occurredAt: new Date('2026-08-31T12:02:00.000Z'),
      }),
      serviceB.append(actorFor(tenantB, userB), {
        idempotencyKey: randomUUID(),
        eventType: 'TEST_EVENT',
        outcome: 'SUCCESS',
        occurredAt: new Date('2026-08-31T12:02:01.000Z'),
      }),
      serviceA.append(actorFor(tenantA, userA), {
        idempotencyKey: randomUUID(),
        eventType: 'TEST_EVENT',
        outcome: 'SUCCESS',
        occurredAt: new Date('2026-08-31T12:02:02.000Z'),
      }),
      serviceB.append(actorFor(tenantB, userB), {
        idempotencyKey: randomUUID(),
        eventType: 'TEST_EVENT',
        outcome: 'SUCCESS',
        occurredAt: new Date('2026-08-31T12:02:03.000Z'),
      }),
    ]);
    expect(await prisma.auditEvent.count({ where: { tenantId: tenantA } })).toBe(2);
    expect(await prisma.auditEvent.count({ where: { tenantId: tenantB } })).toBe(2);
    await expect(makeIntegrity().verifyTenantChain(tenantA)).resolves.toEqual({
      status: 'PASS',
      chainLength: 2,
    });
    await expect(makeIntegrity().verifyTenantChain(tenantB)).resolves.toEqual({
      status: 'PASS',
      chainLength: 2,
    });
  });

  it('P05_TEST_044 Concurrent identical replay remains one logical event', async () => {
    const service = makeService(tenantA);
    const actor = actorFor(tenantA, userA);
    const key = randomUUID();
    const input = {
      idempotencyKey: key,
      eventType: 'TEST_EVENT' as const,
      outcome: 'SUCCESS' as const,
      occurredAt: new Date('2026-08-31T12:03:00.000Z'),
      metadata: { note: 'concurrent-replay' },
    };
    const settled = await Promise.allSettled([
      service.append(actor, input),
      service.append(actor, input),
      service.append(actor, input),
    ]);
    const fulfilled = settled.filter((s) => s.status === 'fulfilled');
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);
    const ids = new Set(fulfilled.map((f) => f.value.id));
    expect(ids.size).toBe(1);
    expect(
      await prisma.auditEvent.count({ where: { tenantId: tenantA, idempotencyKey: key } }),
    ).toBe(1);
  });

  it('P05_TEST_045 Audit append failure rolls back synthetic business mutation', async () => {
    const service = makeService(tenantA);
    const actor = actorFor(tenantA, userA);
    const before = await prisma.user.findUniqueOrThrow({
      where: { tenantId_id: { tenantId: tenantA, id: userA } },
    });
    await expect(
      runSyntheticBusinessWithAudit(service, actor, {
        userId: userA,
        email: 'mutated-should-rollback@example.test',
        appendInput: {
          idempotencyKey: randomUUID(),
          eventType: 'UNKNOWN_EVENT',
          outcome: 'SUCCESS',
          occurredAt: new Date('2026-08-31T12:04:00.000Z'),
        },
      }),
    ).rejects.toBeInstanceOf(AuditError);
    const after = await prisma.user.findUniqueOrThrow({
      where: { tenantId_id: { tenantId: tenantA, id: userA } },
    });
    expect(after.email).toBe(before.email);
    expect(await prisma.auditEvent.count({ where: { tenantId: tenantA } })).toBe(0);
  });

  it('P05_TEST_046 Later callback failure rolls back AuditEvent + chain head', async () => {
    const service = makeService(tenantA);
    const actor = actorFor(tenantA, userA);
    await expect(
      service.executeInTransaction(actor, async (ops) => {
        await ops.append({
          idempotencyKey: randomUUID(),
          eventType: 'TEST_EVENT',
          outcome: 'SUCCESS',
          occurredAt: new Date('2026-08-31T12:05:00.000Z'),
        });
        throw new Error('callback boom');
      }),
    ).rejects.toBeDefined();
    expect(await prisma.auditEvent.count({ where: { tenantId: tenantA } })).toBe(0);
    expect(await prisma.auditChainHead.count({ where: { tenantId: tenantA } })).toBe(0);
  });

  it('P05_TEST_047 Successful synthetic business mutation + audit commit atomically', async () => {
    const service = makeService(tenantA);
    const actor = actorFor(tenantA, userA);
    const newEmail = `atomic-${randomUUID()}@example.test`;
    const view = await runSyntheticBusinessWithAudit(service, actor, {
      userId: userA,
      email: newEmail,
      appendInput: {
        idempotencyKey: randomUUID(),
        eventType: 'TEST_EVENT',
        outcome: 'SUCCESS',
        occurredAt: new Date('2026-08-31T12:06:00.000Z'),
      },
    });
    const user = await prisma.user.findUniqueOrThrow({
      where: { tenantId_id: { tenantId: tenantA, id: userA } },
    });
    expect(user.email).toBe(newEmail);
    expect(view.sequence).toBe(1n);
    expect(await prisma.auditEvent.count({ where: { tenantId: tenantA } })).toBe(1);
  });
});
