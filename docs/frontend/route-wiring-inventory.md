# Frontend route wiring inventory

Baseline for this inventory: `b968dfa` (head of PR #66, Keycloak OIDC browser login).
Classification is against the Nest API in `apps/api`, not a legacy host that is not in this repository.

| Class | Meaning |
| --- | --- |
| wired | The page calls a Nest route that exists, and the response is shown as returned. |
| mock | The page shows fabricated records that can be mistaken for real people or programmes. |
| static | Informational or empty state, with no data fetch. |
| broken | The page calls a path Nest does not serve, or a path that rejects the public reader the page promises. |

## Before (`b968dfa`)

### Public and sign-in

| Route | Page | Class | Evidence |
| --- | --- | --- | --- |
| `/login` | `pages/Login.tsx` | wired | Redirects to `GET /v1/auth/oidc/login`. |
| `/unauthorized` | `pages/UnauthorizedPage.tsx` | static | Access denial and the chair-not-implemented notice. No chair grant. |
| `/verify` | `pages/public/VerifyLookupPage.tsx` | broken | Posts `/api/public/certificates/verify`, which Nest does not serve. |
| `/verify/:verificationHash` | `pages/public/VerifyCertificate.tsx` | broken | Hash lookup uses a missing legacy path. EDU/EXM numbers are sent to the public document route, but the page expects fields that route does not return and can show an exam result. Personnel lookup uses the sequential `CON-` number. |
| `/registry` | `pages/public/PublicRegistryPage.tsx` | broken | The page says browsing needs no sign-in, but `GET /v1/public/certificates` is not `@Public()` and returns 401. The search also returns the holder name and the sequential number. |
| `/referee/:token` | `pages/public/RefereeConfirmPage.tsx` | wired | `POST /v1/public/referees/:token`. |
| `/courses` | `pages/courses/CoursesCatalogPage.tsx` | broken | `GET /api/courses` is not a Nest route. The page reports that the catalog is unavailable. |
| `/courses/:courseId` | `pages/courses/CourseDetailPage.tsx` | broken | Same missing catalog list, filtered in the browser. |

### Candidate (`/dashboard`, session required)

| Route | Page | Class | Evidence |
| --- | --- | --- | --- |
| `/dashboard` | `pages/dashboard/DashboardHome.tsx` | wired | `GET/POST /v1/me/learning/courses` and enrolments. |
| `/dashboard/profil` | `pages/dashboard/SessionProfilePage.tsx` | wired | Session, courses, applications, EDU and EXM lists. |
| `/dashboard/learner/education` | `pages/learner/LearnerEducationPage.tsx` | broken | Calls `GET /v1/me/enrollments` and `/api/learning/progress`. Nest serves `/v1/me/learning/enrolments` and the course player. Completion certificate lookup returns null. |
| `/dashboard/learner/courses/:enrolmentId` | `pages/learner/CoursePlayerPage.tsx` | wired | Player, lesson progress and quiz attempts. |
| `/dashboard/learner/statistics` | `pages/learner/LearnerStatisticsPage.tsx` | wired | Statistics and analytics consent. |
| `/dashboard/exams/register` | `pages/learner/ExamRegistrationPage.tsx` | broken | `GET /v1/me/exams/registration-options` and `POST /v1/me/exams/registrations` do not exist. |
| `/dashboard/exams/sessions` | `pages/learner/ExamSessionListPage.tsx` | wired | `GET /v1/me/exams/sessions`. |
| `/dashboard/exams/sessions/:sessionId` | `pages/learner/ExamTakingPage.tsx` | wired | Start, answers and submit. CSRF client is used. |
| `/dashboard/exams/sessions/:sessionId/result` | `pages/learner/ExamResultPage.tsx` | wired | `GET .../result`. |
| `/dashboard/certification/applications` | `pages/learner/CertificationApplicationsPage.tsx` | wired | `GET /v1/me/certification/applications`. |
| `/dashboard/certification/dossier` | `pages/learner/CertificationDossierPage.tsx` | wired | `GET/POST /v1/me/certification-cases`. |
| `/dashboard/certification/documents` | `pages/learner/MyCertificationPages.tsx` | wired | EDU and EXM lists. Download, public verification and name consent are not offered. |
| `/dashboard/certification/case-status` | `pages/learner/MyCertificationPages.tsx` | wired | `GET /v1/me/certification-cases`. |
| `/dashboard/my-certificates` | `pages/learner/MyCertificates.tsx` | wired | Wallet, authenticated PDF and credential download. Public link uses the sequential certificate number. |
| `/dashboard/my-recertifications` | `pages/learner/MyRecertificationsPage.tsx` | broken | Recertification routes are not on Nest. |
| `/dashboard/support` | `pages/learner/SupportPage.tsx` | static | States that the support record is unavailable. |
| `/dashboard/appeals-complaints` | `pages/learner/AppealsComplaintsPage.tsx` | broken | Complaint routes are not registered on Nest. |

### Committee (client guard `COM_CERT`; server enforces the same role)

| Route | Page | Class | Evidence |
| --- | --- | --- | --- |
| `/dashboard/committee/assigned` | `CommitteeAssignedPage` | wired | `GET /v1/committee/cases`. |
| `/dashboard/committee/review` | `CommitteeReviewPage` | wired | `GET /v1/committee/cases/:caseId`. Case id is typed by hand. |
| `/dashboard/committee/conflict` | `CommitteeConflictPage` | wired | `POST .../conflict-declaration`. |
| `/dashboard/committee/decision` | `CommitteeDecisionPage` | wired | `POST .../votes`. |
| `/dashboard/committee/case-file` | `pages/committee/CaseFilePage.tsx` | wired | Case read and assist. |
| `/dashboard/committee/exam-queue` | `pages/committee/ExamDecisionQueuePage.tsx` | wired | Queue and decision endpoints. |
| `/dashboard/committee/pilot-applications` | `pages/committee/CommitteePilotApplicationsPage.tsx` | static | Boundary text only. |

Chair appointment is not implemented. `UnauthorizedPage` says so. There is no chair action on these pages, and none is added.

### Administration and ISO

| Route | Page | Class | Evidence |
| --- | --- | --- | --- |
| `/dashboard/admin/item-bank` | `pages/admin/ItemBankPage.tsx` | wired | ` /v1/staff/exams/items`. `exam-approver` is not `COM_TECH` and is refused. |
| `/dashboard/admin/exam-blueprint` | `pages/admin/ExamBlueprintPage.tsx` | wired | Staff blueprint routes. |
| `/dashboard/admin/reports` | `pages/admin/AdminReportsPage.tsx` | wired | `GET /v1/staff/reports/certification-applications/by-status` and `by-scheme-ref`. |
| `/dashboard/admin/education` | `pages/admin/AdminEducationPage.tsx` | mock | Calls `/v1/admin/...` routes that do not exist and shows a synthetic pilot banner plus zeroed summary cards. |
| `/dashboard/admin/identity-review` | `pages/admin/IdentityReviewPage.tsx` | mock | When the missing queue fails, the page shows "Pilot Learner (synthetic demo)". |
| `/dashboard/admin/support` | `pages/admin/SupportAdminPage.tsx` | static | States that the support record is unavailable. |
| `/dashboard/admin/recertification` | `pages/admin/AdminRecertificationPage.tsx` | static | States that authoritative data is unavailable. |
| `/dashboard/admin/appeals-complaints` | `pages/staff/StaffAppealsComplaintsPage.tsx` | broken | Staff appeal and complaint routes are not registered. |
| `/dashboard/iso/applications` | `pages/admin/CertificationDashboard.tsx` | static | Explicit empty state. |
| `/dashboard/iso/appeals` | `pages/staff/StaffAppealsComplaintsPage.tsx` | broken | Same missing grievance routes. |
| `/dashboard/iso/complaints` | `pages/iso/ComplaintsIsoPage.tsx` | broken | Staff view uses the missing grievance client. |
| `/dashboard/iso/reports` | `pages/iso/IsoReportsPage.tsx` | broken | Aggregate report summary is not a Nest route. The page surfaces the unavailable error. |

### Before counts

| Class | Routes |
| --- | --- |
| wired | 22 |
| broken | 13 |
| static | 5 |
| mock | 2 |

## After

The after section is updated in the same change set once the wiring below is in place. Until that commit, the before table is the inventory.
