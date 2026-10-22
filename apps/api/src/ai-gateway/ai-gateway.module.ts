import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { TenantModule } from '../tenant/tenant.module';
import { AiGatewayService } from './ai-gateway.service';

@Module({
  imports: [TenantModule, AuditModule],
  providers: [AiGatewayService],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
