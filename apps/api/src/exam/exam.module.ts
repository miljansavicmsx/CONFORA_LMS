import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { TenantModule } from '../tenant/tenant.module';
import {
  CandidateExamController,
  CommitteeExamController,
  StaffExamController,
} from './exam.controller';
import { ExamCommitteeRolesGuard, ExamStaffRolesGuard } from './exam-roles.guard';
import { ExamService } from './exam.service';

@Module({
  imports: [TenantModule, AuditModule],
  controllers: [StaffExamController, CandidateExamController, CommitteeExamController],
  providers: [ExamService, ExamStaffRolesGuard, ExamCommitteeRolesGuard, LearnerRolesGuard],
})
export class ExamModule {}
