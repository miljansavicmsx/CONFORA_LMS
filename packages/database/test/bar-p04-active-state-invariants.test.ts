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

test('BAR-P04 identity constraints preserved; BAR-P05 additive models/enum exact', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
  const modelMatches = schema.match(/^model /gm) ?? [];
  const enumMatches = schema.match(/^enum /gm) ?? [];
  // BAR-P04 baseline models remain; BAR-P05 adds AuditEvent + AuditChainHead; BAR-P06 adds CertificationApplication.
  assert.equal(modelMatches.length, 6);
  assert.match(schema, /model Tenant\b/);
  assert.match(schema, /model User\b/);
  assert.match(schema, /model ExternalIdentityLink/);
  assert.match(schema, /model AuditEvent\b/);
  assert.match(schema, /model AuditChainHead\b/);
  assert.match(schema, /model CertificationApplication\b/);
  // BAR-P05 adds AuditOutcome; BAR-P06 adds CertificationApplicationStatus.
  assert.equal(enumMatches.length, 2);
  assert.match(schema, /enum AuditOutcome\b/);
  assert.match(schema, /enum CertificationApplicationStatus\b/);
  const tenantBlock = schema.match(/model Tenant\s*\{([^}]*)\}/s)?.[1] ?? '';
  const userBlock = schema.match(/model User\s*\{([^}]*)\}/s)?.[1] ?? '';
  const eilBlock = schema.match(/model ExternalIdentityLink\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.equal(tenantBlock.toLowerCase().includes('status'), false);
  assert.equal(userBlock.toLowerCase().includes('status'), false);
  assert.equal(eilBlock.toLowerCase().includes('status'), false);
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
