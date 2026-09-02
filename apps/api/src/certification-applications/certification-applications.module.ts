import { Module } from '@nestjs/common';

import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { TenantModule } from '../tenant/tenant.module';
import { CertificationApplicationsController } from './certification-applications.controller';
import { CertificationApplicationsService } from './certification-applications.service';

@Module({
  imports: [TenantModule],
  controllers: [CertificationApplicationsController],
  providers: [CertificationApplicationsService, LearnerRolesGuard],
})
export class CertificationApplicationsModule {}
