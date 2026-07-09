import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { CertApplicationsReadModule } from './cert-applications-read/cert-applications-read.module';
import { CertApplicationsStaffAssignModule } from './cert-applications-staff-assign/cert-applications-staff-assign.module';
import { CertApplicationsStaffBeginReviewModule } from './cert-applications-staff-begin-review/cert-applications-staff-begin-review.module';
import { CertApplicationsStaffEligibilityModule } from './cert-applications-staff-eligibility/cert-applications-staff-eligibility.module';
import { CertApplicationsStaffExamAuthorizationModule } from './cert-applications-staff-exam-authorization/cert-applications-staff-exam-authorization.module';
import { CertApplicationsStaffCertificationDecisionModule } from './cert-applications-staff-certification-decision/cert-applications-staff-certification-decision.module';
import { CertApplicationsStaffCertificateIssuanceModule } from './cert-applications-staff-certificate-issuance/cert-applications-staff-certificate-issuance.module';
import { CertLifecycleModule } from './cert-lifecycle/cert-lifecycle.module';
import { CertRecertificationModule } from './cert-recertification/cert-recertification.module';
import { CertAppealsModule } from './cert-appeals/cert-appeals.module';
import { CertComplaintsModule } from './cert-complaints/cert-complaints.module';
import { ContactRequestsModule } from './contact-requests/contact-requests.module';
import { LegacyCompatModule } from './legacy-compat/legacy-compat.module';
import { LmsCatalogPilotModule } from './lms/lms-catalog-pilot.module';
import { LmsEducationPilotModule } from './lms/education/lms-education-pilot.module';
import { ReportsModule } from './reports/reports.module';
import { CertApplicationsStaffExamAttemptsModule } from './cert-applications-staff-exam-attempts/cert-applications-staff-exam-attempts.module';
import { CertApplicationsStaffExamSessionsModule } from './cert-applications-staff-exam-sessions/cert-applications-staff-exam-sessions.module';
import { CertApplicationsStaffReadModule } from './cert-applications-staff-read/cert-applications-staff-read.module';
import { CertApplicationsWriteModule } from './cert-applications-write/cert-applications-write.module';
import { CertWalletModule } from './cert-wallet/cert-wallet.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExamRegistrationMeModule } from './exam-registration-me/exam-registration-me.module';
import { StaffIdentityReviewModule } from './identity-review/staff-identity-review.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PdfModule } from './pdf/pdf.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantAccessViolationFilter } from './prisma/tenant-access-violation.filter';
import { VerifyModule } from './verify/verify.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    ScheduleModule.forRoot(),
    TenantModule,
    AuthModule,
    AuditModule,
    NotificationsModule,
    AiModule,
    PdfModule,
    VerifyModule,
    CertWalletModule,
    CertApplicationsReadModule,
    CertApplicationsStaffReadModule,
    CertApplicationsStaffAssignModule,
    CertApplicationsStaffBeginReviewModule,
    CertApplicationsStaffEligibilityModule,
    CertApplicationsStaffExamAuthorizationModule,
    CertApplicationsStaffExamSessionsModule,
    CertApplicationsStaffExamAttemptsModule,
    CertApplicationsStaffCertificationDecisionModule,
    CertApplicationsStaffCertificateIssuanceModule,
    CertLifecycleModule,
    CertRecertificationModule,
    CertAppealsModule,
    CertComplaintsModule,
    ContactRequestsModule,
    LegacyCompatModule,
    LmsCatalogPilotModule,
    LmsEducationPilotModule,
    ExamRegistrationMeModule,
    ReportsModule,
    CertApplicationsWriteModule,
    DashboardModule,
    StaffIdentityReviewModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: TenantAccessViolationFilter }],
})
export class AppModule {}
