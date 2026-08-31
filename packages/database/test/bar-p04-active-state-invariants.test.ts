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

test('BAR-P04 model count remains 3 and ExternalIdentityLink unchanged', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
  assert.equal((schema.match(/^model /gm) ?? []).length, 3);
  assert.match(schema, /model ExternalIdentityLink/);
  assert.doesNotMatch(schema, /\benum\b/);
  assert.equal(schema.toLowerCase().includes('status'), false);
  assert.match(schema, /@@unique\(\[tenantId, email\]\)/);
  assert.match(schema, /@@unique\(\[tenantId, id\]\)/);
  assert.match(schema, /@@unique\(\[tenantId, issuer, subject\]\)/);
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
