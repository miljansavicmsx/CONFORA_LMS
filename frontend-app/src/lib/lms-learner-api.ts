import { api } from "@/lib/api";

export type CatalogCourseRow = {
  readonly id: string;
  readonly title: string;
  readonly descriptionPreview: string;
  readonly scope: { readonly id: string; readonly name: string };
  readonly languages: readonly string[];
  readonly targetAudience: string | null;
  readonly durationMin: number | null;
  readonly previewUrl: string | null;
  readonly coverImage: string | null;
  readonly price: { readonly amount: string; readonly currency: string };
};

export type CatalogLearningOutcome = {
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
};

export type CatalogCourseDetail = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly objective: string | null;
  readonly learningOutcomes?: readonly CatalogLearningOutcome[];
  readonly prerequisites: string | null;
  readonly targetAudience: string | null;
  readonly referenceMaterials: readonly { type: string; url: string }[];
  readonly previewUrl: string | null;
  readonly coverImage: string | null;
  readonly price: { readonly amount: string; readonly currency: string };
  readonly scope: { readonly id: string; readonly name: string };
  readonly programmeModules?: readonly {
    readonly id: string;
    readonly title: string;
    readonly description: string | null;
    readonly order: number;
    readonly durationMin: number | null;
  }[];
  readonly trainer?: { readonly name: string; readonly role: string | null } | null;
  readonly syllabus: readonly {
    readonly id: string;
    readonly title: string;
    readonly order: number;
    readonly lessons: readonly {
      readonly id: string;
      readonly title: string;
      readonly order: number;
      readonly locked: boolean;
      readonly content: unknown;
    }[];
  }[];
};

export async function fetchCatalogCourses(params: {
  scopeId?: string;
  language?: string;
  maxPrice?: number;
  level?: string;
}): Promise<CatalogCourseRow[]> {
  const sp = new URLSearchParams();
  if (params.scopeId) sp.set("scopeId", params.scopeId);
  if (params.language) sp.set("language", params.language);
  if (params.maxPrice != null) sp.set("maxPrice", String(params.maxPrice));
  if (params.level) sp.set("level", params.level);
  const qs = sp.toString();
  const { data } = await api.get<CatalogCourseRow[]>(`/v1/catalog/courses${qs ? `?${qs}` : ""}`);
  return data;
}

export async function fetchCatalogCourseDetail(courseId: string): Promise<CatalogCourseDetail> {
  const { data } = await api.get<CatalogCourseDetail>(`/v1/catalog/courses/${encodeURIComponent(courseId)}`);
  return data;
}

export async function postStripeCheckout(courseIds: string[]): Promise<{ sessionId: string; url: string }> {
  const { data } = await api.post<{ sessionId: string; url: string }>("/v1/me/checkout/stripe", { courseIds });
  return data;
}

export async function postStripeConfirm(sessionId: string): Promise<unknown> {
  const { data } = await api.post<unknown>("/v1/me/checkout/stripe/confirm", { sessionId });
  return data;
}

export type PlayerState = {
  readonly enrollmentId: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly progressPct: number;
  readonly examReady: boolean;
  readonly chapters: readonly {
    readonly id: string;
    readonly title: string;
    readonly order: number;
    readonly lessons: readonly {
      readonly id: string;
      readonly title: string;
      readonly order: number;
      readonly minTimeSec: number;
      readonly content: unknown;
      readonly timeSpentSec: number;
      readonly completedAt: string | null;
      readonly quizPassed: boolean;
      readonly quizScorePct: number | null;
      readonly hasCheckpointQuiz: boolean;
      readonly resources: readonly { type: string; urlOrInline: string | null }[];
    }[];
  }[];
};

export async function fetchPlayerState(enrollmentId: string): Promise<PlayerState> {
  const { data } = await api.get<PlayerState>(`/v1/me/player/${encodeURIComponent(enrollmentId)}`);
  return data;
}

export async function postLessonHeartbeat(
  enrollmentId: string,
  lessonId: string,
  deltaSec: number,
): Promise<{ lessonId: string; timeSpentSec: number }> {
  const { data } = await api.post<{ lessonId: string; timeSpentSec: number }>(
    `/v1/me/player/${encodeURIComponent(enrollmentId)}/lessons/${encodeURIComponent(lessonId)}/heartbeat`,
    { deltaSec },
  );
  return data;
}

export async function postLessonComplete(
  enrollmentId: string,
  lessonId: string,
): Promise<{ lessonId: string; progressPct: number }> {
  const { data } = await api.post<{ lessonId: string; progressPct: number }>(
    `/v1/me/player/${encodeURIComponent(enrollmentId)}/lessons/${encodeURIComponent(lessonId)}/complete`,
    {},
  );
  return data;
}

export async function postLessonQuiz(
  enrollmentId: string,
  lessonId: string,
  answers: Record<string, unknown>,
): Promise<{ passed: boolean; scorePct: number }> {
  const { data } = await api.post<{ passed: boolean; scorePct: number }>(
    `/v1/me/player/${encodeURIComponent(enrollmentId)}/lessons/${encodeURIComponent(lessonId)}/quiz`,
    { answers },
  );
  return data;
}

export async function fetchMyEnrollments(): Promise<
  readonly { readonly id: string; readonly courseId: string; readonly progressPct: number; readonly title: string }[]
> {
  const { data } = await api.get<
    readonly { readonly id: string; readonly courseId: string; readonly progressPct: number; readonly title: string }[]
  >("/v1/me/enrollments");
  return data;
}
