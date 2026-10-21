import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { ExamCommitteeRolesGuard } from '../exam/exam-roles.guard';
import { TenantModule } from '../tenant/tenant.module';
import {
  CandidateCertificateController,
  CommitteeCertificateController,
  PublicCertificateController,
} from './personnel.controller';
import { PersonnelCertificateService } from './personnel.service';

@Module({
  imports: [TenantModule, AuditModule],
  controllers: [
    CommitteeCertificateController,
    CandidateCertificateController,
    PublicCertificateController,
  ],
  providers: [PersonnelCertificateService, ExamCommitteeRolesGuard, LearnerRolesGuard],
})
export class PersonnelCertificateModule {}
