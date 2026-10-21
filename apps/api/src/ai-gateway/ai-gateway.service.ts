import { BadRequestException, Injectable } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import type { AuthenticatedActor } from '../auth/request-principal';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { AccessDeniedError } from '../tenant/tenant-errors';
import { AiGatewayError, completeAiUse, type AiGatewayResult } from './ai-gateway';
import { selectAiProvider } from './ai-provider';

@Injectable()
export class AiGatewayService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly audit: AuditService,
  ) {}

  async complete(
    actor: AuthenticatedActor,
    request: { purpose: string; dataCategory: string; system: string; prompt: string },
  ): Promise<AiGatewayResult> {
    const now = new Date();
    const budget = await this.tenantPrisma.aiBudget.load(now);
    try {
      return await completeAiUse({
        request,
        provider: selectAiProvider(),
        budget,
        persistUsage: (promptUnits, completionUnits, costMinor) =>
          this.tenantPrisma.aiBudget.consume(now, promptUnits, completionUnits, costMinor),
        record: async (entry) => {
          await this.audit.append(actor, {
            idempotencyKey: entry.useId,
            eventType: 'AI_USE_RECORDED',
            outcome: entry.outcome,
            occurredAt: now,
            resourceType: 'AiUse',
            resourceId: entry.useId,
            metadata: {
              purpose: request.purpose.trim() || 'unspecified',
              model: entry.model,
              dataCategory: entry.dataCategory,
              promptUnits: entry.promptUnits,
              completionUnits: entry.completionUnits,
              costMinor: entry.costMinor,
              humanValidationRequired: true,
              decides: false,
              requestedBy: actor.userId,
            },
          });
        },
      });
    } catch (error) {
      if (error instanceof AiGatewayError && error.code === 'BUDGET_EXCEEDED') {
        throw new AccessDeniedError();
      }
      if (error instanceof AiGatewayError) {
        throw new BadRequestException(error.code);
      }
      throw error;
    }
  }
}
