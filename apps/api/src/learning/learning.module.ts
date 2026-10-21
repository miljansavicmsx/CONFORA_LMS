import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { TenantModule } from '../tenant/tenant.module';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';

@Module({
  imports: [TenantModule, AuditModule],
  controllers: [LearningController],
  providers: [LearningService, LearnerRolesGuard],
})
export class LearningModule {}
