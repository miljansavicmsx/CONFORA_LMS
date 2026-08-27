import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const id = () => crypto.randomUUID();
const rejects = (operation: Promise<unknown>) => assert.rejects(operation);

test.after(async () => prisma.$disconnect());

test('01 Tenant UUID primary key insert/read', async () => {
  const tenant = await prisma.tenant.create({ data: { id: id() } });
  assert.equal((await prisma.tenant.findUnique({ where: { id: tenant.id } }))?.id, tenant.id);
});

test('02 User requires an existing tenant', async () => {
  await rejects(prisma.user.create({ data: { id: id(), tenantId: id(), email: 'missing@example.test' } }));
});

test('03 same email is allowed across tenants', async () => {
  const a = await prisma.tenant.create({ data: { id: id() } }); const b = await prisma.tenant.create({ data: { id: id() } });
  await prisma.user.create({ data: { id: id(), tenantId: a.id, email: 'same@example.test' } });
  await prisma.user.create({ data: { id: id(), tenantId: b.id, email: 'same@example.test' } });
});

test('04 same email is rejected within one tenant', async () => {
  const tenant = await prisma.tenant.create({ data: { id: id() } });
  await prisma.user.create({ data: { id: id(), tenantId: tenant.id, email: 'duplicate@example.test' } });
  await rejects(prisma.user.create({ data: { id: id(), tenantId: tenant.id, email: 'duplicate@example.test' } }));
});

test('05 identity link requires a tenant-qualified user', async () => {
  await rejects(prisma.externalIdentityLink.create({ data: { id: id(), tenantId: id(), userId: id(), issuer: 'https://issuer.test', subject: 'missing' } }));
});

test('06 cross-tenant identity link is rejected by the database', async () => {
  const a = await prisma.tenant.create({ data: { id: id() } }); const b = await prisma.tenant.create({ data: { id: id() } });
  const user = await prisma.user.create({ data: { id: id(), tenantId: a.id, email: 'a@example.test' } });
  await rejects(prisma.externalIdentityLink.create({ data: { id: id(), tenantId: b.id, userId: user.id, issuer: 'https://issuer.test', subject: 'cross' } }));
});

test('07 same external identity is allowed across tenants', async () => {
  const a = await prisma.tenant.create({ data: { id: id() } }); const b = await prisma.tenant.create({ data: { id: id() } });
  const ua = await prisma.user.create({ data: { id: id(), tenantId: a.id, email: 'ia@example.test' } }); const ub = await prisma.user.create({ data: { id: id(), tenantId: b.id, email: 'ib@example.test' } });
  await prisma.externalIdentityLink.create({ data: { id: id(), tenantId: a.id, userId: ua.id, issuer: 'https://issuer.test', subject: 'shared' } });
  await prisma.externalIdentityLink.create({ data: { id: id(), tenantId: b.id, userId: ub.id, issuer: 'https://issuer.test', subject: 'shared' } });
});

test('08 duplicate external identity is rejected within a tenant', async () => {
  const t = await prisma.tenant.create({ data: { id: id() } }); const u = await prisma.user.create({ data: { id: id(), tenantId: t.id, email: 'i@example.test' } });
  const data = { tenantId: t.id, userId: u.id, issuer: 'https://issuer.test', subject: 'duplicate' };
  await prisma.externalIdentityLink.create({ data: { id: id(), ...data } }); await rejects(prisma.externalIdentityLink.create({ data: { id: id(), ...data } }));
});

test('09 deleting a tenant with users is rejected', async () => {
  const t = await prisma.tenant.create({ data: { id: id() } }); await prisma.user.create({ data: { id: id(), tenantId: t.id, email: 'delete-tenant@example.test' } });
  await rejects(prisma.tenant.delete({ where: { id: t.id } }));
});

test('10 deleting a user with identity links is rejected', async () => {
  const t = await prisma.tenant.create({ data: { id: id() } }); const u = await prisma.user.create({ data: { id: id(), tenantId: t.id, email: 'delete-user@example.test' } });
  await prisma.externalIdentityLink.create({ data: { id: id(), tenantId: t.id, userId: u.id, issuer: 'https://issuer.test', subject: 'delete' } }); await rejects(prisma.user.delete({ where: { id: u.id } }));
});

test('11 only approved application tables exist', async () => {
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name <> '_prisma_migrations'`;
  assert.deepEqual(tables.map(({ table_name }) => table_name).sort(), ['ExternalIdentityLink', 'Tenant', 'User']);
});

test('12 schema contains no unapproved persistence fields', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
  for (const field of ['createdAt', 'updatedAt', 'deletedAt', 'status', 'mfa', 'password', 'accessToken', 'refreshToken']) assert.equal(schema.toLowerCase().includes(field.toLowerCase()), false);
});
