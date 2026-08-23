import { api } from "@/lib/api";

export type EducationProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type EducationEnrolmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type EducationEnrolment = {
  readonly id: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly progressStatus: EducationProgressStatus | string | null;
  readonly enrolmentStatus: EducationEnrolmentStatus | string | null;
  readonly progressPct: number;
  readonly completedAt: string | null;
};

export type EducationModuleProgress = { readonly moduleId: string; readonly order: number; readonly title: string; readonly status: EducationProgressStatus | string | null };
export type EducationModuleProgressResponse = { readonly modules: readonly EducationModuleProgress[]; readonly progressPct: number; readonly progressStatus: EducationProgressStatus | string | null };
export type EducationCompletionCertificate = { readonly reference: string; readonly courseTitle: string; readonly completedAt: string };

function boundedProgress(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

function asEnrolment(value: unknown): EducationEnrolment | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.courseId !== "string" || typeof row.courseTitle !== "string") return null;
  return { id: row.id, courseId: row.courseId, courseTitle: row.courseTitle, progressStatus: typeof row.progressStatus === "string" ? row.progressStatus : null, enrolmentStatus: typeof row.enrolmentStatus === "string" ? row.enrolmentStatus : null, progressPct: boundedProgress(row.progressPct), completedAt: typeof row.completedAt === "string" ? row.completedAt : null };
}

/** Uses the existing learner enrollment authority from the endpoint registry. */
export async function fetchEducationEnrolments(): Promise<readonly EducationEnrolment[]> {
  const { data } = await api.get<unknown>("/v1/me/enrollments");
  const rows = Array.isArray(data) ? data : data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items) ? (data as { items: unknown[] }).items : [];
  return rows.map(asEnrolment).filter((row): row is EducationEnrolment => row !== null);
}

/** Uses the pre-existing learning progress route; unknown payloads remain empty, not complete. */
export async function fetchModuleProgress(enrollmentId: string): Promise<EducationModuleProgressResponse> {
  const { data } = await api.get<unknown>("/api/learning/progress", { params: { enrollmentId } });
  const raw = data && typeof data === "object" && Array.isArray((data as { modules?: unknown }).modules) ? (data as { modules: unknown[] }).modules : [];
  const modules = raw.flatMap((value): EducationModuleProgress[] => {
    if (!value || typeof value !== "object") return [];
    const row = value as Record<string, unknown>;
    if (typeof row.moduleId !== "string" || typeof row.title !== "string" || typeof row.order !== "number") return [];
    return [{ moduleId: row.moduleId, title: row.title, order: row.order, status: typeof row.status === "string" ? row.status : null }];
  });
  const aggregate = data && typeof data === "object" ? data as Record<string, unknown> : {};
  return { modules, progressPct: boundedProgress(aggregate.progressPct), progressStatus: typeof aggregate.progressStatus === "string" ? aggregate.progressStatus : null };
}

export async function patchModuleProgress(enrollmentId: string, moduleId: string, status: EducationProgressStatus): Promise<void> {
  await api.patch("/api/learning/progress", { enrollmentId, moduleId, status });
}

/** There is no registered learner completion-certificate retrieval endpoint in this baseline. Fail closed without fabricating a certificate. */
export async function fetchCompletionCertificate(_enrollmentId: string): Promise<EducationCompletionCertificate | null> {
  return null;
}
