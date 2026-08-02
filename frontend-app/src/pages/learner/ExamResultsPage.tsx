/**
 * Graded exam feedback — ISO §9.1.4 WCAG 1.4.1 (non-color cues per item).
 */
import { useQuery } from "@tanstack/react-query";
import { type JSX } from "react";
import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { fetchExamResults } from "@/lib/api-exam-engine";

export default function ExamResultsPage(): JSX.Element {
  const { attemptId: attemptIdParam } = useParams<{ attemptId: string }>();
  const attemptId = attemptIdParam ? decodeURIComponent(attemptIdParam) : "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["exam-results", attemptId],
    queryFn: () => fetchExamResults(attemptId),
    enabled: Boolean(attemptId),
  });

  if (!attemptId) {
    return (
      <div className="flex min-h-svh items-center justify-center px-6 text-center">
        <p>Nedostaje identifikator pokušaja.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center px-6 text-center">
        <p>Učitavanje rezultata…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
        <p>Rezultati nisu dostupni.</p>
        <Button asChild variant="outline">
          <Link to="/dashboard/exams">Nazad na ispite</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10" data-testid="exam-results">
      <h1 className="text-2xl font-bold">Rezultat ispita</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Score: {data.scorePercent.toFixed(1)}% · {data.passed ? "Položeno" : "Nije položeno"}
      </p>
      <ul className="mt-8 space-y-3">
        {data.feedback.map((item, index) => {
          const label = item.correct ? "Tačno" : "Netačno";
          return (
            <li
              key={item.questionId}
              data-testid={`exam-feedback-${index}`}
              data-result={item.result}
              aria-label={`Pitanje ${String(item.order)}: ${label}`}
              className={
                item.correct
                  ? "rounded-xl border border-emerald-500/40 bg-emerald-950/20 px-4 py-3 text-sm"
                  : "rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-3 text-sm"
              }
            >
              <span className="font-medium">Pitanje {item.order}</span>
              <span className="ml-2">{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
