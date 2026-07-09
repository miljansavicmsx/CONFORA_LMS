import { ForbiddenException } from '@nestjs/common';

import { TenantAccessViolationError } from '../prisma/tenant-prisma.util';
import type { PrismaService } from '../prisma/prisma.service';
import { resolveAuthUserIdWithMeta } from './resolve-db-user';
import type { ConforaUser } from './types/confora-user';

export type ActorDbAccess = {
  readonly userId: string;
  readonly tenantId: string;
};

/**
 * Resolve authenticated actor to DB user + tenant for learner wallet / recert flows.
 * Converts expected cross-tenant Prisma guard violations into HTTP 403.
 */
export async function resolveActorDbAccess(
  db: PrismaService['db'],
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
