import { ForbiddenException } from '@nestjs/common';

import type { PrismaService } from '../prisma/prisma.service';

export type CanonicalIdentityKey = Readonly<{
  tenantId: string;
  issuer: string;
  subject: string;
}>;

export type CanonicalUserResolution = Readonly<{
  userId: string;
  tenantId: string;
  email: string;
}>;

type LinkedUser = Readonly<{
  id: string;
  tenantId: string;
  email: string;
}>;

/**
 * Canonical BAR-P03 identity resolution.
 * Lookup key: tenantId + issuer + subject → ExternalIdentityLink → User.
 * Forbidden: sub→User.id, global email lookup, JIT provisioning, auth-time writes.
 */
export async function resolveCanonicalUser(
  db: PrismaService,
  key: CanonicalIdentityKey,
): Promise<CanonicalUserResolution> {
  const link = await db.externalIdentityLink.findUnique({
    where: {
      tenantId_issuer_subject: {
        tenantId: key.tenantId,
        issuer: key.issuer,
        subject: key.subject,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          tenantId: true,
          email: true,
        },
      },
    },
  });

  if (!link) {
    throw new ForbiddenException('Identity link not found.');
  }

  // Runtime fail-closed for orphaned link rows (AUTH_20); Prisma types relation as required.
  const user = link.user as LinkedUser | null;
  if (user === null) {
    throw new ForbiddenException('Canonical user not found.');
  }

  if (user.tenantId !== key.tenantId) {
    throw new ForbiddenException('Tenant mismatch.');
  }

  return {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
  };
}
