import { ForbiddenException } from '@nestjs/common';

import { TenantAccessViolationError } from '../prisma/tenant-prisma.util';
import type { ConforaUser } from './types/confora-user';

export type ActorDbAccess = {
  readonly userId: string;
  readonly tenantId: string;
};

type ActorUserRow = {
  readonly id: string;
  readonly tenantId: string;
};

/**
 * Lookup port for the historical helper. The shipping PrismaService has no `db`
 * property and does not resolve users by email.
 */
export type ActorUserLookup = {
  readonly user: {
    findUnique: (args: { where: { id?: string; email?: string } }) => Promise<ActorUserRow | null>;
  };
};

type ActorResolution = {
  readonly userId: string | null;
  readonly tenantId: string | null;
};

async function resolveAuthUserIdWithMeta(
  db: ActorUserLookup,
  actor: ConforaUser,
): Promise<ActorResolution> {
  const email = actor.payload.email;
  if (!email) {
    return { userId: null, tenantId: null };
  }
  const row = await db.user.findUnique({ where: { email } });
  if (!row) {
    return { userId: null, tenantId: null };
  }
  return { userId: row.id, tenantId: row.tenantId };
}

/**
 * Resolve an authenticated actor to a DB user and tenant for learner wallet
 * and recertification helpers that are outside the Nest build.
 * Converts expected cross-tenant Prisma guard violations into HTTP 403.
 * This is not the BAR-P03 identity resolver.
 */
export async function resolveActorDbAccess(
  db: ActorUserLookup,
  actor: ConforaUser,
): Promise<ActorDbAccess> {
  try {
    const resolution = await resolveAuthUserIdWithMeta(db, actor);
    if (!resolution.userId || !resolution.tenantId) {
      throw new ForbiddenException('User not found.');
    }

    const jwtTenantId = actor.tenantContext?.tenantId;
    if (jwtTenantId && resolution.tenantId !== jwtTenantId) {
      throw new ForbiddenException('Tenant mismatch.');
    }

    const tenantId = jwtTenantId ?? resolution.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Missing tenant_id claim in access token');
    }

    return { userId: resolution.userId, tenantId };
  } catch (error) {
    if (error instanceof ForbiddenException) {
      throw error;
    }
    if (error instanceof TenantAccessViolationError) {
      throw new ForbiddenException('Tenant mismatch.');
    }
    throw error;
  }
}
