import { getMockQuizPayload } from "@/data/mock-quizzes";
import { api } from "@/lib/api";
import type { QuizPayload } from "@/types/quiz";

/**
 * Učitava definiciju kviza s API-ja; pri grešci koristi mock (CONFORA dev).
 */
export async function fetchQuizPayload(
  courseId: string,
  moduleId: string,
  quizId: string,
): Promise<QuizPayload> {
  try {
    const { data } = await api.get<QuizPayload>(
      `/api/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/quizzes/${encodeURIComponent(quizId)}`,
    );
    if (data?.questions?.length) {
      return data;
    }
  } catch {
    /* API možda još ne postoji */
  }
  return getMockQuizPayload(quizId);
}
