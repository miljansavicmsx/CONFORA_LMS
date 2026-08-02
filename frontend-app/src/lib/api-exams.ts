/**
 * ISO 17024 — Item bank (MCQ) API.
 */

import { api } from "@/lib/api";

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

/** Životni ciklus stavke u banci (backend ItemBankQuestionStatus). */
export type ItemBankQuestionStatus =
  | "DRAFT"
  | "AI_SUGGESTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "REJECTED"
  | "RETIRED"
  /** @deprecated backend normalizira u AI_SUGGESTED */
  | "DRAFT_AI"
  /** @deprecated backend normalizira u RETIRED */
  | "ARCHIVED";

export type ItemBankQuestionType = "MCQ_SINGLE" | "MCQ_MULTI" | "TRUE_FALSE";

/** Odgovor liste / CRUD — usklađeno s backend ``ItemBankQuestionResponse``. */
export type ItemBankQuestion = {
  readonly questionId: string;
  readonly courseId: string;
  readonly questionText: string;
  readonly scenarioText?: string | null;
  readonly scenarioGroupId?: string | null;
  readonly questionType: ItemBankQuestionType;
  readonly options: string[];
  readonly correctOptionIndex: number;
  readonly correctOptionIndices?: readonly number[] | null;
  readonly allowMultipleCorrect: boolean;
  readonly timeLimitSeconds: number;
  readonly difficulty: QuestionDifficulty;
  readonly isAIGenerated: boolean;
  readonly status: ItemBankQuestionStatus;
  readonly version: number;
  readonly derivedFromQuestionId?: string | null;
  readonly createdAt: string;
};

/** Payload za POST — ``ItemBankQuestionCreateRequest``. */
export type ItemBankQuestionCreatePayload = {
  readonly courseId: string;
  readonly questionText: string;
  readonly scenarioText?: string | null;
  readonly scenarioGroupId?: string | null;
  readonly questionType?: ItemBankQuestionType;
  readonly options: string[];
  readonly correctOptionIndex: number;
  readonly correctOptionIndices?: readonly number[] | null;
  readonly allowMultipleCorrect?: boolean;
  readonly timeLimitSeconds: number;
  readonly difficulty: QuestionDifficulty;
  readonly isAIGenerated?: boolean;
};

/** Payload za PUT — polja opcionalna na backendu. */
export type ItemBankQuestionUpdatePayload = {
  readonly courseId?: string;
  readonly questionText?: string;
  readonly scenarioText?: string | null;
  readonly scenarioGroupId?: string | null;
  readonly questionType?: ItemBankQuestionType;
  readonly options?: string[];
  readonly correctOptionIndex?: number;
  readonly correctOptionIndices?: readonly number[] | null;
  readonly allowMultipleCorrect?: boolean;
  readonly timeLimitSeconds?: number;
  readonly difficulty?: QuestionDifficulty;
  readonly isAIGenerated?: boolean;
};

function normalizeQuestion(q: ItemBankQuestion): ItemBankQuestion {
  const st = q.status === "ARCHIVED" ? "RETIRED" : q.status;
  return {
    ...q,
    questionType: q.questionType ?? "MCQ_SINGLE",
    allowMultipleCorrect: q.allowMultipleCorrect ?? false,
    version: q.version ?? 1,
    status: st ?? "ACTIVE",
  };
}

export async function fetchQuestions(courseId: string): Promise<ItemBankQuestion[]> {
  const { data } = await api.get<ItemBankQuestion[]>(
    `/api/exams/item-bank/${encodeURIComponent(courseId)}`,
  );
  const arr = Array.isArray(data) ? data : [];
  return arr.map(normalizeQuestion);
}

export async function createQuestion(payload: ItemBankQuestionCreatePayload): Promise<ItemBankQuestion> {
  const { data } = await api.post<ItemBankQuestion>("/api/exams/item-bank", payload);
  return normalizeQuestion(data);
}

export async function updateQuestion(
  questionId: string,
  payload: ItemBankQuestionUpdatePayload,
): Promise<ItemBankQuestion> {
  const { data } = await api.put<ItemBankQuestion>(
    `/api/exams/item-bank/${encodeURIComponent(questionId)}`,
    payload,
  );
  return normalizeQuestion(data);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await api.delete(`/api/exams/item-bank/${encodeURIComponent(questionId)}`);
}

/** Tehničko povjerenstvo: sadržaj AI_SUGGESTED / UNDER_REVIEW → APPROVED. */
export async function approveQuestionContent(questionId: string): Promise<ItemBankQuestion> {
  const { data } = await api.put<ItemBankQuestion>(
    `/api/exams/item-bank/${encodeURIComponent(questionId)}/approve`,
    {},
  );
  return normalizeQuestion(data);
}

/** Tehničko povjerenstvo: AI_SUGGESTED / UNDER_REVIEW → REJECTED (ne u aktivnu banku). */
export async function rejectQuestionAiContent(
  questionId: string,
  payload?: { readonly reason?: string | null },
): Promise<ItemBankQuestion> {
  const { data } = await api.put<ItemBankQuestion>(
    `/api/exams/item-bank/${encodeURIComponent(questionId)}/reject-content`,
    payload ?? {},
  );
  return normalizeQuestion(data);
}

/** Urednik: APPROVED → ACTIVE (rotacija ispita). */
export async function publishQuestionToBank(questionId: string): Promise<ItemBankQuestion> {
  const { data } = await api.put<ItemBankQuestion>(
    `/api/exams/item-bank/${encodeURIComponent(questionId)}/publish`,
    {},
  );
  return normalizeQuestion(data);
}

/** Urednik: DRAFT / AI_SUGGESTED → UNDER_REVIEW. */
export async function submitQuestionForReview(questionId: string): Promise<ItemBankQuestion> {
  const { data } = await api.post<ItemBankQuestion>(
    `/api/exams/item-bank/${encodeURIComponent(questionId)}/submit-for-review`,
    {},
  );
  return normalizeQuestion(data);
}

/** Tehničko povjerenstvo: UNDER_REVIEW → DRAFT. */
export async function rejectQuestionReview(questionId: string): Promise<ItemBankQuestion> {
  const { data } = await api.put<ItemBankQuestion>(
    `/api/exams/item-bank/${encodeURIComponent(questionId)}/reject-review`,
    {},
  );
  return normalizeQuestion(data);
}

/** Umirovljenje stavke (više nije u ispitu). */
export async function retireQuestion(questionId: string): Promise<ItemBankQuestion> {
  const { data } = await api.put<ItemBankQuestion>(
    `/api/exams/item-bank/${encodeURIComponent(questionId)}/retire`,
    {},
  );
  return normalizeQuestion(data);
}

/** Razvoj: stub AI pitanje (potrebno CONFORA_AI_QUESTION_STUB=1 na backendu). */
export async function createAiPlaceholderQuestion(courseId: string, topicHint?: string): Promise<ItemBankQuestion> {
  const { data } = await api.post<ItemBankQuestion>("/api/exams/item-bank/ai-generate-stub", {
    courseId,
    topicHint: topicHint ?? "",
  });
  return normalizeQuestion(data);
}
