import { api } from "@/lib/api";

export type AdminCourseRow = {
  readonly id: string;
  readonly status: string;
  readonly titleI18n: Record<string, string> | null;
  readonly scopeId: string;
  readonly durationMin: number | null;
  readonly languages: readonly string[];
  readonly targetAudience: string | null;
  readonly updatedAt: string;
};

export type AdminCourseDetail = AdminCourseRow & {
  readonly objective: string | null;
  readonly descriptionI18n: Record<string, string> | null;
  readonly knowledgePoints: readonly {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly description: string | null;
  }[];
};

export function pickI18n(json: Record<string, string> | null | undefined, locale = "en"): string {
  if (!json) return "";
  return json[locale] ?? json.en ?? Object.values(json)[0] ?? "";
}

export async function fetchAdminCourses(status?: string): Promise<AdminCourseRow[]> {
  const qs = status?.trim() ? `?status=${encodeURIComponent(status.trim())}` : "";
  const { data } = await api.get<AdminCourseRow[]>(`/v1/admin/courses${qs}`);
  return data;
}

export async function fetchAdminCourseDetail(courseId: string): Promise<AdminCourseDetail> {
  const { data } = await api.get<AdminCourseDetail>(`/v1/admin/courses/${encodeURIComponent(courseId)}`);
  return data;
}

export async function createAdminCourseDraft(body: {
  scopeId: string;
  titleI18n?: Record<string, string>;
}): Promise<AdminCourseDetail> {
  const { data } = await api.post<AdminCourseDetail>("/v1/admin/courses", body);
  return data;
}

export async function patchAdminCourse(
  courseId: string,
  patch: Record<string, unknown>,
): Promise<AdminCourseDetail> {
  const { data } = await api.patch<AdminCourseDetail>(
    `/v1/admin/courses/${encodeURIComponent(courseId)}`,
    patch,
  );
  return data;
}

export async function publishAdminCourse(courseId: string): Promise<unknown> {
  const { data } = await api.post(`/v1/admin/courses/${encodeURIComponent(courseId)}/actions/publish`);
  return data;
}

export async function archiveAdminCourse(courseId: string): Promise<unknown> {
  const { data } = await api.post(`/v1/admin/courses/${encodeURIComponent(courseId)}/actions/archive`);
  return data;
}

export async function addAdminKnowledgePoint(
  courseId: string,
  body: { code: string; name: string; description?: string },
): Promise<unknown> {
  const { data } = await api.post(
    `/v1/admin/courses/${encodeURIComponent(courseId)}/knowledge-points`,
    body,
  );
  return data;
}

export type AdminCourseEnrolmentRow = {
  readonly id: string;
  readonly learnerId: string;
  readonly learnerEmail: string;
  readonly learnerName: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly enrolmentStatus: string;
  readonly progressStatus: string;
  readonly progressPct: number;
  readonly enrolledAt: string;
  readonly completedAt: string | null;
  readonly evidence: { readonly type: string; readonly reference: string; readonly note?: string } | null;
};

export type AdminEducationReport = {
  readonly generatedAt: string;
  readonly readOnly: boolean;
  readonly items: readonly {
    readonly courseId: string;
    readonly courseTitle: string;
    readonly learnerEmail: string;
    readonly enrolmentId: string;
    readonly enrolmentStatus: string;
    readonly progressStatus: string;
    readonly progressPct: number;
    readonly enrolledAt: string;
    readonly completedAt: string | null;
    readonly evidence: AdminCourseEnrolmentRow["evidence"];
  }[];
};

export async function fetchAdminCourseEnrolments(courseId: string): Promise<AdminCourseEnrolmentRow[]> {
  const { data } = await api.get<AdminCourseEnrolmentRow[]>(
    `/v1/admin/education/courses/${encodeURIComponent(courseId)}/enrolments`,
  );
  return data;
}

export async function fetchAdminEducationEnrolmentsReport(courseId?: string): Promise<AdminEducationReport> {
  const qs = courseId?.trim() ? `?courseId=${encodeURIComponent(courseId.trim())}` : "";
  const { data } = await api.get<AdminEducationReport>(`/v1/admin/education/reports/enrolments${qs}`);
  return data;
}

export async function fetchAdminEducationCompletionsReport(courseId?: string): Promise<AdminEducationReport> {
  const qs = courseId?.trim() ? `?courseId=${encodeURIComponent(courseId.trim())}` : "";
  const { data } = await api.get<AdminEducationReport>(`/v1/admin/education/reports/completions${qs}`);
  return data;
}

export type AdminEducationProgressReport = AdminEducationReport & {
  readonly progressDistribution: {
    readonly NOT_STARTED: number;
    readonly IN_PROGRESS: number;
    readonly COMPLETED: number;
  };
  readonly moduleLevelProgress: boolean;
};

export type AdminEducationCourseSummaryReport = {
  readonly generatedAt: string;
  readonly readOnly: boolean;
  readonly items: readonly {
    readonly courseId: string;
    readonly title: string;
    readonly status: string;
    readonly enrolmentCount: number;
    readonly completionCount: number;
    readonly outcomeCount: number;
    readonly moduleCount: number;
    readonly trainerName: string | null;
  }[];
};

export type AdminEducationDashboard = {
  readonly generatedAt: string;
  readonly readOnly: boolean;
  readonly enrolmentCount: number;
  readonly completionCount: number;
  readonly completionRate?: number;
  readonly progressDistribution: AdminEducationProgressReport["progressDistribution"];
  readonly publicCourseCount: number;
  readonly draftCourseCount: number;
  readonly reportExportCount?: number;
  readonly notificationActivityCount?: number;
  readonly chartData?: {
    readonly progressDistribution: readonly { readonly label: string; readonly value: number }[];
    readonly courseStatus: readonly { readonly label: string; readonly value: number }[];
    readonly enrolmentByStatus?: readonly { readonly label: string; readonly value: number }[];
    readonly activity?: readonly { readonly label: string; readonly value: number }[];
  };
};

export type PublishReadiness = {
  readonly courseId: string;
  readonly status: string;
  readonly readyForCatalogue: boolean;
  readonly publishAllowed: boolean;
  readonly readinessScore: number;
  readonly blockedReasons: readonly string[];
  readonly checks: readonly { readonly id: string; readonly label: string; readonly pass: boolean; readonly detail: string }[];
  readonly boundaryNote: string;
};

export type ProgrammeMetadata = {
  readonly modules: readonly {
    readonly id: string;
    readonly title: string;
    readonly description: string | null;
    readonly order: number;
    readonly durationMin: number | null;
  }[];
  readonly trainer: { readonly name: string; readonly email: string | null; readonly role: string | null } | null;
};

export async function fetchAdminEducationProgressReport(courseId?: string): Promise<AdminEducationProgressReport> {
  const qs = courseId?.trim() ? `?courseId=${encodeURIComponent(courseId.trim())}` : "";
  const { data } = await api.get<AdminEducationProgressReport>(`/v1/admin/education/reports/progress${qs}`);
  return data;
}

export async function fetchAdminEducationCourseSummaryReport(): Promise<AdminEducationCourseSummaryReport> {
  const { data } = await api.get<AdminEducationCourseSummaryReport>("/v1/admin/education/reports/course-summary");
  return data;
}

export async function fetchAdminEducationDashboard(): Promise<AdminEducationDashboard> {
  const { data } = await api.get<AdminEducationDashboard>("/v1/admin/education/reports/dashboard");
  return data;
}

export async function fetchAdminCoursePublishReadiness(courseId: string): Promise<PublishReadiness> {
  const { data } = await api.get<PublishReadiness>(
    `/v1/admin/education/courses/${encodeURIComponent(courseId)}/publish-readiness`,
  );
  return data;
}

export async function fetchAdminCourseProgramme(courseId: string): Promise<ProgrammeMetadata> {
  const { data } = await api.get<ProgrammeMetadata>(
    `/v1/admin/education/courses/${encodeURIComponent(courseId)}/programme`,
  );
  return data;
}

export async function patchAdminCourseProgramme(
  courseId: string,
  body: ProgrammeMetadata,
): Promise<ProgrammeMetadata> {
  const { data } = await api.patch<ProgrammeMetadata>(
    `/v1/admin/education/courses/${encodeURIComponent(courseId)}/programme`,
    body,
  );
  return data;
}

export type AdminModuleProgress = {
  readonly enrollmentId: string;
  readonly courseId: string;
  readonly learnerEmail: string;
  readonly modules: readonly {
    readonly moduleId: string;
    readonly title: string;
    readonly order: number;
    readonly status: string;
  }[];
  readonly progressPct: number;
  readonly progressStatus: string;
  readonly moduleLevelProgress: boolean;
};

export async function fetchAdminEnrolmentModuleProgress(enrollmentId: string): Promise<AdminModuleProgress> {
  const { data } = await api.get<AdminModuleProgress>(
    `/v1/admin/education/enrolments/${encodeURIComponent(enrollmentId)}/modules/progress`,
  );
  return data;
}

export type EducationAuditEvent = {
  readonly id: string;
  readonly occurredAt: string;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId: string | null;
  readonly actorId: string | null;
  readonly actorRole: string | null;
  readonly newValue: unknown;
};

export async function fetchAdminEducationAuditEvents(opts?: {
  enrollmentId?: string;
  courseId?: string;
}): Promise<{ readOnly: boolean; items: EducationAuditEvent[] }> {
  const sp = new URLSearchParams();
  if (opts?.enrollmentId) sp.set("enrollmentId", opts.enrollmentId);
  if (opts?.courseId) sp.set("courseId", opts.courseId);
  const qs = sp.toString();
  const { data } = await api.get<{ readOnly: boolean; items: EducationAuditEvent[] }>(
    `/v1/admin/education/audit-events${qs ? `?${qs}` : ""}`,
  );
  return data;
}

export function adminEducationCsvUrl(kind: "enrolments" | "completions", courseId?: string): string {
  const base = `/v1/admin/education/reports/${kind}.csv`;
  return courseId?.trim() ? `${base}?courseId=${encodeURIComponent(courseId.trim())}` : base;
}

export async function downloadAdminEducationCsv(kind: "enrolments" | "completions", courseId?: string): Promise<void> {
  const { data } = await api.get<string>(adminEducationCsvUrl(kind, courseId), { responseType: "text" });
  const blob = new Blob([data], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = kind === "enrolments" ? "education-enrolments.csv" : "education-completions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export type AssignableTrainer = {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
};

export type EducationNotificationRow = {
  readonly id: string;
  readonly occurredAt: string;
  readonly action: string;
  readonly eventKey: string;
  readonly recipientEmail: string;
  readonly mailSent: boolean;
  readonly status: string;
  readonly enrollmentId: string | null;
  readonly synthetic: boolean;
};

export type EducationCompletionCertificate = {
  readonly kind: "EDUCATION_COMPLETION_CERTIFICATE";
  readonly reference: string;
  readonly enrollmentId: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly learnerName: string;
  readonly learnerEmail: string;
  readonly completedAt: string;
  readonly issuedAt: string;
  readonly documentKey: string | null;
  readonly boundaryNote: string;
  readonly synthetic?: boolean;
};

export async function fetchAdminAssignableTrainers(): Promise<AssignableTrainer[]> {
  const { data } = await api.get<AssignableTrainer[]>("/v1/admin/education/trainers");
  return data;
}

export async function fetchAdminEducationNotifications(): Promise<{
  readOnly: boolean;
  mailhogConfigured: boolean;
  items: EducationNotificationRow[];
}> {
  const { data } = await api.get("/v1/admin/education/notifications");
  return data;
}

export async function fetchAdminCompletionCertificate(enrollmentId: string): Promise<EducationCompletionCertificate> {
  const { data } = await api.get<EducationCompletionCertificate>(
    `/v1/admin/education/enrolments/${encodeURIComponent(enrollmentId)}/completion-certificate`,
  );
  return data;
}

export function adminEducationXlsxUrl(kind: "enrolments" | "completions", courseId?: string): string {
  const base = `/v1/admin/education/reports/${kind}.xlsx`;
  return courseId?.trim() ? `${base}?courseId=${encodeURIComponent(courseId.trim())}` : base;
}

export function adminEducationDashboardPdfUrl(): string {
  return "/v1/admin/education/reports/dashboard.pdf";
}

export async function downloadAdminEducationXlsx(kind: "enrolments" | "completions", courseId?: string): Promise<void> {
  const { data } = await api.get<ArrayBuffer>(adminEducationXlsxUrl(kind, courseId), {
    responseType: "arraybuffer",
  });
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = kind === "enrolments" ? "education-enrolments.xlsx" : "education-completions.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadAdminEducationDashboardPdf(): Promise<void> {
  const { data } = await api.get<ArrayBuffer>(adminEducationDashboardPdfUrl(), { responseType: "arraybuffer" });
  const blob = new Blob([data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "education-dashboard.pdf";
  a.click();
  URL.revokeObjectURL(url);
}
