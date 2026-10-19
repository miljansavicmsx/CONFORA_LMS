import { api } from "@/lib/api";

export type PublishedCourse = {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly areaCode: string;
  readonly imageObjectKey: string | null;
  readonly language: string;
  readonly priceAmount: string;
  readonly priceCurrency: string;
  readonly typicalLearningTimeMinutes: number | null;
  readonly learningObjectives: string | null;
  readonly educationalLevel: string | null;
  readonly targetAudience: string | null;
  readonly requiresCertification: boolean;
};

export type Catalogue = {
  readonly areas: readonly { readonly code: string }[];
  readonly courses: readonly PublishedCourse[];
};

export type LearningEnrolment = {
  readonly enrolmentId: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly areaCode: string;
  readonly enrolledAt: string;
  readonly progressPercent: number;
  readonly completedAt: string | null;
  readonly paymentState: "PENDING_PAYMENT" | "NOT_REQUIRED";
  readonly amount: string;
  readonly currency: string;
  readonly alreadyEnrolled: boolean;
};

export type PlayerBlock = {
  readonly id: string;
  readonly sequence: number;
  readonly kind: "PDF" | "VIDEO" | "TEXT";
  readonly title: string | null;
  readonly textBody: string | null;
  readonly objectKey: string | null;
};

export type Player = {
  readonly enrolmentId: string;
  readonly paymentState: "PENDING_PAYMENT" | "NOT_REQUIRED";
  readonly course: {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly areaCode: string;
    readonly imageObjectKey: string | null;
    readonly minimumTimeSeconds: number;
    readonly progressPercent: number;
    readonly completedAt: string | null;
  };
  readonly chapters: readonly {
    readonly id: string;
    readonly sequence: number;
    readonly title: string;
    readonly minimumTimeSeconds: number;
    readonly timeSpentSeconds: number;
    readonly lessons: readonly {
      readonly id: string;
      readonly sequence: number;
      readonly title: string;
      readonly minimumTimeSeconds: number;
      readonly timeSpentSeconds: number;
      readonly completed: boolean;
      readonly blocks: readonly PlayerBlock[];
    }[];
    readonly quiz: null | {
      readonly id: string;
      readonly title: string;
      readonly passMarkPercent: number;
      readonly passed: boolean;
      readonly latestScorePercent: number | null;
      readonly items: readonly {
        readonly id: string;
        readonly sequence: number;
        readonly stem: string;
        readonly choices: readonly { readonly choiceKey: string; readonly text: string }[];
      }[];
    };
  }[];
};

export type LearningStatistics = {
  readonly analyticsConsent: boolean;
  readonly enrolments: readonly {
    readonly enrolmentId: string;
    readonly courseId: string;
    readonly courseTitle: string;
    readonly areaCode: string;
    readonly progressPercent: number;
    readonly completedAt: string | null;
    readonly paymentState: "PENDING_PAYMENT" | "NOT_REQUIRED";
  }[];
  readonly quizResults: readonly {
    readonly attemptId: string;
    readonly quizId: string;
    readonly quizTitle: string;
    readonly courseTitle: string;
    readonly scorePercent: number;
    readonly passed: boolean;
    readonly submittedAt: string;
  }[];
};

const CART_KEY = "confora.learning.cart.v1";

export function readLearningCart(): readonly string[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function writeLearningCart(courseIds: readonly string[]): void {
  window.localStorage.setItem(CART_KEY, JSON.stringify([...new Set(courseIds)]));
}

export async function fetchLearningCatalogue(areaCode?: string): Promise<Catalogue> {
  const { data } = await api.get<Catalogue>("/v1/me/learning/courses", {
    params: areaCode ? { areaCode } : undefined,
  });
  return data;
}

export async function fetchMyLearningEnrolments(): Promise<readonly LearningEnrolment[]> {
  const { data } = await api.get<readonly LearningEnrolment[]>("/v1/me/learning/enrolments");
  return data;
}

export async function enrolInLearningCourse(courseId: string): Promise<LearningEnrolment> {
  const { data } = await api.post<LearningEnrolment>("/v1/me/learning/enrolments", { courseId });
  return data;
}

export async function fetchCoursePlayer(enrolmentId: string): Promise<Player> {
  const { data } = await api.get<Player>(`/v1/me/learning/enrolments/${enrolmentId}/player`);
  return data;
}

export async function recordLessonProgress(
  enrolmentId: string,
  lessonId: string,
  body: { additionalSeconds: number; statementId: string; analyticsConsent?: boolean },
): Promise<{ completed: boolean; timeSpentSeconds: number; progressPercent: number }> {
  const { data } = await api.post(`/v1/me/learning/enrolments/${enrolmentId}/lessons/${lessonId}/progress`, body);
  return data;
}

export async function submitChapterQuiz(
  enrolmentId: string,
  quizId: string,
  body: { statementId: string; answers: readonly { itemId: string; choiceKey: string }[]; analyticsConsent?: boolean },
): Promise<{ scorePercent: number; passed: boolean; results: readonly { itemId: string; correct: boolean }[] }> {
  const { data } = await api.post(
    `/v1/me/learning/enrolments/${enrolmentId}/quizzes/${quizId}/attempts`,
    body,
  );
  return data;
}

export async function fetchLearningStatistics(): Promise<LearningStatistics> {
  const { data } = await api.get<LearningStatistics>("/v1/me/learning/statistics");
  return data;
}

export async function saveAnalyticsConsent(granted: boolean): Promise<{ granted: boolean }> {
  const { data } = await api.put<{ granted: boolean }>("/v1/me/learning/analytics-consent", { granted });
  return data;
}
