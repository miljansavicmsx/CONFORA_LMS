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

function boundedProgress(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

function asEnrolment(value: unknown): EducationEnrolment | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.enrolmentId !== "string" || typeof row.courseId !== "string" || typeof row.courseTitle !== "string") {
    return null;
  }
  const progressPct = boundedProgress(row.progressPercent);
  const completedAt = typeof row.completedAt === "string" ? row.completedAt : null;
  const completed = completedAt !== null || progressPct >= 100;
  return {
    id: row.enrolmentId,
    courseId: row.courseId,
    courseTitle: row.courseTitle,
    progressStatus: completed ? "COMPLETED" : progressPct > 0 ? "IN_PROGRESS" : "NOT_STARTED",
    enrolmentStatus: completed ? "COMPLETED" : "ACTIVE",
    progressPct,
    completedAt,
  };
}

/** Learner enrolments from the existing Nest learning API. */
export async function fetchEducationEnrolments(): Promise<readonly EducationEnrolment[]> {
  const { data } = await api.get<unknown>("/v1/me/learning/enrolments");
  const rows = Array.isArray(data) ? data : [];
  return rows.map(asEnrolment).filter((row): row is EducationEnrolment => row !== null);
}
