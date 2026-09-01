import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';

const IMAGE =
  'pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(packageRoot, '..', '..');

function dockerHostPort(container: string): string {
  const raw = execSync(`docker port ${container} 5432`, { encoding: 'utf8' }).trim();
  const match = raw.match(/:(\d+)\s*$/);
  if (!match || !match[1]) throw new Error(`Unable to parse docker port: ${raw}`);
  return match[1];
}

async function waitReady(container: string): Promise<void> {
  for (let i = 0; i < 40; i += 1) {
    try {
      execSync(`docker exec ${container} pg_isready -U confora -d confora`, { stdio: 'pipe' });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error('postgres not ready');
}

type Fixture = {
  tenantId: string;
  userId: string;
  eilId: string;
  tenantIsActive: boolean;
  userIsActive: boolean;
  userEmail: string;
  eilIssuer: string;
  eilSubject: string;
  auditEventCount: number;
  chainHeadCount: number;
  migrationHasInsert: boolean;
  _expectedTenantActive: boolean;
  _expectedUserActive: boolean;
  _expectedEmail: string;
  _expectedIssuer: string;
  _expectedSubject: string;
};

async function runTwoPhaseMigrationProof(): Promise<Fixture> {
  const container = `confora-bar-p05-mig-${randomUUID().slice(0, 8)}`;
  const baselineWork = path.join(packageRoot, `.tmp-p05-base-${randomUUID().slice(0, 8)}`);
  let databaseUrl = '';

  try {
    execSync(
      `docker run -d --rm --name ${container} -e POSTGRES_USER=confora -e POSTGRES_PASSWORD=confora_dev -e POSTGRES_DB=confora -p 127.0.0.1::5432 ${IMAGE}`,
      { stdio: 'pipe' },
    );
    await waitReady(container);
    databaseUrl = `postgresql://confora:confora_dev@127.0.0.1:${dockerHostPort(container)}/confora`;

    execSync(
      `git -C "${repoRoot}" worktree add --detach "${baselineWork}" b4c8df4a316ee7c046fa2c361cd5b79039283338`,
      { stdio: 'pipe' },
    );

    const baselineSchema = path.join(
      baselineWork,
      'packages',
      'database',
      'prisma',
      'schema.prisma',
    );
    execSync(
      `corepack pnpm@9.14.2 --filter @confora/database exec prisma migrate deploy --schema "${baselineSchema}"`,
      {
        cwd: repoRoot,
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: 'pipe',
      },
    );

    const prismaA = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    await prismaA.$connect();
    const tenantId = randomUUID();
    const userId = randomUUID();
    const eilId = randomUUID();
    const userEmail = `p05-mig-${userId}@example.test`;
    const eilIssuer = 'https://issuer.example.test';
    const eilSubject = `sub-${eilId}`;
    await prismaA.tenant.create({ data: { id: tenantId, isActive: true } });
    await prismaA.user.create({
      data: { id: userId, tenantId, email: userEmail, isActive: true },
    });
    await prismaA.externalIdentityLink.create({
      data: { id: eilId, tenantId, userId, issuer: eilIssuer, subject: eilSubject },
    });
    const tenantBefore = await prismaA.tenant.findUniqueOrThrow({ where: { id: tenantId } });
    const userBefore = await prismaA.user.findUniqueOrThrow({ where: { id: userId } });
    await prismaA.$disconnect();

    const currentSchema = path.join(packageRoot, 'prisma', 'schema.prisma');
    execSync(
      `corepack pnpm@9.14.2 --filter @confora/database exec prisma migrate deploy --schema "${currentSchema}"`,
      {
        cwd: repoRoot,
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: 'pipe',
      },
    );

    const prismaB = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    await prismaB.$connect();
    const tenantAfter = await prismaB.tenant.findUniqueOrThrow({ where: { id: tenantId } });
    const userAfter = await prismaB.user.findUniqueOrThrow({ where: { id: userId } });
    const eilAfter = await prismaB.externalIdentityLink.findUniqueOrThrow({ where: { id: eilId } });
    const auditEventCount = await prismaB.auditEvent.count();
    const chainHeadCount = await prismaB.auditChainHead.count();
    await prismaB.$disconnect();

    const migrationSql = await readFile(
      path.join(
        packageRoot,
        'prisma',
        'migrations',
        '20260831193000_bar_p05_audit_ledger_baseline',
        'migration.sql',
      ),
      'utf8',
    );

    return {
      tenantId,
      userId,
      eilId,
      tenantIsActive: tenantAfter.isActive,
      userIsActive: userAfter.isActive,
      userEmail: userAfter.email,
      eilIssuer: eilAfter.issuer,
      eilSubject: eilAfter.subject,
      auditEventCount,
      chainHeadCount,
      migrationHasInsert: /\bINSERT\b/i.test(migrationSql),
      _expectedTenantActive: tenantBefore.isActive,
      _expectedUserActive: userBefore.isActive,
      _expectedEmail: userEmail,
      _expectedIssuer: eilIssuer,
      _expectedSubject: eilSubject,
    };
  } finally {
    try {
      execSync(`git -C "${repoRoot}" worktree remove -f "${baselineWork}"`, { stdio: 'pipe' });
    } catch {
      /* ignore */
    }
    try {
      execSync(`docker rm -f ${container}`, { stdio: 'pipe' });
    } catch {
      /* ignore */
    }
  }
}

let fixture: Awaited<ReturnType<typeof runTwoPhaseMigrationProof>> | null = null;

test.before(async () => {
  fixture = await runTwoPhaseMigrationProof();
});

test('P05_TEST_008 Migration creates zero AuditEvent rows', () => {
  assert.ok(fixture);
  assert.equal(fixture.auditEventCount, 0);
  assert.equal(fixture.migrationHasInsert, false);
});

test('P05_TEST_009 Migration creates zero AuditChainHead rows', () => {
  assert.ok(fixture);
  assert.equal(fixture.chainHeadCount, 0);
});

test('P05_TEST_010 Existing Tenant/User/EIL and isActive values unchanged', () => {
  assert.ok(fixture);
  assert.equal(fixture.tenantIsActive, fixture._expectedTenantActive);
  assert.equal(fixture.userIsActive, fixture._expectedUserActive);
  assert.equal(fixture.userEmail, fixture._expectedEmail);
  assert.equal(fixture.eilIssuer, fixture._expectedIssuer);
  assert.equal(fixture.eilSubject, fixture._expectedSubject);
});
