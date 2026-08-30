import { ForbiddenException } from '@nestjs/common';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@confora/database';

import { resolveCanonicalUser } from './resolve-db-user';
import type { PrismaService } from '../prisma/prisma.service';

const IMAGE =
  'pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b';
const CONTAINER = `confora-bar-p03-r1-${randomUUID().slice(0, 8)}`;

describe('resolveCanonicalUser', () => {
  let prisma: PrismaClient;
  let hostPort: string;
  const issuer = 'http://issuer.test/realms/confora';
  const subject = 'opaque-sub-shared';
  let tenantA: string;
  let tenantB: string;
  let userA: string;
  let userB: string;

  beforeAll(async () => {
    execSync(
      `docker run -d --rm --name ${CONTAINER} -e POSTGRES_USER=confora -e POSTGRES_PASSWORD=confora_dev -e POSTGRES_DB=confora -p 127.0.0.1::5432 ${IMAGE}`,
      { stdio: 'pipe' },
    );
    const portRaw = execSync(`docker port ${CONTAINER} 5432`, {
      encoding: 'utf8',
    }).trim();
    const portMatch = portRaw.match(/:(\d+)\s*$/);
    if (!portMatch) {
      throw new Error(`Unable to parse docker port mapping: ${portRaw}`);
    }
    hostPort = portMatch[1];

    const databaseUrl = `postgresql://confora:confora_dev@127.0.0.1:${hostPort}/confora`;
    process.env['DATABASE_URL'] = databaseUrl;

    for (let i = 0; i < 30; i += 1) {
      try {
        execSync(`docker exec ${CONTAINER} pg_isready -U confora -d confora`, { stdio: 'pipe' });
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    execSync('corepack pnpm@9.14.2 --filter @confora/database run db:migrate:deploy', {
      cwd:
        process.cwd().includes('apps\\api') || process.cwd().endsWith('apps/api')
          ? process.cwd().replace(/apps[\\/]api$/, '')
          : process.cwd(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });

    prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    await prisma.$connect();

    tenantA = randomUUID();
    tenantB = randomUUID();
    userA = randomUUID();
    userB = randomUUID();

    await prisma.tenant.create({ data: { id: tenantA } });
    await prisma.tenant.create({ data: { id: tenantB } });
    await prisma.user.create({
      data: { id: userA, tenantId: tenantA, email: 'a@example.test' },
    });
    await prisma.user.create({
      data: { id: userB, tenantId: tenantB, email: 'b@example.test' },
    });
    await prisma.externalIdentityLink.create({
      data: {
        id: randomUUID(),
        tenantId: tenantA,
        userId: userA,
        issuer,
        subject,
      },
    });
    await prisma.externalIdentityLink.create({
      data: {
        id: randomUUID(),
        tenantId: tenantB,
        userId: userB,
        issuer,
        subject,
      },
    });
  }, 120_000);

  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      /* ignore */
    }
    try {
      execSync(`docker rm -f ${CONTAINER}`, { stdio: 'pipe' });
    } catch {
      /* ignore */
    }
  });

  it('AUTH_16 never queries User by sub as primary key lookup', async () => {
    const findUniqueUser = jest.fn();
    const findUniqueLink = jest.fn().mockResolvedValue({
      user: { id: userA, tenantId: tenantA, email: 'a@example.test' },
    });
    const db = {
      user: { findUnique: findUniqueUser },
      externalIdentityLink: { findUnique: findUniqueLink },
    } as unknown as PrismaService;

    await resolveCanonicalUser(db, {
      tenantId: tenantA,
      issuer,
      subject,
    });

    expect(findUniqueUser).not.toHaveBeenCalled();
    expect(findUniqueLink).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId_issuer_subject: {
            tenantId: tenantA,
            issuer,
            subject,
          },
        },
      }),
    );
  });

  it('AUTH_17 resolves User via tenantId_issuer_subject ExternalIdentityLink', async () => {
    const resolved = await resolveCanonicalUser(prisma as unknown as PrismaService, {
      tenantId: tenantA,
      issuer,
      subject,
    });
    expect(resolved).toEqual({
      userId: userA,
      tenantId: tenantA,
      email: 'a@example.test',
    });
  });

  it('AUTH_18 same issuer+subject in different tenant cannot cross-resolve', async () => {
    const resolved = await resolveCanonicalUser(prisma as unknown as PrismaService, {
      tenantId: tenantB,
      issuer,
      subject,
    });
    expect(resolved.userId).toBe(userB);
    expect(resolved.tenantId).toBe(tenantB);
    expect(resolved.userId).not.toBe(userA);
  });

  it('AUTH_19 returns 403 when ExternalIdentityLink is missing', async () => {
    await expect(
      resolveCanonicalUser(prisma as unknown as PrismaService, {
        tenantId: tenantA,
        issuer,
        subject: 'missing-subject',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('AUTH_20 returns 403 when linked User record is missing', async () => {
    const db = {
      externalIdentityLink: {
        findUnique: jest.fn().mockResolvedValue({
          user: null,
        }),
      },
    } as unknown as PrismaService;

    await expect(
      resolveCanonicalUser(db, {
        tenantId: tenantA,
        issuer,
        subject,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('AUTH_21 performs zero database writes during authentication', async () => {
    const create = jest.fn();
    const update = jest.fn();
    const upsert = jest.fn();
    const deleteFn = jest.fn();
    const findUnique = jest.fn().mockResolvedValue({
      user: { id: userA, tenantId: tenantA, email: 'a@example.test' },
    });
    const db = {
      externalIdentityLink: {
        findUnique,
        create,
        update,
        upsert,
        delete: deleteFn,
      },
      user: { create, update, upsert, delete: deleteFn },
    } as unknown as PrismaService;

    await resolveCanonicalUser(db, {
      tenantId: tenantA,
      issuer,
      subject,
    });

    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
    expect(deleteFn).not.toHaveBeenCalled();
  });
});
