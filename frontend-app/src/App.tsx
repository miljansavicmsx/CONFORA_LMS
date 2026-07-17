import { Suspense, lazy, type JSX } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { AuditLogViewerGuard } from "@/pages/dashboard/AuditLogViewerGuard";
import { CertificationApplicationsQueueGuard } from "@/pages/dashboard/CertificationApplicationsQueueGuard";
import { CourseCreatorGuard } from "@/pages/dashboard/CourseCreatorGuard";
import { DashboardLayoutRoute } from "@/pages/dashboard/DashboardLayoutRoute";
import { AppealsCommitteeGuard } from "@/pages/dashboard/AppealsCommitteeGuard";
import { StaffAppealsComplaintsGuard } from "@/pages/dashboard/StaffAppealsComplaintsGuard";
import { CandidateCertificationGuard } from "@/pages/dashboard/CandidateCertificationGuard";
import { CertificationGuard } from "@/pages/dashboard/CertificationGuard";
import { CurriculumGuard } from "@/pages/dashboard/CurriculumGuard";
import { AdminEducationGuard } from "@/pages/dashboard/AdminEducationGuard";
import { AdminReportsGuard } from "@/pages/dashboard/AdminReportsGuard";
import { GovernanceGuard } from "@/pages/dashboard/GovernanceGuard";
import { UserRegistryGuard } from "@/pages/dashboard/UserRegistryGuard";
import { IdentityReviewGuard } from "@/pages/dashboard/IdentityReviewGuard";
import { IsoRouteGuard } from "@/pages/dashboard/IsoRouteGuard";
import { SysAdminGuard } from "@/pages/dashboard/SysAdminGuard";
import { TenantsAdminGuard } from "@/pages/dashboard/TenantsAdminGuard";
const DashboardAiTutorPage = lazy(() => import("@/pages/dashboard/DashboardAiTutorPage"));
import DashboardHome from "@/pages/dashboard/DashboardHome";
import DashboardProfilePage from "@/pages/dashboard/DashboardProfilePage";
import DashboardSettingsPage from "@/pages/dashboard/DashboardSettingsPage";
import CourseContentEditorPage from "@/admin/pages/CourseContentEditorPage";
const CourseBuilder = lazy(() => import("@/pages/admin/CourseBuilder"));
const CertificationDashboard = lazy(() => import("@/pages/admin/CertificationDashboard"));
const GovernanceDashboard = lazy(() => import("@/pages/admin/GovernanceDashboard"));
const SupportAdminPage = lazy(() => import("@/pages/admin/SupportAdminPage"));
const StaffAppealsComplaintsPage = lazy(() => import("@/pages/staff/StaffAppealsComplaintsPage"));
import CandidateCertificationHub from "@/pages/iso/CandidateCertificationHub";
import ComplaintsIsoPage from "@/pages/iso/ComplaintsIsoPage";
import Iso17024Home from "@/pages/iso/Iso17024Home";
import IsoCompetencePage from "@/pages/iso/IsoCompetencePage";
import IsoCapaPage from "@/pages/iso/IsoCapaPage";
import IsoImpartialityPage from "@/pages/iso/IsoImpartialityPage";
import IsoManagementReviewPage from "@/pages/iso/IsoManagementReviewPage";
import IsoRisksPage from "@/pages/iso/IsoRisksPage";
import IsoAuditPage from "@/pages/iso/IsoAuditPage";
const KnowledgeWorkspacePage = lazy(() => import("@/pages/knowledge/KnowledgeWorkspacePage"));
const ComplianceOperatingPage = lazy(() => import("@/pages/iso/ComplianceOperatingPage"));
import {
  CertificationDecisionsPage,
  CertificatesRegistryPage,
  IsoReportsPage,
} from "@/pages/iso/IsoStaticPages";
import CertificationSchemesLayout from "@/pages/iso/schemes/CertificationSchemesLayout";
import CertificationSchemeListPage from "@/pages/iso/schemes/CertificationSchemeListPage";
import CertificationSchemeCreatePage from "@/pages/iso/schemes/CertificationSchemeCreatePage";
import CertificationSchemeDetailPage from "@/pages/iso/schemes/CertificationSchemeDetailPage";
import CertificationSchemeEditPage from "@/pages/iso/schemes/CertificationSchemeEditPage";
import CertificationSchemeReviewPage from "@/pages/iso/schemes/CertificationSchemeReviewPage";
import CertificationSchemeApprovePage from "@/pages/iso/schemes/CertificationSchemeApprovePage";
const AuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));
const SysAdminConsole = lazy(() => import("@/pages/admin/SysAdminConsole"));
const UserRegistryPage = lazy(() => import("@/pages/admin/UserRegistryPage"));
const IdentityReviewPage = lazy(() => import("@/pages/admin/IdentityReviewPage"));
const CommitteesPage = lazy(() => import("@/pages/admin/CommitteesPage"));
const ItemBank = lazy(() => import("@/pages/admin/exams/ItemBank"));
const RoleplayCatalog = lazy(() => import("@/pages/admin/RoleplayCatalog"));
const RoleplaySession = lazy(() => import("@/pages/admin/RoleplaySession"));
const CoursePlayer = lazy(() => import("@/pages/CoursePlayer"));
const CoursesCatalogPage = lazy(() => import("@/pages/courses/CoursesCatalogPage"));
const CourseDetailPage = lazy(() => import("@/pages/courses/CourseDetailPage"));
const CourseCartPage = lazy(() => import("@/pages/courses/CourseCartPage"));
const CheckoutSuccessPage = lazy(() => import("@/pages/checkout/CheckoutSuccessPage"));
const EnrollmentCoursePlayerPage = lazy(() => import("@/pages/learn/EnrollmentCoursePlayerPage"));
import { LearnRoutePilotGuard } from "@/pages/learn/LearnRoutePilotGuard";
import { InactiveLocalDemoPage } from "@/pages/dashboard/InactiveLocalDemoPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CertificateCelebratePage from "@/pages/dashboard/CertificateCelebratePage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import CatalogPage from "@/pages/CatalogPage";
import ExamsList from "@/pages/learner/ExamsList";
import ExamPlayer from "@/pages/learner/ExamPlayer";
import ExamResultsPage from "@/pages/learner/ExamResultsPage";
import ExamVerification from "@/pages/learner/ExamVerification";
import CertificationApplicationsPage from "@/pages/learner/CertificationApplicationsPage";
import CertificationApplicationWizardPage from "@/pages/learner/CertificationApplicationWizardPage";
import CertificationEntryPage from "@/pages/learner/CertificationEntryPage";
import CertificationStatusPage from "@/pages/learner/CertificationStatusPage";
import CertificationOverviewPage from "@/pages/learner/CertificationOverviewPage";
import FinancePage from "@/pages/learner/FinancePage";
import StatisticsPage from "@/pages/learner/StatisticsPage";
import LearnerCoursesPage from "@/pages/learner/LearnerCoursesPage";
import MyCertificates from "@/pages/learner/MyCertificates";
import ExamRegistrationPage from "@/pages/learner/ExamRegistrationPage";
import AppealsComplaintsPage from "@/pages/learner/AppealsComplaintsPage";
import SupportPage from "@/pages/learner/SupportPage";
import MyAccommodationsPage from "@/pages/learner/MyAccommodationsPage";
import StaffAccommodationsPage from "@/pages/admin/StaffAccommodationsPage";
import PublicCaseSubmitPage from "@/pages/public/PublicCaseSubmitPage";
import VerifyApplicantPage from "@/pages/public/VerifyApplicantPage";
import VerifyLookupPage from "@/pages/public/VerifyLookupPage";
const VerifyCertificate = lazy(() => import("@/pages/public/VerifyCertificate"));
const LandingPage = lazy(() => import("@/pages/public/LandingPage"));
const PricingPage = lazy(() => import("@/pages/public/PricingPage"));
const SimpleContentPage = lazy(() => import("@/pages/public/SimpleContentPage"));
const EquitableAccessPage = lazy(() => import("@/pages/public/EquitableAccessPage"));
const ContactPage = lazy(() => import("@/pages/public/ContactPage"));
const DemoStartPage = lazy(() => import("@/pages/public/DemoStartPage"));
const DemoSuccessPage = lazy(() => import("@/pages/public/DemoSuccessPage"));
const BookDemoPage = lazy(() => import("@/pages/public/BookDemoPage"));
const OnboardingPage = lazy(() => import("@/pages/public/OnboardingPage"));
const OnboardingSuccessPage = lazy(() => import("@/pages/public/OnboardingSuccessPage"));
import MyRecertificationsPage from "@/pages/learner/MyRecertificationsPage";
import CommitteeDecisionsListPage from "@/pages/committee/CommitteeDecisionsListPage";
import CommitteeDecisionDetailPage from "@/pages/committee/CommitteeDecisionDetailPage";
import CommitteeFormalDecisionReviewPage from "@/pages/committee/CommitteeFormalDecisionReviewPage";
import CommitteePilotApplicationsPage from "@/pages/committee/CommitteePilotApplicationsPage";
const NotificationsAdminPage = lazy(() => import("@/pages/admin/NotificationsAdminPage"));
const BillingPage = lazy(() => import("@/pages/billing/BillingPage"));
const SystemHealthPage = lazy(() => import("@/pages/admin/SystemHealthPage"));
const AdminJobsPage = lazy(() => import("@/pages/admin/AdminJobsPage"));
const AdminRecertificationPage = lazy(() => import("@/pages/admin/AdminRecertificationPage"));
const TenantsPage = lazy(() => import("@/pages/admin/TenantsPage"));
const TenantDetailPage = lazy(() => import("@/pages/admin/TenantDetailPage"));
const BackupsPage = lazy(() => import("@/pages/admin/BackupsPage"));
const AdminUserDetailPage = lazy(() => import("@/pages/admin/AdminUserDetailPage"));
const LeadsPage = lazy(() => import("@/pages/admin/LeadsPage"));
const FeedbackAdminPage = lazy(() => import("@/pages/admin/FeedbackAdminPage"));
const AnalyticsPage = lazy(() => import("@/pages/admin/AnalyticsPage"));
const AdminEducationPage = lazy(() => import("@/pages/admin/AdminEducationPage"));
const AdminReportsPage = lazy(() => import("@/pages/admin/AdminReportsPage"));
const LearnerEducationPage = lazy(() => import("@/pages/learner/LearnerEducationPage"));
const CustomersPage = lazy(() => import("@/pages/admin/CustomersPage"));
const AdminBillingPage = lazy(() => import("@/pages/admin/AdminBillingPage"));
const LaunchPage = lazy(() => import("@/pages/admin/LaunchPage"));
const AccessRolesInfoPage = lazy(() => import("@/pages/admin/AccessRolesInfoPage"));
const DashboardSecurityInfoPage = lazy(() => import("@/pages/admin/DashboardSecurityInfoPage"));
import {
  canAccessCertificationDecisions,
  canAccessCertificationSchemes,
  canAccessCertificatesRegistry,
  canAccessComplaintsDomain,
  canAccessCompetenceManagement,
  canAccessCapaManagement,
  canAccessComplianceWorkspace,
  canAccessKnowledgeWorkspace,
  canAccessGovernanceDomain,
  canAccessRiskManagement,
  canAccessIsoAudit,
  canAccessReportsDomain,
} from "@/lib/iso-navigation-access";
import { LandmarkDevAudit } from "@/components/accessibility/LandmarkDevAudit";
import { A11ySkipToMainLink } from "@confora/i18n/react";

import { AppShellFallback } from "@/components/accessibility/AppShellFallback";

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      {import.meta.env.DEV ? <LandmarkDevAudit /> : null}
      <div className="relative min-h-svh">
        <A11ySkipToMainLink />
        <main id="main-content" tabIndex={-1} className="min-h-svh outline-none">
          <Suspense fallback={<AppShellFallback />}>
      <Routes>
        <Route path="/katalog" element={<CatalogPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route
          path="/features"
          element={<SimpleContentPage title="Features" text="AI-powered LMS, ISO/IEC 17024-aligned workflows, committee governance, recertification, public verification, audit trail and SaaS billing." />}
        />
        <Route
          path="/solutions/certification-bodies"
          element={<SimpleContentPage title="Solutions for Certification Bodies" text="Designed to support ISO/IEC 17024-aligned certification operations with governance, committee decisions and lifecycle controls." />}
        />
        <Route
          path="/solutions/training-providers"
          element={<SimpleContentPage title="Solutions for Training Providers" text="Manage courses, exams and learner journeys while linking training outcomes to certification pathways." />}
        />
        <Route
          path="/solutions/standardization"
          element={<SimpleContentPage title="Solutions for Standardization Organizations" text="Coordinate schemes, controls, reporting and verification across multiple teams and tenants." />}
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/demo" element={<Navigate to="/demo/start" replace />} />
        <Route path="/demo/start" element={<DemoStartPage />} />
        <Route path="/demo/success" element={<DemoSuccessPage />} />
        <Route path="/book-demo" element={<BookDemoPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/onboarding/success" element={<OnboardingSuccessPage />} />
        <Route path="/security" element={<SimpleContentPage title="Security" text="CONFORA supports governance workflows with secure-by-default patterns, auditability and configurable controls." />} />
        <Route path="/customers" element={<SimpleContentPage title="Customers" text="Pilot proof assets are prepared as templates. Public customer claims are published only after approval." />} />
        <Route path="/customers/case-study" element={<SimpleContentPage title="Pilot Case Study" text="Template for measurable pilot outcomes: faster workflows, better visibility and stronger governance readiness. Publish only after customer approval." />} />
        <Route path="/faq" element={<SimpleContentPage title="FAQ" text="CONFORA supports pilot onboarding, procurement review, SMTP/Redis/Stripe integrations, and governed certification workflows." />} />
        <Route path="/compliance" element={<SimpleContentPage title="Compliance" text="Designed to support ISO/IEC 17024-aligned certification processes and operational controls." />} />
        <Route path="/public/equitable-access" element={<EquitableAccessPage />} />
        <Route path="/about" element={<SimpleContentPage title="About" text="CONFORA helps certification bodies and training providers run governed certification lifecycles." />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<VerifyLookupPage />} />
        <Route path="/verify/:verificationHash" element={<VerifyCertificate />} />
        <Route path="/verify-applicant/:token" element={<VerifyApplicantPage />} />
        <Route path="/my-learning" element={<Navigate to="/dashboard/courses" replace />} />
        <Route path="/my-exams" element={<Navigate to="/dashboard/exams" replace />} />
        <Route path="/my-certificates" element={<Navigate to="/dashboard/my-certificates" replace />} />
        <Route path="/my-certification-applications" element={<Navigate to="/dashboard/certification/applications" replace />} />
        <Route path="/certification/apply/:schemeId" element={<Navigate to="/dashboard/certification/applications" replace />} />
        <Route path="/profile" element={<Navigate to="/dashboard/profil" replace />} />
        <Route path="/podnesi-predmet" element={<PublicCaseSubmitPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/learn/:enrollmentId/:chapterId/:lessonId" element={<LearnRoutePilotGuard><EnrollmentCoursePlayerPage /></LearnRoutePilotGuard>} />
        <Route path="/learn/:courseId" element={<LearnRoutePilotGuard><CoursePlayer /></LearnRoutePilotGuard>} />
        <Route path="/courses" element={<CoursesCatalogPage />} />
        <Route path="/courses/cart" element={<CourseCartPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/me/accommodations" element={<Navigate to="/dashboard/me/accommodations" replace />} />
        <Route path="/me/statistics" element={<Navigate to="/dashboard/statistics" replace />} />
        <Route path="/me/certificates" element={<Navigate to="/dashboard/my-certificates" replace />} />
        <Route path="/exam-verification/:attemptId" element={<ExamVerification />} />
        <Route path="/exam-player/:attemptId" element={<ExamPlayer />} />
        <Route path="/exam/:attemptId" element={<ExamPlayer />} />
        <Route path="/exam/:attemptId/results" element={<ExamResultsPage />} />
        <Route path="/dashboard" element={<DashboardLayoutRoute />}>
          <Route index element={<DashboardHome />} />
          <Route path="inactive-demo" element={<InactiveLocalDemoPage />} />
          <Route path="admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="committee" element={<Navigate to="/dashboard" replace />} />
          <Route path="director" element={<Navigate to="/dashboard" replace />} />
          <Route path="sys-admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="katalog" element={<Navigate to="/dashboard" replace />} />
          <Route path="courses" element={<LearnerCoursesPage />} />
          <Route path="learner/education" element={<LearnerEducationPage />} />
          <Route path="my-learning" element={<Navigate to="/dashboard/courses" replace />} />
          <Route path="exams/register" element={<ExamRegistrationPage />} />
          <Route path="exams" element={<ExamsList />} />
          <Route path="my-exams" element={<Navigate to="/dashboard/exams" replace />} />
          <Route path="certification">
            <Route index element={<CertificationOverviewPage />} />
            <Route path="applications" element={<CertificationApplicationsPage />} />
            <Route path="applications/:applicationId/wizard" element={<CertificationApplicationWizardPage />} />
            <Route path="status" element={<CertificationStatusPage />} />
            <Route path="entry/:courseId" element={<CertificationEntryPage />} />
          </Route>
          <Route path="my-certificates" element={<MyCertificates />} />
          <Route path="my-certification-applications" element={<CertificationApplicationsPage />} />
          <Route path="my-recertifications" element={<MyRecertificationsPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="appeals-complaints" element={<AppealsComplaintsPage />} />
          <Route path="me/accommodations" element={<MyAccommodationsPage />} />
          <Route path="ai-tutor" element={<DashboardAiTutorPage />} />
          <Route path="certifikat" element={<CertificateCelebratePage />} />
          <Route path="postavke" element={<DashboardSettingsPage />} />
          <Route path="profil" element={<DashboardProfilePage />} />
          <Route
            path="knowledge"
            element={
              <IsoRouteGuard allow={canAccessKnowledgeWorkspace}>
                <KnowledgeWorkspacePage />
              </IsoRouteGuard>
            }
          />
          <Route path="iso">
            <Route index element={<Iso17024Home />} />
            <Route
              path="schemes"
              element={
                <IsoRouteGuard allow={canAccessCertificationSchemes}>
                  <CertificationSchemesLayout />
                </IsoRouteGuard>
              }
            >
              <Route index element={<CertificationSchemeListPage />} />
              <Route path="new" element={<CertificationSchemeCreatePage />} />
              <Route path=":schemeId" element={<CertificationSchemeDetailPage />} />
              <Route path=":schemeId/edit" element={<CertificationSchemeEditPage />} />
              <Route path=":schemeId/review" element={<CertificationSchemeReviewPage />} />
              <Route path=":schemeId/approve" element={<CertificationSchemeApprovePage />} />
            </Route>
            <Route
              path="applications"
              element={
                <CertificationApplicationsQueueGuard>
                  <CertificationDashboard />
                </CertificationApplicationsQueueGuard>
              }
            />
            <Route
              path="candidate"
              element={
                <CandidateCertificationGuard>
                  <CandidateCertificationHub />
                </CandidateCertificationGuard>
              }
            />
            <Route
              path="decisions"
              element={
                <IsoRouteGuard allow={canAccessCertificationDecisions}>
                  <CertificationDecisionsPage />
                </IsoRouteGuard>
              }
            />
            <Route
              path="certificates"
              element={
                <IsoRouteGuard allow={canAccessCertificatesRegistry}>
                  <CertificatesRegistryPage />
                </IsoRouteGuard>
              }
            />
            <Route
              path="appeals"
              element={
                <StaffAppealsComplaintsGuard>
                  <StaffAppealsComplaintsPage />
                </StaffAppealsComplaintsGuard>
              }
            />
            <Route
              path="complaints"
              element={
                <IsoRouteGuard allow={canAccessComplaintsDomain}>
                  <ComplaintsIsoPage />
                </IsoRouteGuard>
              }
            />
            <Route
              path="governance"
              element={
                <GovernanceGuard>
                  <GovernanceDashboard />
                </GovernanceGuard>
              }
            />
            <Route
              path="compliance"
              element={
                <IsoRouteGuard allow={canAccessComplianceWorkspace}>
                  <ComplianceOperatingPage />
                </IsoRouteGuard>
              }
            />
            <Route
              path="competence"
              element={
                <IsoRouteGuard allow={canAccessCompetenceManagement}>
                  <IsoCompetencePage />
                </IsoRouteGuard>
              }
            />
            <Route
              path="capa"
              element={
                <IsoRouteGuard allow={canAccessCapaManagement}>
                  <IsoCapaPage />
                </IsoRouteGuard>
              }
            />
            <Route
              path="impartiality"
              element={
                <IsoRouteGuard allow={canAccessRiskManagement}>
                  <IsoImpartialityPage />
                </IsoRouteGuard>
              }
            />
            <Route
              path="management-review"
              element={
                <IsoRouteGuard allow={canAccessGovernanceDomain}>
                  <IsoManagementReviewPage />
                </IsoRouteGuard>
              }
            />
            <Route
              path="risks"
              element={
                <IsoRouteGuard allow={canAccessRiskManagement}>
                  <IsoRisksPage />
                </IsoRouteGuard>
              }
            />
            <Route
              path="audit"
              element={
                <IsoRouteGuard allow={canAccessIsoAudit}>
                  <IsoAuditPage />
                </IsoRouteGuard>
              }
            />
            <Route
              path="reports"
              element={
                <IsoRouteGuard allow={canAccessReportsDomain}>
                  <IsoReportsPage />
                </IsoRouteGuard>
              }
            />
          </Route>
          <Route
            path="admin/education"
            element={
              <AdminEducationGuard>
                <AdminEducationPage />
              </AdminEducationGuard>
            }
          />
          <Route
            path="admin/reports"
            element={
              <AdminReportsGuard>
                <AdminReportsPage />
              </AdminReportsGuard>
            }
          />
          <Route
            path="admin/kreiraj-kurs"
            element={
              <CurriculumGuard>
                <CourseCreatorGuard>
                  <CourseBuilder />
                </CourseCreatorGuard>
              </CurriculumGuard>
            }
          />
          <Route
            path="admin/sadrzaj"
            element={
              <CurriculumGuard>
                <CourseContentEditorPage />
              </CurriculumGuard>
            }
          />
          <Route
            path="admin/certification"
            element={
              <CertificationApplicationsQueueGuard>
                <CertificationDashboard />
              </CertificationApplicationsQueueGuard>
            }
          />
          <Route
            path="admin/governance"
            element={
              <GovernanceGuard>
                <GovernanceDashboard />
              </GovernanceGuard>
            }
          />
          <Route
            path="admin/support"
            element={
              <AppealsCommitteeGuard>
                <SupportAdminPage />
              </AppealsCommitteeGuard>
            }
          />
          <Route
            path="admin/appeals-complaints"
            element={
              <StaffAppealsComplaintsGuard>
                <StaffAppealsComplaintsPage />
              </StaffAppealsComplaintsGuard>
            }
          />
          <Route
            path="admin/audit-logs"
            element={
              <AuditLogViewerGuard>
                <AuditLogs />
              </AuditLogViewerGuard>
            }
          />
          <Route path="admin/accommodations" element={<StaffAccommodationsPage />} />
          <Route
            path="admin/console"
            element={
              <SysAdminGuard>
                <SysAdminConsole />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/users"
            element={
              <UserRegistryGuard>
                <UserRegistryPage />
              </UserRegistryGuard>
            }
          />
          <Route
            path="admin/identity-review"
            element={
              <IdentityReviewGuard>
                <IdentityReviewPage />
              </IdentityReviewGuard>
            }
          />
          <Route
            path="admin/committees"
            element={
              <SysAdminGuard>
                <CommitteesPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/certificates"
            element={
              <CertificationGuard>
                <CertificatesRegistryPage />
              </CertificationGuard>
            }
          />
          <Route
            path="admin/certification-schemes"
            element={<Navigate to="/dashboard/iso/schemes" replace />}
          />
          <Route
            path="admin/audit"
            element={
              <AuditLogViewerGuard>
                <AuditLogs />
              </AuditLogViewerGuard>
            }
          />
          <Route
            path="admin/notifications"
            element={
              <CertificationGuard>
                <NotificationsAdminPage />
              </CertificationGuard>
            }
          />
          <Route
            path="admin/system-health"
            element={
              <SysAdminGuard>
                <SystemHealthPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/jobs"
            element={
              <SysAdminGuard>
                <AdminJobsPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/feedback"
            element={
              <SysAdminGuard>
                <FeedbackAdminPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/analytics"
            element={
              <SysAdminGuard>
                <AnalyticsPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/customers"
            element={
              <SysAdminGuard>
                <CustomersPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/billing"
            element={
              <SysAdminGuard>
                <AdminBillingPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/launch"
            element={
              <SysAdminGuard>
                <LaunchPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/roles"
            element={
              <SysAdminGuard>
                <AccessRolesInfoPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/security"
            element={
              <SysAdminGuard>
                <DashboardSecurityInfoPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/tenants"
            element={
              <TenantsAdminGuard>
                <TenantsPage />
              </TenantsAdminGuard>
            }
          />
          <Route
            path="admin/tenants/:tenantId"
            element={
              <TenantsAdminGuard>
                <TenantDetailPage />
              </TenantsAdminGuard>
            }
          />
          <Route
            path="admin/users/:userId"
            element={
              <UserRegistryGuard>
                <AdminUserDetailPage />
              </UserRegistryGuard>
            }
          />
          <Route
            path="admin/backups"
            element={
              <SysAdminGuard>
                <BackupsPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/leads"
            element={
              <SysAdminGuard>
                <LeadsPage />
              </SysAdminGuard>
            }
          />
          <Route
            path="admin/certification-applications"
            element={
              <CertificationApplicationsQueueGuard>
                <CertificationDashboard />
              </CertificationApplicationsQueueGuard>
            }
          />
          <Route
            path="admin/certification-applications/:applicationId"
            element={
              <CertificationGuard>
                <CommitteeDecisionDetailPage />
              </CertificationGuard>
            }
          />
          <Route
            path="admin/recertification"
            element={
              <CertificationGuard>
                <Suspense fallback={<div className="p-8 text-text-secondary">Učitavanje…</div>}>
                  <AdminRecertificationPage />
                </Suspense>
              </CertificationGuard>
            }
          />
          <Route
            path="committee/decisions"
            element={
              <CertificationGuard>
                <CommitteeDecisionsListPage />
              </CertificationGuard>
            }
          />
          <Route
            path="committee/decisions/:applicationId"
            element={
              <CertificationGuard>
                <CommitteeDecisionDetailPage />
              </CertificationGuard>
            }
          />
          <Route
            path="committee/formal-decisions/:decisionId"
            element={
              <CertificationGuard>
                <CommitteeFormalDecisionReviewPage />
              </CertificationGuard>
            }
          />
          <Route
            path="committee/pilot-applications"
            element={
              <CertificationGuard>
                <CommitteePilotApplicationsPage />
              </CertificationGuard>
            }
          />
          <Route
            path="committee/pilot-applications/:applicationId"
            element={
              <CertificationGuard>
                <CommitteePilotApplicationsPage />
              </CertificationGuard>
            }
          />
          <Route
            path="admin/item-bank"
            element={
              <CurriculumGuard>
                <ItemBank />
              </CurriculumGuard>
            }
          />
          <Route
            path="admin/roleplay"
            element={
              <CurriculumGuard>
                <RoleplayCatalog />
              </CurriculumGuard>
            }
          />
          <Route
            path="admin/roleplay/:sessionId"
            element={
              <CurriculumGuard>
                <RoleplaySession />
              </CurriculumGuard>
            }
          />
        </Route>
      </Routes>
      <FeedbackWidget />
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}
