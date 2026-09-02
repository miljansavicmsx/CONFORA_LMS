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

test('P07_TEST_001 Prisma model count remains 6', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  const models = [...schema.matchAll(/^model\s+(\w+)/gm)].map((m) => m[1]);
  assert.equal(models.length, 6);
});

test('P07_TEST_002 Prisma enum count remains 2', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  const enums = [...schema.matchAll(/^enum\s+(\w+)/gm)].map((m) => m[1]);
  assert.equal(enums.length, 2);
});

test('P07_TEST_003 schema.prisma remains unchanged from base', async () => {
  const base = execSync(`git show ${BASE_SHA}:packages/database/prisma/schema.prisma`, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const disk = await readFile(schemaPath, 'utf8');
  assert.equal(disk.replace(/\r\n/g, '\n'), base.replace(/\r\n/g, '\n'));
});

test('P07_TEST_004 migration directory delta = 0', async () => {
  const baseList = execSync(
    `git ls-tree --name-only ${BASE_SHA}:packages/database/prisma/migrations`,
    {
      cwd: repoRoot,
      encoding: 'utf8',
    },
  )
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .sort();
  const now = (await readdir(migrationsDir)).filter((n) => n !== '.gitkeep').sort();
  assert.deepEqual(now, baseList);
});

test('P07_TEST_089 schema/migration zero delta', async () => {
  const schema = await readFile(schemaPath, 'utf8');
  assert.match(schema, /model CertificationApplication/);
  assert.doesNotMatch(schema, /model Report/);
  const migrations = await readdir(migrationsDir);
  assert.ok(!migrations.some((name) => /p07|report/i.test(name)));
});
