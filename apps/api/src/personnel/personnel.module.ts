import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { LearnerRolesGuard } from '../auth/learner-roles.guard';
import { ExamCommitteeRolesGuard } from '../exam/exam-roles.guard';
import { TenantModule } from '../tenant/tenant.module';
import {
  DirectoryConsentAdministratorGuard,
  DirectoryConsentVerifierGuard,
} from './directory-consent.guard';
import {
  CandidateCertificateController,
  CommitteeCertificateController,
  PublicCertificateController,
  StaffDirectoryConsentController,
  StaffDirectoryConsentVerificationController,
} from './personnel.controller';
import { PersonnelCertificateService } from './personnel.service';

@Module({
  imports: [TenantModule, AuditModule],
  controllers: [
    CommitteeCertificateController,
    CandidateCertificateController,
    PublicCertificateController,
    StaffDirectoryConsentController,
    StaffDirectoryConsentVerificationController,
  ],
  providers: [
    PersonnelCertificateService,
    ExamCommitteeRolesGuard,
    LearnerRolesGuard,
    DirectoryConsentAdministratorGuard,
    DirectoryConsentVerifierGuard,
  ],
})
export class PersonnelCertificateModule {}
