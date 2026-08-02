import { api } from "@/lib/api";

export type EducationProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type EducationEnrolment = {
  readonly id: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly enrolmentStatus: string;
  readonly progressStatus: EducationProgressStatus;
  readonly progressPct: number;
  readonly enrolledAt: string;
  readonly completedAt: string | null;
  readonly evidence: {
    readonly type: string;
    readonly reference: string;
    readonly note?: string;
    readonly synthetic?: boolean;
  } | null;
};

export type EducationProgress = {
  readonly enrollmentId: string;
  readonly progressStatus: EducationProgressStatus;
  readonly progressPct: number;
  readonly enrolmentStatus: string;
  readonly completedAt: string | null;
  readonly evidence: EducationEnrolment["evidence"];
};

export async function postEducationEnrolment(courseId: string): Promise<EducationEnrolment> {
  const { data } = await api.post<EducationEnrolment>("/v1/me/education/enrolments", { courseId });
  return data;
}

export async function fetchEducationEnrolments(): Promise<EducationEnrolment[]> {
  const { data } = await api.get<EducationEnrolment[]>("/v1/me/education/enrolments");
  return data;
}

export async function fetchEducationEnrolment(enrollmentId: string): Promise<EducationEnrolment> {
  const { data } = await api.get<EducationEnrolment>(
    `/v1/me/education/enrolments/${encodeURIComponent(enrollmentId)}`,
  );
  return data;
}

export async function fetchEducationProgress(enrollmentId: string): Promise<EducationProgress> {
  const { data } = await api.get<EducationProgress>(
    `/v1/me/education/enrolments/${encodeURIComponent(enrollmentId)}/progress`,
  );
  return data;
}

export async function patchEducationProgress(
  enrollmentId: string,
  body: { progressStatus?: EducationProgressStatus; progressPct?: number },
): Promise<EducationProgress> {
  const { data } = await api.patch<EducationProgress>(
    `/v1/me/education/enrolments/${encodeURIComponent(enrollmentId)}/progress`,
    body,
  );
  return data;
}

export type ModuleProgressItem = {
  readonly moduleId: string;
  readonly title: string;
  readonly order: number;
  readonly status: EducationProgressStatus;
};

export type ModuleProgressSnapshot = {
  readonly enrollmentId: string;
  readonly courseId: string;
  readonly modules: readonly ModuleProgressItem[];
  readonly progressPct: number;
  readonly progressStatus: EducationProgressStatus;
  readonly moduleLevelProgress: boolean;
};

export async function fetchModuleProgress(enrollmentId: string): Promise<ModuleProgressSnapshot> {
  const { data } = await api.get<ModuleProgressSnapshot>(
    `/v1/me/education/enrolments/${encodeURIComponent(enrollmentId)}/modules/progress`,
  );
  return data;
}

export async function patchModuleProgress(
  enrollmentId: string,
  moduleId: string,
  status: EducationProgressStatus,
): Promise<ModuleProgressSnapshot> {
  const { data } = await api.patch<ModuleProgressSnapshot>(
    `/v1/me/education/enrolments/${encodeURIComponent(enrollmentId)}/modules/${encodeURIComponent(moduleId)}/progress`,
    { status },
  );
  return data;
}

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

export async function fetchCompletionCertificate(enrollmentId: string): Promise<EducationCompletionCertificate> {
  const { data } = await api.get<EducationCompletionCertificate>(
    `/v1/me/education/enrolments/${encodeURIComponent(enrollmentId)}/completion-certificate`,
  );
  return data;
}
