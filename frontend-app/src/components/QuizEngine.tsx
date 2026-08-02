import { Check, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";

import { FillBlankQuestion } from "@/components/questions/FillBlankQuestion";
import { MCAQuestion } from "@/components/questions/MCAQuestion";
import { MCQQuestion } from "@/components/questions/MCQQuestion";
import { TrueFalseQuestion } from "@/components/questions/TrueFalseQuestion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchQuizPayload } from "@/lib/fetch-quiz";
import { correctAnswerDisplay, isAnswerCorrect } from "@/lib/quiz-grade";
import { cn } from "@/lib/utils";
import type {
  QuizAnswerRecord,
  QuizEngineProps,
  QuizPayload,
  QuizPhase,
  QuizQuestion,
  QuizResult,
} from "@/types/quiz";

function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j]!;
    a[j] = t!;
  }
  return a;
}

function hasProvidedAnswer(q: QuizQuestion, raw: unknown): boolean {
  switch (q.type) {
    case "mcq":
      return typeof raw === "string" && raw !== "";
    case "mca":
      return Array.isArray(raw) && raw.length > 0;
    case "true_false":
      return typeof raw === "boolean";
    case "fill_blank":
      return typeof raw === "string" && raw.trim() !== "";
    default:
      return false;
  }
}

function formatCountdown(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatUserAnswer(u: unknown): string {
  if (u === null || u === undefined) {
    return "—";
  }
  if (Array.isArray(u)) {
    return u.join(", ");
  }
  if (typeof u === "boolean") {
    return u ? "Tačno" : "Netačno";
  }
  return String(u);
}

function buildResult(
  props: Pick<QuizEngineProps, "quizId" | "courseId" | "moduleId" | "config">,
  questions: readonly QuizQuestion[],
  answers: Readonly<Record<string, unknown>>,
  startedAt: number,
): QuizResult {
  let scoreCorrect = 0;
  const answerRecords: QuizAnswerRecord[] = [];
  for (const q of questions) {
    const ua = answers[q.id];
    const correct = isAnswerCorrect(q, ua);
    if (correct) {
      scoreCorrect += 1;
    }
    answerRecords.push({
      questionId: q.id,
      correct,
      userAnswer: ua ?? null,
      correctAnswer: correctAnswerDisplay(q),
    });
  }
  const total = questions.length;
  const scorePct = total > 0 ? Math.round((scoreCorrect / total) * 1000) / 10 : 0;
  const passed = scorePct >= props.config.passingScorePct;
  return {
    quizId: props.quizId,
    courseId: props.courseId,
    moduleId: props.moduleId,
    scoreCorrect,
    scoreTotal: total,
    scorePct,
    passed,
    durationSeconds: Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
    answers: answerRecords,
  };
}

function useAnimatedInt(target: number, run: boolean): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) {
      setV(0);
      return;
    }
    setV(0);
    const duration = 1100;
    const t0 = performance.now();
    let frame: number;
    const ease = (p: number) => 1 - (1 - p) * (1 - p);
    const tick = (now: number) => {
      const p = ease(Math.min(1, (now - t0) / duration));
      setV(Math.round(target * p));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run]);
  return v;
}

export function QuizEngine({
  quizId,
  moduleId,
  courseId,
  config,
  onComplete,
  onContinueNextModule,
}: QuizEngineProps): JSX.Element {
  const [phase, setPhase] = useState<QuizPhase>("loading");
  const [payload, setPayload] = useState<QuizPayload | null>(null);
  const [orderedQuestions, setOrderedQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [finalResult, setFinalResult] = useState<QuizResult | null>(null);

  const completedSentRef = useRef(false);
  const hasFinalizedRef = useRef(false);
  const questionsRef = useRef<QuizQuestion[]>([]);
  const answersRef = useRef<Record<string, unknown>>({});
  const startedAtRef = useRef<number | null>(null);

  questionsRef.current = orderedQuestions;
  answersRef.current = answers;
  startedAtRef.current = startedAt;

  const propsRef = useRef({ quizId, moduleId, courseId, config });
  propsRef.current = { quizId, moduleId, courseId, config };

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    void (async () => {
      try {
        const data = await fetchQuizPayload(courseId, moduleId, quizId);
        if (!cancelled) {
          setPayload(data);
          setPhase("intro");
        }
      } catch {
        if (!cancelled) {
          setPayload(null);
          setPhase("intro");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId, moduleId, courseId]);

  const finalizeQuiz = useCallback(() => {
    if (hasFinalizedRef.current) {
      return;
    }
    hasFinalizedRef.current = true;
    const qs = questionsRef.current;
    const ans = answersRef.current;
    const start = startedAtRef.current ?? Date.now();
    const result = buildResult(propsRef.current, qs, ans, start);
    setFinalResult(result);
    setPhase("completed");
    if (!completedSentRef.current) {
      completedSentRef.current = true;
      onComplete(result);
    }
  }, [onComplete]);

  useEffect(() => {
    if (phase !== "in_progress" || config.timeLimit === undefined) {
      return;
    }
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null) {
          return s;
        }
        return Math.max(0, s - 1);
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, config.timeLimit]);

  useEffect(() => {
    if (phase !== "in_progress" || config.timeLimit === undefined) {
      return;
    }
    if (secondsLeft === null || secondsLeft !== 0) {
      return;
    }
    finalizeQuiz();
  }, [phase, secondsLeft, config.timeLimit, finalizeQuiz]);

  const startQuiz = (): void => {
    if (!payload) {
      return;
    }
    completedSentRef.current = false;
    hasFinalizedRef.current = false;
    const qs = config.shuffleQuestions ? shuffle(payload.questions) : [...payload.questions];
    setOrderedQuestions(qs);
    setCurrentIndex(0);
    setAnswers({});
    setFinalResult(null);
    const now = Date.now();
    setStartedAt(now);
    setPhase("in_progress");
    if (config.timeLimit !== undefined && config.timeLimit > 0) {
      setSecondsLeft(config.timeLimit);
    } else {
      setSecondsLeft(null);
    }
  };

  const currentQuestion = orderedQuestions[currentIndex] ?? null;

  const setAnswer = useCallback((qid: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }, []);

  const canProceedProgress = currentQuestion
    ? hasProvidedAnswer(currentQuestion, answers[currentQuestion.id])
    : false;

  const goNextFromProgress = (): void => {
    if (!currentQuestion || !canProceedProgress) {
      return;
    }
    if (config.showResultsAfter === "immediately") {
      setPhase("reviewing");
      return;
    }
    if (currentIndex >= orderedQuestions.length - 1) {
      finalizeQuiz();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const leaveReview = (): void => {
    if (currentIndex >= orderedQuestions.length - 1) {
      finalizeQuiz();
    } else {
      setCurrentIndex((i) => i + 1);
      setPhase("in_progress");
    }
  };

  const retryQuiz = (): void => {
    setPhase("intro");
    setOrderedQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setFinalResult(null);
    setStartedAt(null);
    setSecondsLeft(null);
    completedSentRef.current = false;
    hasFinalizedRef.current = false;
  };

  const indicatorStates = useMemo(() => {
    return orderedQuestions.map((q, i) => {
      const answered = hasProvidedAnswer(q, answers[q.id]);
      if (i < currentIndex) {
        return "done" as const;
      }
      if (i === currentIndex && answered && phase === "in_progress") {
        return "current-done" as const;
      }
      if (i === currentIndex) {
        return "current" as const;
      }
      return "upcoming" as const;
    });
  }, [orderedQuestions, answers, currentIndex, phase]);

  const animatedPct = useAnimatedInt(
    finalResult?.scorePct ?? 0,
    phase === "completed" && finalResult !== null,
  );

  if (phase === "loading") {
    return (
      <Card className="border-[hsl(var(--border))]">
        <CardContent className="flex min-h-[200px] items-center justify-center p-8">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Učitavanje kviza…</p>
        </CardContent>
      </Card>
    );
  }

  if (!payload) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6 text-sm text-destructive">
          Kviz nije dostupan. Provjerite courseId / moduleId / quizId ili API.
        </CardContent>
      </Card>
    );
  }

  if (phase === "intro") {
    const limit = config.timeLimit;
    return (
      <Card className="border-[hsl(var(--border))]">
        <CardHeader>
          <CardTitle className="text-xl">{payload.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
            <li>
              Broj pitanja: <span className="font-medium text-[hsl(var(--foreground))]">{payload.questions.length}</span>
            </li>
            <li>
              Vremenski limit:{" "}
              <span className="font-medium text-[hsl(var(--foreground))]">
                {limit !== undefined && limit > 0 ? `${Math.ceil(limit / 60)} min (${limit} s)` : "Bez limita"}
              </span>
            </li>
            <li>
              Prolaznost:{" "}
              <span className="font-medium text-[hsl(var(--foreground))]">{config.passingScorePct}%</span>
            </li>
            <li>
              Prikaz rezultata:{" "}
              <span className="font-medium text-[hsl(var(--foreground))]">
                {config.showResultsAfter === "immediately"
                  ? "Nakon svakog pitanja"
                  : config.showResultsAfter === "end"
                    ? "Na kraju"
                    : "Samo sažetak"}
              </span>
            </li>
          </ul>
          <Button type="button" className="bg-[#1F4E79] hover:bg-[#1F4E79]/90" onClick={startQuiz}>
            Počni kviz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "in_progress" && currentQuestion) {
    const n = orderedQuestions.length;
    const idx = currentIndex + 1;
    const lowTime = secondsLeft !== null && secondsLeft < 120;

    return (
      <Card className="border-[hsl(var(--border))]">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">{payload.title}</CardTitle>
            {secondsLeft !== null ? (
              <div
                className={cn(
                  "rounded-md border px-3 py-1 font-mono text-sm tabular-nums",
                  lowTime
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50",
                )}
                aria-live="polite"
              >
                {formatCountdown(secondsLeft)}
              </div>
            ) : null}
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
              <span>
                Pitanje {idx} od {n}
              </span>
              <span>{Math.round((idx / n) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
              <div
                className="h-full rounded-full bg-[#1F4E79] transition-[width] duration-300"
                style={{ width: `${(idx / n) * 100}%` }}
                role="progressbar"
                aria-valuenow={idx}
                aria-valuemin={1}
                aria-valuemax={n}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5" aria-label="Napredak po pitanjima">
            {indicatorStates.map((st, i) => (
              <span
                key={orderedQuestions[i]!.id}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                  st === "done" || st === "current-done"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : st === "current"
                      ? "border-[#1F4E79] bg-[#1F4E79]/10 text-[#1F4E79]"
                      : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]",
                )}
                title={`Pitanje ${i + 1}`}
              >
                {st === "done" || st === "current-done" ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
          {currentQuestion.type === "mcq" ? (
            <MCQQuestion
              name={`mcq-${currentQuestion.id}`}
              prompt={currentQuestion.prompt}
              options={currentQuestion.options}
              value={typeof answers[currentQuestion.id] === "string" ? (answers[currentQuestion.id] as string) : null}
              onChange={(id) => setAnswer(currentQuestion.id, id)}
            />
          ) : null}
          {currentQuestion.type === "mca" ? (
            <MCAQuestion
              prompt={currentQuestion.prompt}
              options={currentQuestion.options}
              value={Array.isArray(answers[currentQuestion.id]) ? (answers[currentQuestion.id] as string[]) : []}
              onChange={(ids) => setAnswer(currentQuestion.id, ids)}
            />
          ) : null}
          {currentQuestion.type === "true_false" ? (
            <TrueFalseQuestion
              prompt={currentQuestion.prompt}
              value={typeof answers[currentQuestion.id] === "boolean" ? (answers[currentQuestion.id] as boolean) : null}
              onChange={(v) => setAnswer(currentQuestion.id, v)}
            />
          ) : null}
          {currentQuestion.type === "fill_blank" ? (
            <FillBlankQuestion
              prompt={currentQuestion.prompt}
              acceptableAnswers={currentQuestion.acceptableAnswers}
              {...(currentQuestion.caseSensitive !== undefined ? { caseSensitive: currentQuestion.caseSensitive } : {})}
              value={typeof answers[currentQuestion.id] === "string" ? (answers[currentQuestion.id] as string) : ""}
              onChange={(t) => setAnswer(currentQuestion.id, t)}
            />
          ) : null}

          <Button
            type="button"
            className="bg-[#1F4E79] hover:bg-[#1F4E79]/90"
            disabled={!canProceedProgress}
            onClick={goNextFromProgress}
          >
            Sljedeće pitanje
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "reviewing" && currentQuestion) {
    const ok = isAnswerCorrect(currentQuestion, answers[currentQuestion.id]);
    return (
      <Card className="border-[hsl(var(--border))]">
        <CardHeader>
          <CardTitle className="text-lg">Pregled odgovora</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={cn(
              "rounded-lg border px-4 py-3 text-sm font-medium",
              ok ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-red-600 bg-red-50 text-red-900",
            )}
            role="status"
          >
            {ok ? "Tačno" : "Netačno"}
          </div>
          <p className="text-sm text-[hsl(var(--foreground))]">{currentQuestion.prompt}</p>
          <div className="rounded-md bg-[hsl(var(--muted))]/50 p-3 text-sm">
            <p className="font-medium text-[hsl(var(--foreground))]">Objašnjenje</p>
            <p className="mt-1 text-[hsl(var(--muted-foreground))]">{currentQuestion.explanation}</p>
          </div>
          <Button type="button" variant="secondary" onClick={leaveReview}>
            {currentIndex >= orderedQuestions.length - 1 ? "Završi kviz" : "Nastavi na sljedeće pitanje"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "completed" && finalResult) {
    const showBreakdown = config.showResultsAfter !== "never";
    return (
      <Card className="border-[hsl(var(--border))]">
        <CardHeader className="space-y-4">
          <div
            className={cn(
              "rounded-lg border-2 px-4 py-3 text-center text-lg font-bold",
              finalResult.passed
                ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                : "border-red-600 bg-red-50 text-red-900",
            )}
          >
            {finalResult.passed ? "POLOŽIO" : "NIJE POLOŽIO"}
          </div>
          <CardTitle className="text-center text-2xl tabular-nums text-[#1F4E79]">
            {animatedPct}%
          </CardTitle>
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Rezultat: {finalResult.scoreCorrect} od {finalResult.scoreTotal} pitanja ({finalResult.scorePct}%)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {showBreakdown ? (
            <ul className="space-y-4">
              {finalResult.answers.map((row) => (
                <li
                  key={row.questionId}
                  className="rounded-lg border border-[hsl(var(--border))] p-3 text-sm"
                >
                  <div className="flex items-start gap-2">
                    {row.correct ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[hsl(var(--foreground))]">
                        {row.correct ? "Tačno" : "Netačno"} · {row.questionId}
                      </p>
                      <p className="mt-1 text-[hsl(var(--muted-foreground))]">
                        Vaš odgovor:{" "}
                        <span className="text-[hsl(var(--foreground))]">{formatUserAnswer(row.userAnswer)}</span>
                      </p>
                      {!row.correct ? (
                        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
                          Tačan odgovor:{" "}
                          <span className="font-medium text-[hsl(var(--foreground))]">{String(row.correctAnswer)}</span>
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                        {orderedQuestions.find((q) => q.id === row.questionId)?.explanation ?? ""}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={retryQuiz}>
              Pokušaj ponovo
            </Button>
            {onContinueNextModule ? (
              <Button
                type="button"
                className="bg-[#1F4E79] hover:bg-[#1F4E79]/90"
                onClick={() => onContinueNextModule()}
              >
                Nastavi na sljedeći modul
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 text-sm text-[hsl(var(--muted-foreground))]">Nepoznato stanje kviza.</CardContent>
    </Card>
  );
}
