import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { ExamCommitteeRolesGuard } from '../exam/exam-roles.guard';
import { TenantModule } from '../tenant/tenant.module';
import { DirectoryConsentAdministratorGuard } from './directory-consent.guard';
import {
  CandidateCertificateController,
  CommitteeCertificateController,
  PublicCertificateController,
  StaffDirectoryConsentController,
} from './personnel.controller';
import { PersonnelCertificateService } from './personnel.service';

@Module({
  imports: [TenantModule, AuditModule],
  controllers: [
    CommitteeCertificateController,
    CandidateCertificateController,
    PublicCertificateController,
    StaffDirectoryConsentController,
  ],
  providers: [
    PersonnelCertificateService,
    ExamCommitteeRolesGuard,
    LearnerRolesGuard,
    DirectoryConsentAdministratorGuard,
  ],
})
export class PersonnelCertificateModule {}
