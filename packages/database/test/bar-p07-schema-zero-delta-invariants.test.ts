import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(packageRoot, '..', '..');
const schemaPath = path.join(packageRoot, 'prisma', 'schema.prisma');
const migrationsDir = path.join(packageRoot, 'prisma', 'migrations');
const BASE_SHA = 'c6d09d5dfbf542f92b091f06875bae1819b74efc';
const BAR_P07_COMMIT = '9acf699d55a3cb472850f33c0f31d331dc0eaad9';
const HISTORICAL_MODELS = [
  'Tenant',
  'User',
  'ExternalIdentityLink',
  'CertificationApplication',
  'AuditEvent',
  'AuditChainHead',
] as const;
const PROTECTED_BLOCKS = ['AuditEvent', 'AuditChainHead', 'CertificationApplication'] as const;

function modelBlock(source: string, name: string): string {
  const match = new RegExp(`^model ${name} \\{[\\s\\S]*?^\\}`, 'm').exec(source);
  assert.ok(match, `model ${name} is missing`);
  return match[0];
}

function commitPaths(commit: string, pathspec: string): string[] {
  return execSync(`git diff --name-only "${commit}^" "${commit}" -- ${pathspec}`, {
    cwd: repoRoot,
    encoding: 'utf8',
  })
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

test('P07_TEST_001 historical Prisma models remain present', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  const models = [...schema.matchAll(/^model\s+(\w+)/gm)].map((match) => match[1]);
  for (const name of HISTORICAL_MODELS) {
    assert.equal(models.includes(name), true, name);
  }
  assert.equal(models.includes('Report'), false);
});

test('P07_TEST_002 Prisma enum count remains 2', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  const enums = [...schema.matchAll(/^enum\s+(\w+)/gm)].map((m) => m[1]);
  assert.equal(enums.length, 2);
});

test('P07_TEST_003 BAR-P07 commit left schema.prisma unchanged', async () => {
  assert.deepEqual(commitPaths(BAR_P07_COMMIT, 'packages/database/prisma/schema.prisma'), []);
  const baseline = execSync(`git show ${BASE_SHA}:packages/database/prisma/schema.prisma`, {
    cwd: repoRoot,
    encoding: 'utf8',
  }).replace(/\r\n/g, '\n');
  const disk = (await readFile(schemaPath, 'utf8')).replace(/\r\n/g, '\n');
  for (const name of PROTECTED_BLOCKS) {
    assert.equal(modelBlock(disk, name), modelBlock(baseline, name), name);
  }
  assert.doesNotMatch(modelBlock(disk, 'User'), /\brole\b/u);
  assert.doesNotMatch(disk, /^model Report\b/m);
  for (const name of HISTORICAL_MODELS) {
    assert.match(disk, new RegExp(`^model ${name}\\b`, 'm'), name);
  }
});

test('P07_TEST_004 BAR-P07 commit left the migration directory unchanged', async () => {
  assert.deepEqual(commitPaths(BAR_P07_COMMIT, 'packages/database/prisma/migrations'), []);
  const baseList = execSync(
    `git ls-tree --name-only ${BASE_SHA}:packages/database/prisma/migrations`,
    {
      cwd: repoRoot,
      encoding: 'utf8',
    },
  )
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  const now = (await readdir(migrationsDir)).filter((name) => name !== '.gitkeep');
  for (const name of baseList) {
    assert.equal(now.includes(name), true, name);
  }
  assert.equal(
    now.some((name) => /p07|report/i.test(name)),
    false,
  );
});

test('P07_TEST_089 schema/migration zero delta', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  assert.match(schema, /model CertificationApplication/);
  assert.doesNotMatch(schema, /model Report/);
  const migrations = await readdir(migrationsDir);
  assert.ok(!migrations.some((name) => /p07|report/i.test(name)));
});
