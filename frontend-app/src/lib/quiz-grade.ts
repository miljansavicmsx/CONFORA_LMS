import type { QuizQuestion } from "@/types/quiz";

function norm(s: string, caseSensitive: boolean): string {
  const t = s.trim();
  return caseSensitive ? t : t.toLowerCase();
}

function setsEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

/** Provjera je li korisnikov odgovor potpuno tačan za dato pitanje. */
export function isAnswerCorrect(question: QuizQuestion, userRaw: unknown): boolean {
  switch (question.type) {
    case "mcq": {
      const v = typeof userRaw === "string" ? userRaw : null;
      return v !== null && v !== "" && v === question.correctOptionId;
    }
    case "mca": {
      const arr = Array.isArray(userRaw) ? userRaw.filter((x): x is string => typeof x === "string") : [];
      return setsEqual(arr, question.correctOptionIds);
    }
    case "true_false": {
      return typeof userRaw === "boolean" && userRaw === question.correct;
    }
    case "fill_blank": {
      const text = typeof userRaw === "string" ? userRaw : "";
      const cs = question.caseSensitive === true;
      const u = norm(text, cs);
      if (!u) {
        return false;
      }
      return question.acceptableAnswers.some((a) => norm(a, cs) === u);
    }
    default:
      return false;
  }
}

export function correctAnswerDisplay(question: QuizQuestion): unknown {
  switch (question.type) {
    case "mcq":
      return question.options.find((o) => o.id === question.correctOptionId)?.label ?? question.correctOptionId;
    case "mca":
      return question.correctOptionIds
        .map((id) => question.options.find((o) => o.id === id)?.label ?? id)
        .join(", ");
    case "true_false":
      return question.correct ? "Tačno" : "Netačno";
    case "fill_blank":
      return question.acceptableAnswers[0] ?? "";
    default:
      return null;
  }
}
