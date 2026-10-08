import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const id = () => crypto.randomUUID();

test.after(async () => prisma.$disconnect());

test('BAR-P04 Tenant.isActive and User.isActive exist with default false', async () => {
  const tenant = await prisma.tenant.create({ data: { id: id() } });
  const user = await prisma.user.create({
    data: { id: id(), tenantId: tenant.id, email: `p04-${id()}@example.test` },
  });
  assert.equal(tenant.isActive, false);
  assert.equal(user.isActive, false);

  const t2 = await prisma.tenant.findUniqueOrThrow({ where: { id: tenant.id } });
  const u2 = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  assert.equal(t2.isActive, false);
  assert.equal(u2.isActive, false);
});

function enumMembers(schema: string, name: string): string[] {
  const block = schema.match(new RegExp(`^enum ${name} \\{([\\s\\S]*?)^\\}`, 'm'))?.[1] ?? '';
  assert.ok(block.trim().length > 0, `enum ${name} is missing`);
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));
}

test('BAR-P04 identity constraints preserved; historical models remain present', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
  // Historical models remain required. Later authorized models may coexist.
  assert.match(schema, /model Tenant\b/);
  assert.match(schema, /model User\b/);
  assert.match(schema, /model ExternalIdentityLink/);
  assert.match(schema, /model AuditEvent\b/);
  assert.match(schema, /model AuditChainHead\b/);
  assert.match(schema, /model CertificationApplication\b/);
  // Protected enum definitions remain. Later authorized enums may coexist.
  const enumNames = [...schema.matchAll(/^enum\s+(\w+)/gm)].map((match) => match[1]);
  for (const name of ['AuditOutcome', 'CertificationApplicationStatus']) {
    assert.equal(enumNames.includes(name), true, name);
  }
  assert.deepEqual(enumMembers(schema, 'AuditOutcome'), ['SUCCESS', 'DENIED', 'FAILURE']);
  assert.deepEqual(enumMembers(schema, 'CertificationApplicationStatus'), [
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
  ]);
  const tenantBlock = schema.match(/^model Tenant \{[\s\S]*?^\}/m)?.[0] ?? '';
  const userBlock = schema.match(/^model User \{[\s\S]*?^\}/m)?.[0] ?? '';
  const eilBlock = schema.match(/^model ExternalIdentityLink \{[\s\S]*?^\}/m)?.[0] ?? '';
  assert.equal(tenantBlock.toLowerCase().includes('status'), false);
  assert.equal(userBlock.toLowerCase().includes('status'), false);
  assert.equal(eilBlock.toLowerCase().includes('status'), false);
  assert.equal(tenantBlock.toLowerCase().includes('role'), false);
  assert.equal(userBlock.toLowerCase().includes('role'), false);
  assert.equal(eilBlock.toLowerCase().includes('role'), false);
  assert.match(schema, /@@unique\(\[tenantId, email\]\)/);
  assert.match(schema, /@@unique\(\[tenantId, id\]\)/);
  assert.match(schema, /@@unique\(\[tenantId, issuer, subject\]\)/);
  assert.match(schema, /isActive\s+Boolean\s+@default\(false\)/);
});

test('BAR-P04 can set isActive true explicitly for successful access fixtures', async () => {
  const tenant = await prisma.tenant.create({
    data: { id: id(), isActive: true },
  });
  const user = await prisma.user.create({
    data: {
      id: id(),
      tenantId: tenant.id,
      email: `p04-active-${id()}@example.test`,
      isActive: true,
    },
  });
  assert.equal(tenant.isActive, true);
  assert.equal(user.isActive, true);
});
