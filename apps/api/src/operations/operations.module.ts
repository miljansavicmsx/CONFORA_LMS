import { Module } from '@nestjs/common';

import { AnnualFeeService } from '../annual-fee/annual-fee.service';
import { AuditModule } from '../audit/audit.module';
import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { ExamCommitteeRolesGuard, ExamStaffRolesGuard } from '../exam/exam-roles.guard';
import { NoticeService } from '../notices/notice.service';
import { TenantModule } from '../tenant/tenant.module';
import {
  CommitteeAnnualFeeController,
  LearnerAnnualFeeController,
  LearnerNoticeController,
  SchemeAnnualFeeController,
  StaffNoticeController,
} from './operations.controller';

@Module({
  imports: [TenantModule, AuditModule],
  controllers: [
    SchemeAnnualFeeController,
    LearnerNoticeController,
    StaffNoticeController,
    LearnerAnnualFeeController,
    CommitteeAnnualFeeController,
  ],
  providers: [
    AnnualFeeService,
    NoticeService,
    ExamStaffRolesGuard,
    ExamCommitteeRolesGuard,
    LearnerRolesGuard,
  ],
})
export class OperationsModule {}
