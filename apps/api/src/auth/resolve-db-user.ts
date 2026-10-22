import { ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

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

/**
 * Browser sign-in resolves the person before a request principal exists.
 * TenantPrismaService can read the tenant only from that principal, so it
 * cannot run this lookup. The raw client stays in this allowlisted module,
 * the same place JwtStrategy already uses for the same tenantId+issuer+subject key.
 */
@Injectable()
export class CanonicalUserResolver {
  constructor(private readonly prisma: PrismaService) {}

  resolve(key: CanonicalIdentityKey): Promise<CanonicalUserResolution> {
    return resolveCanonicalUser(this.prisma, key);
  }
}
