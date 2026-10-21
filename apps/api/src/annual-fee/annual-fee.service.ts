import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import type { AuthenticatedActor } from '../auth/request-principal';
import { FeeNotFoundError, FeeRuleError } from './annual-fee-store';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { AccessDeniedError } from '../tenant/tenant-errors';

@Injectable()
export class AnnualFeeService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly audit: AuditService,
  ) {}

  async save(
    actor: AuthenticatedActor,
    schemeVersionId: string,
    body: {
      annualAmountMinor: number;
      currency: string;
      firstYearIncluded: boolean;
      recertificationSeparate: boolean;
    },
  ) {
    const now = new Date();
    try {
      const saved = await this.tenantPrisma.fees.save({
        actor: { userId: actor.userId, roles: actor.roles },
        schemeVersionId,
        ...body,
      });
      await this.audit.append(actor, {
        idempotencyKey: randomUUID(),
        eventType: 'FEE_PRICE_SET',
        outcome: 'SUCCESS',
        occurredAt: now,
        resourceType: 'SchemeAnnualFee',
        resourceId: schemeVersionId,
        metadata: {
          kind: 'ANNUAL',
          status: 'DUE',
          currency: saved.currency,
          amountMinor: saved.annualAmountMinor,
          year: now.getUTCFullYear(),
          lifecycle: 'UNCHANGED',
          lifecycleUnchanged: true,
        },
      });
      return saved;
    } catch (error) {
      fail(error);
    }
  }

  read(actor: AuthenticatedActor, schemeVersionId: string) {
    return this.tenantPrisma.fees
      .read({ actor: { userId: actor.userId, roles: actor.roles }, schemeVersionId })
      .catch(fail);
  }

  listMine(actor: AuthenticatedActor) {
    return this.tenantPrisma.fees.listMine(actor.userId).catch(fail);
  }

  async openCase(
    actor: AuthenticatedActor,
    body: { credentialId: string; year: number; reason: string },
  ) {
    const now = new Date();
    try {
      const opened = await this.tenantPrisma.fees.openCase({
        actor: { userId: actor.userId, roles: actor.roles },
        ...body,
        now,
      });
      await this.audit.append(actor, {
        idempotencyKey: randomUUID(),
        eventType: 'FEE_OBLIGATION_OPENED',
        outcome: 'SUCCESS',
        occurredAt: now,
        resourceType: 'AnnualFeeObligation',
        resourceId: opened.obligationId,
        metadata: {
          kind: opened.kind,
          status: opened.status,
          currency: opened.currency,
          amountMinor: opened.amountMinor,
          year: opened.year,
          lifecycle: opened.lifecycle,
          lifecycleUnchanged: true,
        },
      });
      return opened;
    } catch (error) {
      fail(error);
    }
  }

  async chargeRecertification(
    actor: AuthenticatedActor,
    body: { credentialId: string; year: number },
  ) {
    const now = new Date();
    try {
      const charged = await this.tenantPrisma.fees.chargeRecertification({
        actor: { userId: actor.userId, roles: actor.roles },
        ...body,
      });
      await this.audit.append(actor, {
        idempotencyKey: randomUUID(),
        eventType: 'FEE_OBLIGATION_OPENED',
        outcome: 'SUCCESS',
        occurredAt: now,
        resourceType: 'AnnualFeeObligation',
        resourceId: charged.obligationId,
        metadata: {
          kind: charged.kind,
          status: charged.status,
          currency: charged.currency,
          amountMinor: charged.amountMinor,
          year: charged.year,
          lifecycle: charged.lifecycle,
          lifecycleUnchanged: true,
        },
      });
      return charged;
    } catch (error) {
      fail(error);
    }
  }
}

function fail(error: unknown): never {
  if (error instanceof FeeNotFoundError) {
    throw new NotFoundException();
  }
  if (error instanceof FeeRuleError && error.code === 'ROLE_SEPARATION') {
    throw new AccessDeniedError();
  }
  if (error instanceof FeeRuleError) {
    throw new BadRequestException(error.code);
  }
  throw error;
}
