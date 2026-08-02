/**
 * Privremeno čuvanje payloada ispita (pitanja bez tačnih odgovora) za osvježavanje stranice.
 */

import type { ExamQuestionPublic, ExamStartResponse } from "@/lib/api-exam-engine";

export type StoredExamSession = {
  readonly questions: ExamQuestionPublic[];
  readonly startTime: string;
  readonly courseId: string;
  /** Ako je false, preskače se korak identiteta prije igrača. */
  readonly verificationRequired?: boolean;
  readonly sequentialDelivery?: boolean;
  readonly answerSignSecret?: string;
  readonly totalQuestions?: number;
  readonly examDeadlineIso?: string;
  readonly accommodationFlags?: ExamStartResponse["accommodationFlags"];
};

const key = (attemptId: string): string => `confora_exam_session_${attemptId}`;

function isStoredExamSession(p: unknown): p is StoredExamSession {
  if (!p || typeof p !== "object") {
    return false;
  }
  const o = p as Record<string, unknown>;
  if (typeof o.startTime !== "string" || typeof o.courseId !== "string") {
    return false;
  }
  const seq = o.sequentialDelivery === true && typeof o.answerSignSecret === "string" && typeof o.totalQuestions === "number";
  const bulk = Array.isArray(o.questions) && o.questions.length > 0;
  return seq || bulk;
}

export function saveExamSession(attemptId: string, payload: StoredExamSession): void {
  try {
    sessionStorage.setItem(key(attemptId), JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function loadExamSession(attemptId: string): StoredExamSession | null {
  try {
    const raw = sessionStorage.getItem(key(attemptId));
    if (!raw) {
      return null;
    }
    const p = JSON.parse(raw) as unknown;
    if (!isStoredExamSession(p)) {
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function clearExamSession(attemptId: string): void {
  try {
    sessionStorage.removeItem(key(attemptId));
  } catch {
    /* ignore */
  }
}
