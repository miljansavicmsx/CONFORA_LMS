/**
 * Cjelozaslonski ispitni režim (ISO 17024) — bez dashboard layouta.
 */

import { Download, Loader2, Sparkles, Timer } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router";

import { Button } from "@/components/ui/button";
import {
  type ExamQuestionPublic,
  type ExamSubmitResponse,
  fetchExamSessionQuestion,
  postExamProctoringEvent,
  postExamSessionAnswer,
  submitExam,
} from "@/lib/api-exam-engine";
import { examAnswerHmacHex } from "@/lib/exam-answer-hmac";
import { clearExamSession, loadExamSession } from "@/lib/exam-session-storage";
import { clearExamVerified, isExamVerified } from "@/lib/exam-verification-storage";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const EXAM_TITLE = "ISO/IEC 27001 Lead Auditor Ispit";

const devSkipAuthGuard =
  import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH_GUARD === "true";

export type ExamPlayerLocationState = {
  readonly questions: ExamQuestionPublic[];
  readonly startTime: string;
  readonly courseId: string;
  readonly verificationRequired?: boolean;
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

function isExamPlayerState(x: unknown): x is ExamPlayerLocationState {
  if (!x || typeof x !== "object") {
    return false;
  }
  const o = x as Record<string, unknown>;
  const bulk = Array.isArray(o.questions) && o.questions.length > 0;
  const sequential =
    o.sequentialDelivery === true &&
    typeof o.answerSignSecret === "string" &&
    typeof o.totalQuestions === "number" &&
    o.totalQuestions > 0;
  return (
    (bulk || sequential) && typeof o.startTime === "string" && typeof o.courseId === "string"
  );
}

function sumTimeLimits(questions: readonly ExamQuestionPublic[]): number {
  return questions.reduce((acc, q) => acc + Math.max(0, Number(q.timeLimitSeconds) || 0), 0);
}

function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function downloadExamReport(result: ExamSubmitResponse): void {
  const report = [
    "CONFORA Exam Result Report",
    `Attempt ID: ${result.attemptId}`,
    `Status: ${result.status}`,
    `Score: ${result.scorePercent.toFixed(1)}%`,
    `Correct: ${result.correctCount}/${result.totalQuestions}`,
    `Ended at: ${result.endedAt}`,
    "",
    "Weak areas:",
    ...(result.aiAnalysisDraft?.weakAreas?.length ? result.aiAnalysisDraft.weakAreas : result.weakAreaHints ?? []).map(
      (x) => `- ${x}`,
    ),
    "",
    "Recommendations:",
    ...(result.aiAnalysisDraft?.recommendations ?? []).map((x) => `- ${x}`),
    "",
    result.aiAnalysisDraft?.disclaimer ?? "AI analiza je edukativni nacrt i ne mijenja rezultat.",
  ].join("\n");
  const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `exam-result-${result.attemptId}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ExamPlayer(): JSX.Element | null {
  const { attemptId: attemptIdParam } = useParams<{ attemptId: string }>();
  const attemptId = attemptIdParam ? decodeURIComponent(attemptIdParam) : "";
  const navigate = useNavigate();
  const location = useLocation();

  const [authHydrated, setAuthHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  useEffect(() => {
    if (authHydrated) {
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true));
    if (useAuthStore.persist.hasHydrated()) {
      setAuthHydrated(true);
    }
    return unsub;
  }, [authHydrated]);

  useEffect(() => {
    if (!authHydrated || devSkipAuthGuard) {
      return;
    }
    if (!useAuthStore.getState().accessToken) {
      void navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [authHydrated, navigate, location.pathname]);

  const session = useMemo(() => {
    if (!attemptId) {
      return null;
    }
    const fromNav = location.state;
    if (isExamPlayerState(fromNav)) {
      return fromNav;
    }
    return loadExamSession(attemptId);
  }, [attemptId, location.state]);

  const verificationRequired = session?.verificationRequired !== false;
  const questions = session?.questions ?? [];
  const isSequential = Boolean(session?.sequentialDelivery && session?.answerSignSecret);
  const totalQuestions = isSequential
    ? Math.max(0, Number(session?.totalQuestions) || 0)
    : questions.length;

  const hasPayload = Boolean(session && totalQuestions > 0);
  const needsVerification = Boolean(
    attemptId && hasPayload && verificationRequired && !isExamVerified(attemptId),
  );

  const [result, setResult] = useState<ExamSubmitResponse | null>(null);

  useEffect(() => {
    if (result || !needsVerification || !session || !attemptId) {
      return;
    }
    void navigate(`/exam-verification/${encodeURIComponent(attemptId)}`, { replace: true, state: session });
  }, [needsVerification, session, attemptId, navigate, result]);

  const startTime = session?.startTime ?? "";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [seqOrder, setSeqOrder] = useState(1);
  const [seqQuestion, setSeqQuestion] = useState<ExamQuestionPublic | null>(null);
  const [seqLoading, setSeqLoading] = useState(false);
  const [seqErr, setSeqErr] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const autoSubmitSentRef = useRef(false);

  useEffect(() => {
    setSeqOrder(1);
    setSeqQuestion(null);
    setSeqErr(null);
  }, [attemptId, session?.sequentialDelivery, session?.answerSignSecret]);

  useEffect(() => {
    if (!isSequential || !attemptId || result) {
      return;
    }
    let cancelled = false;
    setSeqLoading(true);
    setSeqErr(null);
    void fetchExamSessionQuestion(attemptId, seqOrder)
      .then((r) => {
        if (!cancelled) {
          setSeqQuestion(r.question);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSeqErr("Učitavanje pitanja nije uspjelo.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSeqLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isSequential, attemptId, seqOrder, result]);

  useEffect(() => {
    if (!attemptId || result || needsVerification) {
      return;
    }
    const screenReaderMode = session?.accommodationFlags?.screenReaderCompat === true;
    if (screenReaderMode) {
      return;
    }
    const onBlur = (): void => {
      void postExamProctoringEvent(attemptId, {
        type: "focus_lost",
        severity: "HIGH",
        isAiGenerated: false,
      }).catch(() => undefined);
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [attemptId, result, needsVerification, session?.accommodationFlags?.screenReaderCompat]);

  const safeIndex = totalQuestions > 0 ? Math.min(currentIndex, totalQuestions - 1) : 0;
  const current = isSequential ? seqQuestion : totalQuestions > 0 ? questions[safeIndex] : null;

  const deadlineMs = useMemo(() => {
    if (totalQuestions === 0) {
      return null;
    }
    if (session?.examDeadlineIso) {
      const t = Date.parse(session.examDeadlineIso);
      if (!Number.isNaN(t)) {
        return t;
      }
    }
    if (!startTime) {
      return null;
    }
    const start = Date.parse(startTime);
    if (Number.isNaN(start)) {
      return null;
    }
    const totalSec = sumTimeLimits(questions.length > 0 ? questions : []);
    return start + totalSec * 1000;
  }, [session?.examDeadlineIso, startTime, totalQuestions, questions]);

  const doSubmit = useCallback(
    async (answers: Record<string, number>) => {
      if (!attemptId || submitting || result) {
        return;
      }
      setSubmitting(true);
      setSubmitError(null);
      try {
        const res = await submitExam(attemptId, answers);
        clearExamSession(attemptId);
        clearExamVerified(attemptId);
        setResult(res);
      } catch {
        setSubmitError("Predaja nije uspjela. Provjeri vezu i pokušaj ponovo.");
      } finally {
        setSubmitting(false);
      }
    },
    [attemptId, submitting, result],
  );

  useEffect(() => {
    if (deadlineMs == null || result != null) {
      return;
    }
    const tick = (): void => {
      const left = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));
      setRemainingSec(left);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [deadlineMs, result]);

  useEffect(() => {
    if (remainingSec !== 0 || submitting || result || !attemptId || autoSubmitSentRef.current) {
      return;
    }
    autoSubmitSentRef.current = true;
    void doSubmit(userAnswers);
  }, [remainingSec, submitting, result, attemptId, userAnswers, doSubmit]);

  const selectOption = useCallback((questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1));
  }, [totalQuestions]);

  const commitSequentialAndAdvance = useCallback(async () => {
    if (!isSequential || !session?.answerSignSecret || !current || !attemptId) {
      return;
    }
    const idx = userAnswers[current.questionId];
    if (idx === undefined) {
      setSubmitError("Odaberi odgovor.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const clientTs = Date.now();
      const payload = `${attemptId}:${String(seqOrder)}:${String(idx)}:${String(clientTs)}`;
      const mac = await examAnswerHmacHex(session.answerSignSecret, payload);
      await postExamSessionAnswer(attemptId, seqOrder, { optionIndex: idx, clientTs, mac });
      if (seqOrder >= totalQuestions) {
        await doSubmit({});
      } else {
        setSeqOrder((o) => o + 1);
      }
    } catch {
      setSubmitError("Slanje odgovora nije uspjelo.");
    } finally {
      setSubmitting(false);
    }
  }, [
    isSequential,
    session?.answerSignSecret,
    current,
    attemptId,
    userAnswers,
    seqOrder,
    totalQuestions,
    doSubmit,
  ]);

  const onFinishClick = useCallback(() => {
    if (isSequential) {
      void commitSequentialAndAdvance();
      return;
    }
    void doSubmit(userAnswers);
  }, [isSequential, commitSequentialAndAdvance, doSubmit, userAnswers]);

  if (!authHydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface-primary text-text-primary">
        <Loader2 className="h-10 w-10 animate-spin text-brand" aria-label="Učitavanje" />
      </div>
    );
  }

  if (!devSkipAuthGuard && !useAuthStore.getState().accessToken) {
    return null;
  }

  if (!attemptId) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-surface-primary px-6 text-center text-text-primary">
        <p className="text-text-secondary">Nedostaje identifikator pokušaja.</p>
        <Button asChild variant="outline" className="border-border/60">
          <Link to="/dashboard/exams">Nazad na ispite</Link>
        </Button>
      </div>
    );
  }

  if (result) {
    if (result.status === "PENDING_REVIEW") {
      return (
        <div
          className="flex min-h-svh flex-col items-center justify-center gap-6 bg-amber-950/50 px-6 text-center text-amber-50"
          data-testid="exam-pending-review"
        >
          <div className="max-w-lg rounded-2xl border border-amber-500/40 bg-amber-950/60 px-8 py-10">
            <h1 className="text-xl font-bold">Rezultat još nije objavljen</h1>
            <p className="mt-3 text-sm leading-relaxed text-amber-100/90">
              Zabilježen je ozbiljan proctoring signal (npr. gubitak fokusa). AI ne može automatski poništiti ispit —
              pregledava ovlašteni ispitivač (ISO §6.5).
            </p>
            <Button asChild className="mt-6 bg-amber-200 text-amber-950 hover:bg-amber-100">
              <Link to="/dashboard/exams">Nazad na ispite</Link>
            </Button>
          </div>
        </div>
      );
    }
    const passed = result.passed;
    const hints = result.weakAreaHints ?? [];
    const certId = result.examPassCertificateId?.trim();
    const retryUntil = result.retryAvailableUntil;
    const aiDraft = result.aiAnalysisDraft;
    const incorrectCount = Math.max(0, result.totalQuestions - result.correctCount);
    return (
      <div
        data-testid="exam-results"
        className={cn(
          "flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center",
          passed ? "bg-emerald-950/40 text-emerald-50" : "bg-red-950/40 text-red-50",
        )}
      >
        <div
          className={cn(
            "w-full max-w-3xl rounded-2xl border px-8 py-10 text-left shadow-2xl ring-1",
            passed
              ? "border-emerald-500/40 bg-emerald-950/60 ring-emerald-500/20"
              : "border-red-500/40 bg-red-950/60 ring-red-500/20",
          )}
        >
          <h1 className="text-center text-2xl font-bold tracking-tight">
            {passed ? "Čestitamo — položio/la si!" : "Nisi položio/la ispit"}
          </h1>
          <p className="mt-3 text-center text-4xl font-black tabular-nums">
            {Number.isFinite(result.scorePercent) ? result.scorePercent.toFixed(1) : "—"}%
          </p>
          <p className="mt-2 text-center text-sm opacity-90">
            Tačnih odgovora: {result.correctCount} od {result.totalQuestions} · Netačnih: {incorrectCount}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-black/20 p-3 text-center">
              <p className="text-xs uppercase tracking-wide opacity-70">Score</p>
              <p className="mt-1 text-xl font-bold">{result.scorePercent.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/20 p-3 text-center">
              <p className="text-xs uppercase tracking-wide opacity-70">Pass / fail</p>
              <p className="mt-1 text-xl font-bold">{passed ? "PASSED" : "FAILED"}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/20 p-3 text-center">
              <p className="text-xs uppercase tracking-wide opacity-70">AI pitanja</p>
              <p className="mt-1 text-xl font-bold">{result.aiGeneratedQuestionCount}</p>
            </div>
          </div>
          {passed && certId ? (
            <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-900/40 px-4 py-3 text-sm leading-relaxed text-emerald-100">
              <span className="font-semibold text-white">Potvrda o položenom ispitu</span> (nije certifikacija
              osobe) izdana je u sustavu. Pronađi je pod{" "}
              <Link className="font-medium underline underline-offset-2 hover:text-white" to="/dashboard/my-certificates">
                Moji dokumenti
              </Link>
              .
              <span className="mt-2 block font-mono text-xs opacity-90">ID: {certId}</span>
            </p>
          ) : null}
          {!passed && hints.length > 0 ? (
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-red-100/95">
              <p className="font-semibold text-white">Savjeti za učenje (bez otkrivanja tačnih odgovora):</p>
              <ul className="list-inside list-disc space-y-1">
                {hints.map((h) => (
                  <li key={h.slice(0, 40)}>{h}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {aiDraft ? (
            <div className="mt-5 rounded-xl border border-violet-400/30 bg-violet-950/35 p-4 text-sm text-violet-50">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" aria-hidden />
                <div>
                  <p className="font-semibold text-white">{aiDraft.title}</p>
                  <p className="mt-1 leading-relaxed text-violet-100/90">{aiDraft.summary}</p>
                  {aiDraft.weakAreas?.length ? (
                    <>
                      <p className="mt-3 font-semibold text-white">Šta ponoviti</p>
                      <ul className="mt-1 list-inside list-disc space-y-1">
                        {aiDraft.weakAreas.map((area) => (
                          <li key={area}>{area}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  {aiDraft.recommendations?.length ? (
                    <>
                      <p className="mt-3 font-semibold text-white">Preporuka</p>
                      <ul className="mt-1 list-inside list-disc space-y-1">
                        {aiDraft.recommendations.map((rec) => (
                          <li key={rec}>{rec}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  <p className="mt-3 text-xs text-violet-100/75">
                    {aiDraft.disclaimer ?? "AI analiza ne mijenja službeni rezultat."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {!passed && retryUntil ? (
            <p className="mt-4 rounded-lg border border-red-300/25 bg-red-900/30 px-4 py-3 text-center text-sm text-red-100">
              Preostao vam je jedan pokušaj do{" "}
              {(() => {
                try {
                  return new Date(retryUntil).toLocaleString("bs-BA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });
                } catch {
                  return retryUntil;
                }
              })()}
            </p>
          ) : null}
          {passed && result.certificationApplicationAvailable && result.certificationApplicationHref ? (
            <Button asChild className="mt-5 w-full bg-brand text-white hover:bg-brand/90">
              <Link to={result.certificationApplicationHref}>Pokreni prijavu za certifikaciju</Link>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full border-white/25 bg-black/20 text-white hover:bg-black/35"
            onClick={() => downloadExamReport(result)}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden />
            Preuzmi izvještaj
          </Button>
        </div>
        <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90">
          <Link to="/dashboard/exams">Povratak na pregled ispita</Link>
        </Button>
      </div>
    );
  }

  if (!session || totalQuestions === 0) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-surface-primary px-6 text-center text-text-primary">
        <p className="max-w-md text-text-secondary">
          Nema podataka za ovaj ispit. Vjerovatno je sesija istekla ili si otvorio link u novom tabu bez
          pokretanja ispita.
        </p>
        <Button asChild className="bg-brand text-white hover:bg-brand/90">
          <Link to="/dashboard/exams">Na listu ispita</Link>
        </Button>
      </div>
    );
  }

  if (isSequential && seqLoading && !current) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-surface-primary text-text-primary">
        <Loader2 className="h-12 w-12 animate-spin text-brand" aria-label="Učitavanje pitanja" />
        <p className="text-sm text-text-secondary">Učitavanje sljedećeg pitanja…</p>
      </div>
    );
  }

  if (isSequential && seqErr) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-surface-primary px-6 text-center text-text-primary">
        <p className="max-w-md text-red-300">{seqErr}</p>
        <Button asChild variant="outline" className="border-border/60">
          <Link to="/dashboard/exams">Na listu ispita</Link>
        </Button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-surface-primary px-6 text-center text-text-primary">
        <p className="max-w-md text-text-secondary">
          Nema podataka za ovaj ispit. Vjerovatno je sesija istekla ili si otvorio link u novom tabu bez
          pokretanja ispita.
        </p>
        <Button asChild className="bg-brand text-white hover:bg-brand/90">
          <Link to="/dashboard/exams">Na listu ispita</Link>
        </Button>
      </div>
    );
  }

  if (needsVerification) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-surface-primary text-text-primary">
        <Loader2 className="h-10 w-10 animate-spin text-brand" aria-label="Preusmjeravanje" />
        <p className="text-sm text-text-secondary">Preusmjeravanje na provjeru identiteta…</p>
      </div>
    );
  }

  const isLast = isSequential ? seqOrder >= totalQuestions : safeIndex >= totalQuestions - 1;
  const displayQ = isSequential ? seqOrder : safeIndex + 1;
  const timerUrgent = remainingSec != null && remainingSec <= 60;
  const timerLabel = remainingSec != null ? formatCountdown(remainingSec) : "—:—";

  return (
    <div
      data-testid="exam-player"
      className={cn(
        "relative flex min-h-svh flex-col bg-surface-primary text-text-primary",
        session.accommodationFlags?.largePrint && "exam-accommodation-large-print",
      )}
      style={
        session.accommodationFlags?.largePrint
          ? { fontSize: "22px", lineHeight: 1.5 }
          : undefined
      }
    >
      {submitting ? (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-surface-primary/95 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-12 w-12 animate-spin text-brand" />
          <p className="text-lg font-medium text-text-primary">Ocenjivanje u toku…</p>
        </div>
      ) : null}

      <header className="shrink-0 border-b border-border/50 bg-surface-secondary/50 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 id="exam-player-heading" className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
              {EXAM_TITLE}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Pitanje {displayQ} od {totalQuestions}
            </p>
          </div>
          <div
            data-testid="exam-timer"
            aria-live="polite"
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-xl font-bold tabular-nums ring-1",
              timerUrgent
                ? "border-red-500/50 bg-red-500/10 text-red-200 ring-red-500/20"
                : "border-border/60 bg-surface-primary/80 text-text-primary ring-white/5",
            )}
          >
            <Timer className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
            <span aria-label="Preostalo vrijeme">{timerLabel}</span>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="exam-player-heading"
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-8"
      >
        {current.scenarioText ? (
          <blockquote className="mb-6 rounded-xl border border-brand/25 bg-brand/5 px-5 py-4 text-sm leading-relaxed text-text-secondary ring-1 ring-brand/10">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand">
              Scenario
            </span>
            {current.scenarioText}
          </blockquote>
        ) : null}

        <div
          data-testid="exam-question"
          className="rounded-2xl border border-border/50 bg-surface-secondary/40 p-6 ring-1 ring-white/[0.04]"
        >
          <h2 className="text-base font-medium leading-relaxed text-text-primary sm:text-lg">
            {current.questionText || "Pitanje nema teksta."}
          </h2>

          <fieldset className="mt-6 space-y-3">
            <legend className="sr-only">Odaberi odgovor</legend>
            {(current.options?.length ? current.options : []).map((opt, idx) => {
              const checked = userAnswers[current.questionId] === idx;
              return (
                <label
                  key={`${current.questionId}-${idx}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                    checked
                      ? "border-brand/50 bg-brand/10 ring-1 ring-brand/20"
                      : "border-border/50 bg-surface-primary/40 hover:border-border/80",
                  )}
                >
                  <input
                    type="radio"
                    className="mt-1 h-4 w-4 shrink-0 accent-brand"
                    name={`q-${current.questionId}`}
                    checked={checked}
                    onChange={() => {
                      selectOption(current.questionId, idx);
                    }}
                  />
                  <span className="text-sm leading-relaxed text-text-primary">{opt || `Opcija ${idx + 1}`}</span>
                </label>
              );
            })}
            {(!current.options || current.options.length === 0) && (
              <p className="text-sm text-text-muted">Nema ponuđenih odgovora.</p>
            )}
          </fieldset>
        </div>
      </section>

      <footer className="shrink-0 border-t border-border/50 bg-surface-secondary/50 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          {submitError ? (
            <p className="w-full text-sm text-red-300 sm:order-first">{submitError}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-border/60"
              disabled={safeIndex <= 0 || submitting || isSequential}
              onClick={goPrev}
            >
              Prethodno
            </Button>
            {!isLast ? (
              <Button
                type="button"
                data-testid="exam-next"
                className="bg-brand text-white hover:bg-brand/90"
                disabled={submitting}
                onClick={() => {
                  if (isSequential) {
                    void commitSequentialAndAdvance();
                  } else {
                    goNext();
                  }
                }}
              >
                Sljedeće
              </Button>
            ) : (
              <Button
                type="button"
                data-testid="exam-submit"
                className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                disabled={submitting}
                onClick={onFinishClick}
              >
                Završi ispit
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
