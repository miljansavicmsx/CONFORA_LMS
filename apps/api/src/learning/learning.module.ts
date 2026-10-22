import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { TenantModule } from '../tenant/tenant.module';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { PublicCatalogController } from './public-catalog.controller';

@Module({
  imports: [TenantModule, AuditModule],
  controllers: [LearningController, PublicCatalogController],
  providers: [LearningService, LearnerRolesGuard],
})
export class LearningModule {}
