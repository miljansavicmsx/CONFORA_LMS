import { Suspense, lazy, type JSX } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import { A11ySkipToMainLink } from "@confora/i18n/react";

import { LandmarkDevAudit } from "@/components/accessibility/LandmarkDevAudit";
import { canAccessComplaintsDomain, canAccessReportsDomain } from "@/lib/iso-navigation-access";
import { AppealsCommitteeGuard } from "@/pages/dashboard/AppealsCommitteeGuard";
import { AdminEducationGuard } from "@/pages/dashboard/AdminEducationGuard";
import { AdminReportsGuard } from "@/pages/dashboard/AdminReportsGuard";
import { CertificationApplicationsQueueGuard } from "@/pages/dashboard/CertificationApplicationsQueueGuard";
import { CertificationGuard } from "@/pages/dashboard/CertificationGuard";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import { DashboardLayoutRoute } from "@/pages/dashboard/DashboardLayoutRoute";
import { IdentityReviewGuard } from "@/pages/dashboard/IdentityReviewGuard";
import { IsoRouteGuard } from "@/pages/dashboard/IsoRouteGuard";
import { StaffAppealsComplaintsGuard } from "@/pages/dashboard/StaffAppealsComplaintsGuard";
import Login from "@/pages/Login";
import AppealsComplaintsPage from "@/pages/learner/AppealsComplaintsPage";
import CertificationApplicationsPage from "@/pages/learner/CertificationApplicationsPage";
import ExamRegistrationPage from "@/pages/learner/ExamRegistrationPage";
import MyCertificates from "@/pages/learner/MyCertificates";
import MyRecertificationsPage from "@/pages/learner/MyRecertificationsPage";
import SupportPage from "@/pages/learner/SupportPage";
import ComplaintsIsoPage from "@/pages/iso/ComplaintsIsoPage";
import { IsoReportsPage } from "@/pages/iso/IsoStaticPages";
import VerifyLookupPage from "@/pages/public/VerifyLookupPage";

const AdminEducationPage = lazy(() => import("@/pages/admin/AdminEducationPage"));
const AdminRecertificationPage = lazy(() => import("@/pages/admin/AdminRecertificationPage"));
const AdminReportsPage = lazy(() => import("@/pages/admin/AdminReportsPage"));
const CertificationDashboard = lazy(() => import("@/pages/admin/CertificationDashboard"));
const CoursesCatalogPage = lazy(() => import("@/pages/courses/CoursesCatalogPage"));
const CourseDetailPage = lazy(() => import("@/pages/courses/CourseDetailPage"));
const IdentityReviewPage = lazy(() => import("@/pages/admin/IdentityReviewPage"));
const LearnerEducationPage = lazy(() => import("@/pages/learner/LearnerEducationPage"));
const StaffAppealsComplaintsPage = lazy(() => import("@/pages/staff/StaffAppealsComplaintsPage"));
const SupportAdminPage = lazy(() => import("@/pages/admin/SupportAdminPage"));
const VerifyCertificate = lazy(() => import("@/pages/public/VerifyCertificate"));
const CommitteePilotApplicationsPage = lazy(
  () => import("@/pages/committee/CommitteePilotApplicationsPage"),
);

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      {import.meta.env.DEV ? <LandmarkDevAudit /> : null}
      <div className="relative min-h-svh">
        <A11ySkipToMainLink />
        <main id="main-content" tabIndex={-1} className="min-h-svh outline-none">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/verify" element={<VerifyLookupPage />} />
              <Route path="/verify/:verificationHash" element={<VerifyCertificate />} />
              <Route path="/courses" element={<CoursesCatalogPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/dashboard" element={<DashboardLayoutRoute />}>
                <Route index element={<DashboardHome />} />
                <Route path="learner/education" element={<LearnerEducationPage />} />
                <Route path="exams/register" element={<ExamRegistrationPage />} />
                <Route path="certification/applications" element={<CertificationApplicationsPage />} />
                <Route path="my-certificates" element={<MyCertificates />} />
                <Route path="my-recertifications" element={<MyRecertificationsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="appeals-complaints" element={<AppealsComplaintsPage />} />
                <Route
                  path="iso/applications"
                  element={
                    <CertificationApplicationsQueueGuard>
                      <CertificationDashboard />
                    </CertificationApplicationsQueueGuard>
                  }
                />
                <Route
                  path="iso/appeals"
                  element={
                    <StaffAppealsComplaintsGuard>
                      <StaffAppealsComplaintsPage />
                    </StaffAppealsComplaintsGuard>
                  }
                />
                <Route
                  path="iso/complaints"
                  element={
                    <IsoRouteGuard allow={canAccessComplaintsDomain}>
                      <ComplaintsIsoPage />
                    </IsoRouteGuard>
                  }
                />
                <Route
                  path="iso/reports"
                  element={
                    <IsoRouteGuard allow={canAccessReportsDomain}>
                      <IsoReportsPage />
                    </IsoRouteGuard>
                  }
                />
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
                  path="admin/identity-review"
                  element={
                    <IdentityReviewGuard>
                      <IdentityReviewPage />
                    </IdentityReviewGuard>
                  }
                />
                <Route
                  path="admin/recertification"
                  element={
                    <CertificationGuard>
                      <AdminRecertificationPage />
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
              </Route>
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}
