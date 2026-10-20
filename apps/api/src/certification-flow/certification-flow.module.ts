import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { ExamCommitteeRolesGuard, ExamStaffRolesGuard } from '../exam/exam-roles.guard';
import { TenantModule } from '../tenant/tenant.module';
import {
  CommitteeCaseController,
  CommitteeExamPassController,
  LearnerCaseController,
  LearnerDocumentController,
  PublicDocumentController,
  PublicRefereeController,
  SchemeCaseStaffController,
} from './certification-flow.controller';
import { CertificationFlowService } from './certification-flow.service';

@Module({
  imports: [TenantModule, AuditModule],
  controllers: [
    SchemeCaseStaffController,
    LearnerCaseController,
    LearnerDocumentController,
    CommitteeCaseController,
    CommitteeExamPassController,
    PublicDocumentController,
    PublicRefereeController,
  ],
  providers: [
    CertificationFlowService,
    ExamStaffRolesGuard,
    ExamCommitteeRolesGuard,
    LearnerRolesGuard,
  ],
})
export class CertificationFlowModule {}
