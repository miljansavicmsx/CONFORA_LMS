import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { PrismaClient } from '@prisma/client';

import {
  SEEDED_DEFAULT_TENANT_ID,
  SEEDED_SYSTEM_USER_EMAIL,
  SEEDED_SYSTEM_USER_ID,
  seedCanonicalBaseline,
} from '../src/seed.js';

test('canonical seed source does not write audit, certificate, or decision rows', async () => {
  const source = await readFile(new URL('../src/seed.ts', import.meta.url), 'utf8');
  assert.equal(SEEDED_DEFAULT_TENANT_ID, '00000000-0000-4000-8000-000000000001');
  assert.doesNotMatch(source, /auditEvent\./u);
  assert.doesNotMatch(source, /certificationApplication\./u);
  assert.doesNotMatch(source, /complaintCase\./u);
  assert.doesNotMatch(source, /appealCase\./u);
  assert.doesNotMatch(source, /\bINSERT\b/u);
});

test('canonical seed upserts the default tenant and synthetic system user', async () => {
  const prisma = new PrismaClient();
  try {
    const first = await seedCanonicalBaseline(prisma);
    const second = await seedCanonicalBaseline(prisma);
    assert.equal(first.tenantId, SEEDED_DEFAULT_TENANT_ID);
    assert.equal(second.tenantId, SEEDED_DEFAULT_TENANT_ID);
    assert.equal(second.createdTenant, false);
    assert.equal(second.createdUser, false);

    const tenant = await prisma.tenant.findUniqueOrThrow({
      where: { id: SEEDED_DEFAULT_TENANT_ID },
    });
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        tenantId_email: {
          tenantId: SEEDED_DEFAULT_TENANT_ID,
          email: SEEDED_SYSTEM_USER_EMAIL,
        },
      },
    });
    assert.equal(tenant.isActive, true);
    assert.equal(user.id, SEEDED_SYSTEM_USER_ID);
    assert.equal(user.tenantId, SEEDED_DEFAULT_TENANT_ID);
    assert.equal(user.isActive, true);
    assert.equal(
      await prisma.auditEvent.count({ where: { tenantId: SEEDED_DEFAULT_TENANT_ID } }),
      0,
    );
    assert.equal(await prisma.user.count({ where: { email: SEEDED_SYSTEM_USER_EMAIL } }), 1);
  } finally {
    await prisma.$disconnect();
  }
});
