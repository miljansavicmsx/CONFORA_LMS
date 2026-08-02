/**
 * ISO 17024 — Exam engine (start, submit, istorija).
 */

import { api } from "@/lib/api";

export type ExamDifficulty = "EASY" | "MEDIUM" | "HARD";

/** Težine za start ispita (backend prihvata EASY / MEDIUM / HARD). */
export type ExamDifficultyBalance = Record<string, number>;

export type ExamQuestionPublic = {
  readonly questionId: string;
  readonly courseId: string;
  readonly questionText: string;
  readonly scenarioText?: string | null;
  readonly scenarioGroupId?: string | null;
  readonly questionType?: string;
  readonly options: string[];
  readonly difficulty: string;
  readonly timeLimitSeconds: number;
  readonly isAIGenerated: boolean;
};

export type ExamStartResponse = {
  readonly attemptId: string;
  readonly sessionId?: string;
  readonly startTime: string;
  readonly courseId: string;
  readonly questions: ExamQuestionPublic[];
  readonly requestedCount: number;
  readonly deliveredCount: number;
  /** Zbroj sekundi po pitanju (referentno za countdown / planiranje). */
  readonly totalTimeLimitSeconds?: number;
  readonly verificationRequired?: boolean;
  /** Kad je true, pitanja se učitavaju jedno-po-jedno uz HMAC odgovore (Module 3). */
  readonly sequentialDelivery?: boolean;
  readonly answerSignSecret?: string;
  readonly totalQuestions?: number;
  readonly examDeadlineIso?: string;
  readonly accommodationFlags?: {
    readonly largePrint: boolean;
    readonly screenReaderCompat: boolean;
    readonly extraTimePct: number;
  };
};

export type ExamSubmitResponse = {
  readonly attemptId: string;
  readonly status: string;
  readonly scorePercent: number;
  readonly passed: boolean;
  readonly correctCount: number;
  readonly totalQuestions: number;
  readonly endedAt: string;
  readonly aiGeneratedQuestionCount: number;
  readonly examPassCertificateId?: string | null;
  readonly retryAvailableUntil?: string | null;
  readonly weakAreaHints?: readonly string[];
  readonly aiAnalysisDraft?: {
    readonly isAiGenerated: boolean;
    readonly status: string;
    readonly purpose: string;
    readonly title: string;
    readonly summary: string;
    readonly weakAreas?: readonly string[];
    readonly recommendations?: readonly string[];
    readonly disclaimer?: string;
  } | null;
  readonly certificationApplicationAvailable?: boolean;
  readonly certificationApplicationHref?: string | null;
};

export type ExamEligibilityResponse = {
  readonly eligible: boolean;
  readonly rulesAccepted: boolean;
  readonly attemptsUsed: number;
  readonly maxAttempts: number;
  readonly cooldownUntil?: string | null;
  readonly reason?: string | null;
  readonly requiresMfa: boolean;
  readonly mfaSatisfied: boolean;
  readonly requiresIdentityCheck: boolean;
  readonly retryBefore?: string | null;
  readonly passingScorePercent: number;
  readonly courseCompleted?: boolean;
};

export type ExamAttemptSummary = {
  readonly attemptId: string;
  readonly courseId: string;
  readonly status: string;
  readonly startedAt: string;
  readonly endedAt?: string | null;
  readonly scorePercent?: number | null;
  readonly numQuestions: number;
  readonly deliveredCount?: number | null;
  readonly verificationStatus?: string | null;
};

export type ExamVerifyPayload = {
  readonly faceImageBase64: string;
  readonly idDocumentBase64: string;
  readonly consentAccepted: boolean;
};

export type ExamVerifyResponse = {
  readonly attemptId: string;
  readonly verificationStatus: string;
  readonly message: string;
};

export async function fetchExamEligibility(courseId: string): Promise<ExamEligibilityResponse> {
  const { data } = await api.get<ExamEligibilityResponse>(
    `/api/exams/eligibility/${encodeURIComponent(courseId)}`,
  );
  return data;
}

export async function acceptExamRules(courseId: string): Promise<void> {
  await api.post("/api/exams/accept-rules", { courseId, ndaAccepted: true });
}

export async function startExam(
  courseId: string,
  numQuestions: number,
  difficultyBalance: ExamDifficultyBalance,
  options?: { readonly rulesAcknowledged?: boolean },
): Promise<ExamStartResponse> {
  const { data } = await api.post<ExamStartResponse>("/api/exams/start", {
    courseId,
    numQuestions,
    difficultyBalance,
    rulesAcknowledged: options?.rulesAcknowledged ?? true,
  });
  return data;
}

export async function submitExam(
  attemptId: string,
  userAnswers: Record<string, number>,
): Promise<ExamSubmitResponse> {
  const { data } = await api.post<ExamSubmitResponse>("/api/exams/submit", {
    attemptId,
    userAnswers,
  });
  return data;
}

export async function fetchMyAttempts(): Promise<ExamAttemptSummary[]> {
  const { data } = await api.get<ExamAttemptSummary[]>("/api/exams/my-attempts");
  return Array.isArray(data) ? data : [];
}

export type ExamSessionQuestionResponse = {
  readonly order: number;
  readonly totalQuestions: number;
  readonly examDeadlineIso: string;
  readonly question: ExamQuestionPublic;
};

export async function fetchExamSessionQuestion(
  sessionId: string,
  order: number,
): Promise<ExamSessionQuestionResponse> {
  const { data } = await api.get<ExamSessionQuestionResponse>(
    `/api/exams/sessions/${encodeURIComponent(sessionId)}/question/${String(order)}`,
  );
  return data;
}

export type ExamResultsResponse = {
  readonly attemptId: string;
  readonly scorePercent: number;
  readonly passed: boolean;
  readonly feedback: readonly {
    readonly order: number;
    readonly questionId: string;
    readonly correct: boolean;
    readonly result: string;
  }[];
};

export async function fetchExamResults(sessionId: string): Promise<ExamResultsResponse> {
  const { data } = await api.get<ExamResultsResponse>(
    `/api/exams/sessions/${encodeURIComponent(sessionId)}/results`,
  );
  return data;
}

export async function postExamSessionAnswer(
  sessionId: string,
  order: number,
  body: { optionIndex: number; clientTs: number; mac: string },
): Promise<void> {
  await api.post(
    `/api/exams/sessions/${encodeURIComponent(sessionId)}/question/${String(order)}/answer`,
    body,
  );
}

export async function postExamProctoringEvent(
  sessionId: string,
  body: { type: string; severity: string; payload?: unknown; isAiGenerated?: boolean },
): Promise<void> {
  await api.post(`/api/exams/sessions/${encodeURIComponent(sessionId)}/proctoring`, body);
}

export async function verifyExamAttempt(
  attemptId: string,
  payload: ExamVerifyPayload,
): Promise<ExamVerifyResponse> {
  const encoded = encodeURIComponent(attemptId);
  const { data } = await api.post<ExamVerifyResponse>(
    `/api/exams/attempts/${encoded}/verify`,
    {
      faceImageBase64: payload.faceImageBase64,
      idDocumentBase64: payload.idDocumentBase64,
      consentAccepted: payload.consentAccepted,
    },
  );
  return data;
}
