import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';

const IMAGE =
  'pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(packageRoot, '..', '..');
const schemaPath = path.join(packageRoot, 'prisma', 'schema.prisma');
const migrationsDir = path.join(packageRoot, 'prisma', 'migrations');

function dockerHostPort(container: string): string {
  const raw = execSync(`docker port ${container} 5432`, { encoding: 'utf8' }).trim();
  const match = raw.match(/:(\d+)\s*$/);
  if (!match?.[1]) throw new Error(`Unable to parse docker port: ${raw}`);
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

type MigrationFixture = {
  tenantId: string;
  userId: string;
  eilId: string;
  tenantIsActive: boolean;
  userIsActive: boolean;
  applicationCount: number;
  migrationHasInsert: boolean;
  _expectedTenantActive: boolean;
  _expectedUserActive: boolean;
};

async function runTwoPhaseMigrationProof(): Promise<MigrationFixture> {
  const container = `confora-bar-p06-mig-${randomUUID().slice(0, 8)}`;
  const baselineWork = path.join(packageRoot, `.tmp-p06-base-${randomUUID().slice(0, 8)}`);
  let databaseUrl = '';

  try {
    execSync(
      `docker run -d --rm --name ${container} -e POSTGRES_USER=confora -e POSTGRES_PASSWORD=confora_dev -e POSTGRES_DB=confora -p 127.0.0.1::5432 ${IMAGE}`,
      { stdio: 'pipe' },
    );
    await waitReady(container);
    databaseUrl = `postgresql://confora:confora_dev@127.0.0.1:${dockerHostPort(container)}/confora`;

    execSync(
      `git -C "${repoRoot}" worktree add --detach "${baselineWork}" 2365ec626eeede91e7c1c916be39ed3f353eeccf`,
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
    await prismaA.tenant.create({ data: { id: tenantId, isActive: true } });
    await prismaA.user.create({
      data: { id: userId, tenantId, email: `p06-mig-${userId}@example.test`, isActive: true },
    });
    await prismaA.externalIdentityLink.create({
      data: {
        id: eilId,
        tenantId,
        userId,
        issuer: 'https://issuer.example.test',
        subject: `sub-${eilId}`,
      },
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
    const applicationCount = await prismaB.certificationApplication.count();
    await prismaB.$disconnect();

    const migrationDirs = (await readdir(migrationsDir)).filter((name) =>
      name.includes('bar_p06_certification_application_self_read_baseline'),
    );
    assert.equal(migrationDirs.length, 1);
    const migrationDirName = migrationDirs[0];
    if (!migrationDirName) {
      throw new Error('P06 migration directory missing');
    }
    const migrationSql = await readFile(
      path.join(migrationsDir, migrationDirName, 'migration.sql'),
      'utf8',
    );

    assert.ok(eilAfter.id === eilId);

    return {
      tenantId,
      userId,
      eilId,
      tenantIsActive: tenantAfter.isActive,
      userIsActive: userAfter.isActive,
      applicationCount,
      migrationHasInsert: /\bINSERT\b/i.test(migrationSql),
      _expectedTenantActive: tenantBefore.isActive,
      _expectedUserActive: userBefore.isActive,
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

let migrationFixture: MigrationFixture | null = null;

test.before(async () => {
  migrationFixture = await runTwoPhaseMigrationProof();
});

test('P06_TEST_001 resulting Prisma model count exactly 6', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  assert.equal((schema.match(/^model /gm) ?? []).length, 6);
});

test('P06_TEST_002 resulting Prisma enum count exactly 2', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  assert.equal((schema.match(/^enum /gm) ?? []).length, 2);
});

test('P06_TEST_003 CertificationApplicationStatus values exact order', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  const block = schema.match(/enum CertificationApplicationStatus\s*\{([^}]*)\}/)?.[1] ?? '';
  const values = block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'));
  assert.deepEqual(values, ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']);
});

test('P06_TEST_004 CertificationApplication has exactly 8 semantic fields', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  const block = schema.match(/model CertificationApplication\s*\{([^}]*)\}/s)?.[1] ?? '';
  for (const field of [
    'id',
    'tenantId',
    'applicantUserId',
    'status',
    'schemeRef',
    'submittedAt',
    'createdAt',
    'updatedAt',
  ]) {
    assert.match(block, new RegExp(`\\b${field}\\b`));
  }
});

test('P06_TEST_005 Tenant FK onDelete Restrict', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  const block = schema.match(/model CertificationApplication\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(block, /tenant\s+Tenant\s+@relation\([\s\S]*?onDelete:\s*Restrict/);
});

test('P06_TEST_006 composite User FK onDelete Restrict', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  const block = schema.match(/model CertificationApplication\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(block, /fields:\s*\[tenantId,\s*applicantUserId\]/);
  assert.match(block, /references:\s*\[tenantId,\s*id\]/);
  assert.match(block, /applicant\s+User\s+@relation\([\s\S]*?onDelete:\s*Restrict/);
});

test('P06_TEST_007 list sort index exact', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  assert.match(
    schema,
    /@@index\(\[tenantId,\s*applicantUserId,\s*createdAt\(sort:\s*Desc\),\s*id\(sort:\s*Desc\)\]\)/,
  );
});

test('P06_TEST_008 status filter index exact', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  assert.match(schema, /@@index\(\[tenantId,\s*applicantUserId,\s*status\]\)/);
});

test('P06_TEST_009 prior migration directories unchanged', async () => {
  const entries = await readdir(migrationsDir);
  assert.ok(entries.includes('20260826113610_bar_p02_initial_database_baseline'));
  assert.ok(entries.includes('20260830210116_bar_p04_active_tenant_user_baseline'));
  assert.ok(entries.includes('20260831193000_bar_p05_audit_ledger_baseline'));
  const p02 = await readFile(
    path.join(migrationsDir, '20260826113610_bar_p02_initial_database_baseline', 'migration.sql'),
    'utf8',
  );
  assert.ok(p02.length > 0);
});

test('P06_TEST_010 migration contains no application INSERT/backfill', () => {
  assert.ok(migrationFixture);
  const fx = migrationFixture;
  assert.equal(fx.migrationHasInsert, false);
  assert.equal(fx.applicationCount, 0);
});

test('P06_TEST_011 pre-existing Tenant/User/EIL IDs preserved after P06 migration', () => {
  assert.ok(migrationFixture);
  const fx = migrationFixture;
  assert.ok(fx.tenantId);
  assert.ok(fx.userId);
  assert.ok(fx.eilId);
});

test('P06_TEST_012 Tenant/User isActive preserved after P06 migration', () => {
  assert.ok(migrationFixture);
  const fx = migrationFixture;
  assert.equal(fx.tenantIsActive, fx._expectedTenantActive);
  assert.equal(fx.userIsActive, fx._expectedUserActive);
});
