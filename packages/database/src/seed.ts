import { pathToFileURL } from 'node:url';

import { PrismaClient } from '@prisma/client';

/**
 * Canonical baseline seed for `pnpm run seed` after `prisma migrate deploy`.
 *
 * Creates the documented default tenant and one synthetic system user.
 * Idempotent. Does not write audit events, certificates, or certification decisions.
 * A later run does not reactivate a tenant or user that has been deactivated.
 */
export const SEEDED_DEFAULT_TENANT_ID = '00000000-0000-4000-8000-000000000001';
export const SEEDED_SYSTEM_USER_ID = '00000000-0000-4000-8000-000000000002';
export const SEEDED_SYSTEM_USER_EMAIL = 'system@example.test';

export async function seedCanonicalBaseline(prisma: PrismaClient): Promise<{
  tenantId: string;
  userId: string;
  createdTenant: boolean;
  createdUser: boolean;
}> {
  const existingTenant = await prisma.tenant.findUnique({
    where: { id: SEEDED_DEFAULT_TENANT_ID },
  });
  if (!existingTenant) {
    await prisma.tenant.create({
      data: { id: SEEDED_DEFAULT_TENANT_ID, isActive: true },
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      tenantId_email: {
        tenantId: SEEDED_DEFAULT_TENANT_ID,
        email: SEEDED_SYSTEM_USER_EMAIL,
      },
    },
  });
  if (!existingUser) {
    const idTaken = await prisma.user.findUnique({ where: { id: SEEDED_SYSTEM_USER_ID } });
    if (idTaken) {
      throw new Error(
        `Cannot seed ${SEEDED_SYSTEM_USER_EMAIL}: id ${SEEDED_SYSTEM_USER_ID} is already used`,
      );
    }
    await prisma.user.create({
      data: {
        id: SEEDED_SYSTEM_USER_ID,
        tenantId: SEEDED_DEFAULT_TENANT_ID,
        email: SEEDED_SYSTEM_USER_EMAIL,
        isActive: true,
      },
    });
  }

  return {
    tenantId: SEEDED_DEFAULT_TENANT_ID,
    userId: existingUser?.id ?? SEEDED_SYSTEM_USER_ID,
    createdTenant: !existingTenant,
    createdUser: !existingUser,
  };
}

async function main(): Promise<void> {
  if (!process.env['DATABASE_URL']) {
    throw new Error('DATABASE_URL is required to seed the canonical baseline.');
  }
  const prisma = new PrismaClient();
  try {
    const seeded = await seedCanonicalBaseline(prisma);
    console.log(
      `Seeded canonical baseline tenant ${seeded.tenantId} user ${seeded.userId} createdTenant=${String(seeded.createdTenant)} createdUser=${String(seeded.createdUser)}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  void main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
