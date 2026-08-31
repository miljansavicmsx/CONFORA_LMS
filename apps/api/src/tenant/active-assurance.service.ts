import { Injectable } from '@nestjs/common';

import type { AuthenticatedActor } from '../auth/request-principal';
import { PrismaService } from '../prisma/prisma.service';
import { AccessDeniedError } from './tenant-errors';

/**
 * BAR-P04 active Tenant + User assurance (OD-P04-11/12/28).
 * Authorized raw PrismaService consumer. Failures are indistinguishable.
 */
@Injectable()
export class ActiveAssuranceService {
  constructor(private readonly prisma: PrismaService) {}

  async assertActiveTenantAndUser(actor: AuthenticatedActor): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: actor.tenantId },
      select: { id: true, isActive: true },
    });
    if (!tenant || !tenant.isActive) {
      throw new AccessDeniedError();
    }

    const user = await this.prisma.user.findUnique({
      where: {
        tenantId_id: {
          tenantId: actor.tenantId,
          id: actor.userId,
        },
      },
      select: { id: true, tenantId: true, isActive: true },
    });
    if (!user || user.tenantId !== actor.tenantId || !user.isActive) {
      throw new AccessDeniedError();
    }
  }
}
