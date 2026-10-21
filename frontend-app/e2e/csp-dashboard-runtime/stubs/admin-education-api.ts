/**
 * Playwright F4-smoke / Vitest stub for missing `@/lib/admin-education-api`.
 * Production must not ship a shim at `src/lib/admin-education-api.ts`.
 */

export function pickI18n(value: unknown): string {
  return typeof value === "string" ? value : "";
}

async function emptyList(): Promise<unknown[]> {
  return [];
}

async function emptyRecord(): Promise<Record<string, unknown>> {
  return {};
}

export const archiveAdminCourse = emptyRecord;
export const createAdminCourseDraft = emptyRecord;
export const downloadAdminEducationCsv = emptyRecord;
export const downloadAdminEducationDashboardPdf = emptyRecord;
export const downloadAdminEducationXlsx = emptyRecord;
export const fetchAdminAssignableTrainers = emptyList;
export const fetchAdminCompletionCertificate = emptyRecord;
export const fetchAdminCourseDetail = emptyRecord;
export const fetchAdminCourseEnrolments = emptyList;
export const fetchAdminCourseProgramme = emptyRecord;
export const fetchAdminCoursePublishReadiness = emptyRecord;
export const fetchAdminCourses = emptyList;
export const fetchAdminEducationAuditEvents = emptyList;
export const fetchAdminEducationCompletionsReport = emptyRecord;
export const fetchAdminEducationCourseSummaryReport = emptyRecord;
export const fetchAdminEducationDashboard = emptyRecord;
export const fetchAdminEducationEnrolmentsReport = emptyRecord;
export const fetchAdminEducationNotifications = emptyList;
export const fetchAdminEducationProgressReport = emptyRecord;
export const fetchAdminEnrolmentModuleProgress = emptyRecord;
export const patchAdminCourse = emptyRecord;
export const patchAdminCourseProgramme = emptyRecord;
export const publishAdminCourse = emptyRecord;
