# Frontend route wiring inventory

Baseline for this inventory: `b968dfa` (head of PR #66, Keycloak OIDC browser login).
Classification is against the Nest API in `apps/api`, not a legacy host that is not in this repository.

| Class  | Meaning                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------ |
| wired  | The page calls a Nest route that exists, and the response is shown as returned.                        |
| mock   | The page shows fabricated records that can be mistaken for real people or programmes.                  |
| static | Informational or empty state, with no data fetch.                                                      |
| broken | The page calls a path Nest does not serve, or a path that rejects the public reader the page promises. |

## Before (`b968dfa`)

### Public and sign-in

| Route                       | Page                                   | Class  | Evidence                                                                                                                                                                                                                               |
| --------------------------- | -------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/login`                    | `pages/Login.tsx`                      | wired  | Redirects to `GET /v1/auth/oidc/login`.                                                                                                                                                                                                |
| `/unauthorized`             | `pages/UnauthorizedPage.tsx`           | static | Access denial and the chair-not-implemented notice. No chair grant.                                                                                                                                                                    |
| `/verify`                   | `pages/public/VerifyLookupPage.tsx`    | broken | Posts `/api/public/certificates/verify`, which Nest does not serve.                                                                                                                                                                    |
| `/verify/:verificationHash` | `pages/public/VerifyCertificate.tsx`   | broken | Hash lookup uses a missing legacy path. EDU/EXM numbers are sent to the public document route, but the page expects fields that route does not return and can show an exam result. Personnel lookup uses the sequential `CON-` number. |
| `/registry`                 | `pages/public/PublicRegistryPage.tsx`  | broken | The page says browsing needs no sign-in, but `GET /v1/public/certificates` is not `@Public()` and returns 401. The search also returns the holder name and the sequential number.                                                      |
| `/referee/:token`           | `pages/public/RefereeConfirmPage.tsx`  | wired  | `POST /v1/public/referees/:token`.                                                                                                                                                                                                     |
| `/courses`                  | `pages/courses/CoursesCatalogPage.tsx` | broken | `GET /api/courses` is not a Nest route. The page reports that the catalog is unavailable.                                                                                                                                              |
| `/courses/:courseId`        | `pages/courses/CourseDetailPage.tsx`   | broken | Same missing catalog list, filtered in the browser.                                                                                                                                                                                    |

### Candidate (`/dashboard`, session required)

| Route                                         | Page                                              | Class  | Evidence                                                                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/dashboard`                                  | `pages/dashboard/DashboardHome.tsx`               | wired  | `GET/POST /v1/me/learning/courses` and enrolments.                                                                                                                       |
| `/dashboard/profil`                           | `pages/dashboard/SessionProfilePage.tsx`          | wired  | Session, courses, applications, EDU and EXM lists.                                                                                                                       |
| `/dashboard/learner/education`                | `pages/learner/LearnerEducationPage.tsx`          | broken | Calls `GET /v1/me/enrollments` and `/api/learning/progress`. Nest serves `/v1/me/learning/enrolments` and the course player. Completion certificate lookup returns null. |
| `/dashboard/learner/courses/:enrolmentId`     | `pages/learner/CoursePlayerPage.tsx`              | wired  | Player, lesson progress and quiz attempts.                                                                                                                               |
| `/dashboard/learner/statistics`               | `pages/learner/LearnerStatisticsPage.tsx`         | wired  | Statistics and analytics consent.                                                                                                                                        |
| `/dashboard/exams/register`                   | `pages/learner/ExamRegistrationPage.tsx`          | broken | `GET /v1/me/exams/registration-options` and `POST /v1/me/exams/registrations` do not exist.                                                                              |
| `/dashboard/exams/sessions`                   | `pages/learner/ExamSessionListPage.tsx`           | wired  | `GET /v1/me/exams/sessions`.                                                                                                                                             |
| `/dashboard/exams/sessions/:sessionId`        | `pages/learner/ExamTakingPage.tsx`                | wired  | Start, answers and submit. CSRF client is used.                                                                                                                          |
| `/dashboard/exams/sessions/:sessionId/result` | `pages/learner/ExamResultPage.tsx`                | wired  | `GET .../result`.                                                                                                                                                        |
| `/dashboard/certification/applications`       | `pages/learner/CertificationApplicationsPage.tsx` | wired  | `GET /v1/me/certification/applications`.                                                                                                                                 |
| `/dashboard/certification/dossier`            | `pages/learner/CertificationDossierPage.tsx`      | wired  | `GET/POST /v1/me/certification-cases`.                                                                                                                                   |
| `/dashboard/certification/documents`          | `pages/learner/MyCertificationPages.tsx`          | wired  | EDU and EXM lists. Download, public verification and name consent are not offered.                                                                                       |
| `/dashboard/certification/case-status`        | `pages/learner/MyCertificationPages.tsx`          | wired  | `GET /v1/me/certification-cases`.                                                                                                                                        |
| `/dashboard/my-certificates`                  | `pages/learner/MyCertificates.tsx`                | wired  | Wallet, authenticated PDF and credential download. Public link uses the sequential certificate number.                                                                   |
| `/dashboard/my-recertifications`              | `pages/learner/MyRecertificationsPage.tsx`        | broken | Recertification routes are not on Nest.                                                                                                                                  |
| `/dashboard/support`                          | `pages/learner/SupportPage.tsx`                   | static | States that the support record is unavailable.                                                                                                                           |
| `/dashboard/appeals-complaints`               | `pages/learner/AppealsComplaintsPage.tsx`         | broken | Complaint routes are not registered on Nest.                                                                                                                             |

### Committee (client guard `COM_CERT`; server enforces the same role)

| Route                                     | Page                                                 | Class  | Evidence                                                     |
| ----------------------------------------- | ---------------------------------------------------- | ------ | ------------------------------------------------------------ |
| `/dashboard/committee/assigned`           | `CommitteeAssignedPage`                              | wired  | `GET /v1/committee/cases`.                                   |
| `/dashboard/committee/review`             | `CommitteeReviewPage`                                | wired  | `GET /v1/committee/cases/:caseId`. Case id is typed by hand. |
| `/dashboard/committee/conflict`           | `CommitteeConflictPage`                              | wired  | `POST .../conflict-declaration`.                             |
| `/dashboard/committee/decision`           | `CommitteeDecisionPage`                              | wired  | `POST .../votes`.                                            |
| `/dashboard/committee/case-file`          | `pages/committee/CaseFilePage.tsx`                   | wired  | Case read and assist.                                        |
| `/dashboard/committee/exam-queue`         | `pages/committee/ExamDecisionQueuePage.tsx`          | wired  | Queue and decision endpoints.                                |
| `/dashboard/committee/pilot-applications` | `pages/committee/CommitteePilotApplicationsPage.tsx` | static | Boundary text only.                                          |

Chair appointment is not implemented. `UnauthorizedPage` says so. There is no chair action on these pages, and none is added.

### Administration and ISO

| Route                                 | Page                                         | Class  | Evidence                                                                                                     |
| ------------------------------------- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| `/dashboard/admin/item-bank`          | `pages/admin/ItemBankPage.tsx`               | wired  | ` /v1/staff/exams/items`. `exam-approver` is not `COM_TECH` and is refused.                                  |
| `/dashboard/admin/exam-blueprint`     | `pages/admin/ExamBlueprintPage.tsx`          | wired  | Staff blueprint routes.                                                                                      |
| `/dashboard/admin/reports`            | `pages/admin/AdminReportsPage.tsx`           | wired  | `GET /v1/staff/reports/certification-applications/by-status` and `by-scheme-ref`.                            |
| `/dashboard/admin/education`          | `pages/admin/AdminEducationPage.tsx`         | mock   | Calls `/v1/admin/...` routes that do not exist and shows a synthetic pilot banner plus zeroed summary cards. |
| `/dashboard/admin/identity-review`    | `pages/admin/IdentityReviewPage.tsx`         | mock   | When the missing queue fails, the page shows "Pilot Learner (synthetic demo)".                               |
| `/dashboard/admin/support`            | `pages/admin/SupportAdminPage.tsx`           | static | States that the support record is unavailable.                                                               |
| `/dashboard/admin/recertification`    | `pages/admin/AdminRecertificationPage.tsx`   | static | States that authoritative data is unavailable.                                                               |
| `/dashboard/admin/appeals-complaints` | `pages/staff/StaffAppealsComplaintsPage.tsx` | broken | Staff appeal and complaint routes are not registered.                                                        |
| `/dashboard/iso/applications`         | `pages/admin/CertificationDashboard.tsx`     | static | Explicit empty state.                                                                                        |
| `/dashboard/iso/appeals`              | `pages/staff/StaffAppealsComplaintsPage.tsx` | broken | Same missing grievance routes.                                                                               |
| `/dashboard/iso/complaints`           | `pages/iso/ComplaintsIsoPage.tsx`            | broken | Staff view uses the missing grievance client.                                                                |
| `/dashboard/iso/reports`              | `pages/iso/IsoReportsPage.tsx`               | broken | Aggregate report summary is not a Nest route. The page surfaces the unavailable error.                       |

### Before counts

| Class  | Routes |
| ------ | ------ |
| wired  | 23     |
| broken | 13     |
| static | 6      |
| mock   | 2      |

## After

Same routes. A page is `static` when it states that the feature is not implemented and does not show invented records.

### Public and sign-in

| Route                       | Page                                   | Class  | Evidence                                                                                                                                                                                                  |
| --------------------------- | -------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/login`                    | `pages/Login.tsx`                      | wired  | Unchanged. `GET /v1/auth/oidc/login`.                                                                                                                                                                     |
| `/unauthorized`             | `pages/UnauthorizedPage.tsx`           | static | Unchanged. Chair actions stay not implemented (OD-AUTH-32).                                                                                                                                               |
| `/verify`                   | `pages/public/VerifyLookupPage.tsx`    | wired  | Sends the typed key to `/verify/:key`. It does not call `/api/public/certificates/verify`.                                                                                                                |
| `/verify/:verificationHash` | `pages/public/VerifyCertificate.tsx`   | wired  | Every key uses `GET /v1/public/documents/:id` and then `GET /v1/public/certificates/:token`. The view is status, type, date, and name only with consent. The frontend does not call `/api/public/verify`. |
| `/registry`                 | `pages/public/PublicRegistryPage.tsx`  | wired  | One verification-id field. No name search and no sequential number. Unauthenticated.                                                                                                                      |
| `/referee/:token`           | `pages/public/RefereeConfirmPage.tsx`  | wired  | Unchanged.                                                                                                                                                                                                |
| `/courses`                  | `pages/courses/CoursesCatalogPage.tsx` | wired  | `GET /v1/public/catalog/courses`, limited to `PUBLIC_CATALOG_TENANT_IDS`. An unset allowlist is an empty list.                                                                                            |
| `/courses/:courseId`        | `pages/courses/CourseDetailPage.tsx`   | wired  | `GET /v1/public/catalog/courses/:courseId`. A course outside the allowlist is 404. Enrolment is a link to sign-in, not a public write.                                                                    |

### Candidate

| Route                                         | Page                                              | Class  | Evidence                                                                                            |
| --------------------------------------------- | ------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| `/dashboard`                                  | `pages/dashboard/DashboardHome.tsx`               | wired  | Unchanged.                                                                                          |
| `/dashboard/profil`                           | `pages/dashboard/SessionProfilePage.tsx`          | wired  | Unchanged.                                                                                          |
| `/dashboard/learner/education`                | `pages/learner/LearnerEducationPage.tsx`          | wired  | `GET /v1/me/learning/enrolments`. The player is the lesson path.                                    |
| `/dashboard/learner/courses/:enrolmentId`     | `pages/learner/CoursePlayerPage.tsx`              | wired  | Unchanged.                                                                                          |
| `/dashboard/learner/statistics`               | `pages/learner/LearnerStatisticsPage.tsx`         | wired  | Unchanged.                                                                                          |
| `/dashboard/exams/register`                   | `pages/learner/ExamRegistrationPage.tsx`          | static | States that booking is not implemented and links to assigned sessions. No fabricated registrations. |
| `/dashboard/exams/sessions`                   | `pages/learner/ExamSessionListPage.tsx`           | wired  | Unchanged.                                                                                          |
| `/dashboard/exams/sessions/:sessionId`        | `pages/learner/ExamTakingPage.tsx`                | wired  | Unchanged. CSRF client.                                                                             |
| `/dashboard/exams/sessions/:sessionId/result` | `pages/learner/ExamResultPage.tsx`                | wired  | Unchanged.                                                                                          |
| `/dashboard/certification/applications`       | `pages/learner/CertificationApplicationsPage.tsx` | wired  | Unchanged.                                                                                          |
| `/dashboard/certification/dossier`            | `pages/learner/CertificationDossierPage.tsx`      | wired  | Unchanged.                                                                                          |
| `/dashboard/certification/documents`          | `pages/learner/MyCertificationPages.tsx`          | wired  | EDU and EXM lists, public verification link, public PDF, and name-consent `PUT`.                    |
| `/dashboard/certification/case-status`        | `pages/learner/MyCertificationPages.tsx`          | wired  | Unchanged.                                                                                          |
| `/dashboard/my-certificates`                  | `pages/learner/MyCertificates.tsx`                | wired  | Personnel PDF uses the authenticated holder route. The public link uses `qrVerifyToken`.            |
| `/dashboard/my-recertifications`              | `pages/learner/MyRecertificationsPage.tsx`        | broken | Recertification routes are still not on Nest. Follow-up. No new API in this change.                 |
| `/dashboard/support`                          | `pages/learner/SupportPage.tsx`                   | static | Unchanged.                                                                                          |
| `/dashboard/appeals-complaints`               | `pages/learner/AppealsComplaintsPage.tsx`         | broken | Complaint routes are still not registered. The client returns an empty list on failure. Follow-up.  |

### Committee

| Route                                     | Page                                                 | Class  | Evidence                                                                     |
| ----------------------------------------- | ---------------------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| `/dashboard/committee/assigned`           | `CommitteeAssignedPage`                              | wired  | Same list, with links into review, conflict, and vote. Chair note is static. |
| `/dashboard/committee/review`             | `CommitteeReviewPage`                                | wired  | Case id comes from the assigned-case link.                                   |
| `/dashboard/committee/conflict`           | `CommitteeConflictPage`                              | wired  | Same `POST .../conflict-declaration`.                                        |
| `/dashboard/committee/decision`           | `CommitteeDecisionPage`                              | wired  | Same `POST .../votes`. Chair confirm and composition stay not implemented.   |
| `/dashboard/committee/case-file`          | `pages/committee/CaseFilePage.tsx`                   | wired  | Unchanged.                                                                   |
| `/dashboard/committee/exam-queue`         | `pages/committee/ExamDecisionQueuePage.tsx`          | wired  | Unchanged.                                                                   |
| `/dashboard/committee/pilot-applications` | `pages/committee/CommitteePilotApplicationsPage.tsx` | static | Unchanged.                                                                   |

### Administration and ISO

| Route                                 | Page                                         | Class  | Evidence                                                                                                                                    |
| ------------------------------------- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dashboard/admin/item-bank`          | `pages/admin/ItemBankPage.tsx`               | wired  | Unchanged. `exam-approver` stays refused (OD-AUTH-31).                                                                                      |
| `/dashboard/admin/exam-blueprint`     | `pages/admin/ExamBlueprintPage.tsx`          | wired  | Unchanged.                                                                                                                                  |
| `/dashboard/admin/reports`            | `pages/admin/AdminReportsPage.tsx`           | wired  | Unchanged.                                                                                                                                  |
| `/dashboard/admin/education`          | `pages/admin/AdminEducationPage.tsx`         | static | States that programme administration is not implemented. No summary cards.                                                                  |
| `/dashboard/admin/identity-review`    | `pages/admin/IdentityReviewPage.tsx`         | broken | The page still asks for `GET /v1/staff/identity-review/queue`, which Nest does not serve. The failure state names that and shows no person. |
| `/dashboard/admin/support`            | `pages/admin/SupportAdminPage.tsx`           | static | Unchanged.                                                                                                                                  |
| `/dashboard/admin/recertification`    | `pages/admin/AdminRecertificationPage.tsx`   | static | Unchanged.                                                                                                                                  |
| `/dashboard/admin/appeals-complaints` | `pages/staff/StaffAppealsComplaintsPage.tsx` | broken | Staff grievance routes are still not registered. Follow-up.                                                                                 |
| `/dashboard/iso/applications`         | `pages/admin/CertificationDashboard.tsx`     | static | Unchanged.                                                                                                                                  |
| `/dashboard/iso/appeals`              | `pages/staff/StaffAppealsComplaintsPage.tsx` | broken | Same missing grievance routes.                                                                                                              |
| `/dashboard/iso/complaints`           | `pages/iso/ComplaintsIsoPage.tsx`            | broken | Same missing grievance routes.                                                                                                              |
| `/dashboard/iso/reports`              | `pages/iso/IsoReportsPage.tsx`               | broken | Aggregate report summary is still not a Nest route. The page surfaces the unavailable error.                                                |

### After counts

| Class  | Routes |
| ------ | ------ |
| wired  | 29     |
| broken | 7      |
| static | 8      |
| mock   | 0      |

### Follow-ups (no API invented here)

- Admin education CRUD, enrolments, and education reports.
- Identity-review queue and user or tenant administration.
- Candidate exam registration and booking.
- Appeals and complaints controllers.
- ISO aggregate reports beyond the two certification-application reports that already exist.
- Recertification API.
- Chair appointment record (OD-AUTH-32). Chair buttons stay not implemented.
- Exam-result approver is not `COM_TECH` (OD-AUTH-31). No new role.
- Distributed rate limiting. The current limiter is process-local.
- Public catalogue scope is OD-CAT-01, PROPOSED and not accepted. `PUBLISHED` is not internet-public. A per-course public-visibility flag is a possible later alternative.
- Authenticated search by sequential certificate number still returns the holder name. That stays a separate change.
- Module progress separate from the course player.
