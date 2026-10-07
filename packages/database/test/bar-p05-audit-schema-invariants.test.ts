import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('P05_TEST_001 AuditEvent and AuditChainHead exist among historical models', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
  for (const name of [
    'Tenant',
    'User',
    'ExternalIdentityLink',
    'CertificationApplication',
    'AuditEvent',
    'AuditChainHead',
  ]) {
    assert.match(schema, new RegExp(`^model ${name}\\b`, 'm'), name);
  }
  const auditEvent = schema.match(/^model AuditEvent \{[\s\S]*?^\}/m)?.[0] ?? '';
  const chainHead = schema.match(/^model AuditChainHead \{[\s\S]*?^\}/m)?.[0] ?? '';
  assert.ok(auditEvent.length > 0);
  assert.ok(chainHead.length > 0);
  assert.doesNotMatch(auditEvent, /\brole\b/);
  assert.doesNotMatch(chainHead, /\brole\b/);
  // ComplaintCase and AppealCase are later domain models, not audit models.
  assert.doesNotMatch(auditEvent, /ComplaintCase|AppealCase/);
  assert.doesNotMatch(chainHead, /ComplaintCase|AppealCase/);
});

test('P05_TEST_002 AuditOutcome exactly SUCCESS/DENIED/FAILURE', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
  assert.equal((schema.match(/^enum /gm) ?? []).length, 2);
  const block = schema.match(/enum AuditOutcome\s*\{([^}]*)\}/)?.[1] ?? '';
  const values = block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'));
  assert.deepEqual(values, ['SUCCESS', 'DENIED', 'FAILURE']);
  const statusBlock = schema.match(/enum CertificationApplicationStatus\s*\{([^}]*)\}/)?.[1] ?? '';
  const statusValues = statusBlock
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'));
  assert.deepEqual(statusValues, ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']);
});

test('P05_TEST_003 Tenant FK is restrictive', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
  const auditEventBlock = schema.slice(schema.indexOf('model AuditEvent'));
  assert.match(auditEventBlock, /tenant Tenant @relation\([\s\S]*?onDelete: Restrict/);
});

test('P05_TEST_004 Actor composite tenant/user FK restrictive', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
  assert.match(schema, /fields:\s*\[tenantId,\s*actorUserId\]/);
  assert.match(schema, /references:\s*\[tenantId,\s*id\]/);
  const actorRel = schema.match(/actor\s+User\s+@relation\(([\s\S]*?)\)/);
  assert.ok(actorRel && actorRel[1]);
  assert.match(actorRel[1], /onDelete:\s*Restrict/);
});

test('P05_TEST_005 tenantId+sequence unique', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
  assert.match(schema, /@@unique\(\[tenantId,\s*sequence\]\)/);
});

test('P05_TEST_006 tenantId+idempotencyKey unique', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
  assert.match(schema, /@@unique\(\[tenantId,\s*idempotencyKey\]\)/);
});

test('P05_TEST_007 Hash columns CHAR(64) required', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
  assert.match(schema, /prevHash\s+String\s+@db\.Char\(64\)/);
  assert.match(schema, /payloadHash\s+String\s+@db\.Char\(64\)/);
  assert.match(schema, /chainHash\s+String\s+@db\.Char\(64\)/);
  assert.match(schema, /lastHash\s+String\s+@db\.Char\(64\)/);
});
