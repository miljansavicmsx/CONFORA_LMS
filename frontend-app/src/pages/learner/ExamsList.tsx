/**
 * Lista pokušaja ispita i pokretanje novog (ISO 17024).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpenCheck, Loader2, Play } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  acceptExamRules,
  fetchExamEligibility,
  type ExamStartResponse,
  fetchMyAttempts,
  startExam,
} from "@/lib/api-exam-engine";
import { saveExamSession } from "@/lib/exam-session-storage";
import { cn } from "@/lib/utils";
import type { ExamPlayerLocationState } from "@/pages/learner/ExamPlayer";

const ATTEMPTS_KEY = ["examEngine", "myAttempts"] as const;

const MVP_NUM = 5;
const MVP_BALANCE = { EASY: 0.4, MEDIUM: 0.4, HARD: 0.2 } as const;

const DEFAULT_PILOT_COURSE =
  (import.meta.env.VITE_PILOT_COURSE_ID as string | undefined)?.trim() || "pilot-demo-cert-course";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("bs-BA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function statusBadge(status: string): { label: string; className: string } {
  const s = status.toUpperCase();
  if (s === "PASSED") {
    return {
      label: "PROLAZ",
      className: "border-emerald-500/50 bg-emerald-500/15 text-emerald-200",
    };
  }
  if (s === "FAILED") {
    return {
      label: "NEPROLAZ",
      className: "border-red-500/50 bg-red-500/15 text-red-200",
    };
  }
  if (s === "PENDING_REVIEW") {
    return {
      label: "Na pregledu",
      className: "border-amber-500/50 bg-amber-500/15 text-amber-100",
    };
  }
  if (s === "STARTED") {
    return {
      label: "U toku",
      className: "border-amber-500/50 bg-amber-500/15 text-amber-100",
    };
  }
  return { label: status, className: "border-border/60 bg-surface-primary/80 text-text-secondary" };
}

function verificationBadge(
  status: string,
  verificationStatus: string | null | undefined,
): { label: string; className: string } | null {
  const s = status.toUpperCase();
  if (s !== "STARTED") {
    return null;
  }
  const v = (verificationStatus ?? "PENDING").toUpperCase();
  if (v === "VERIFIED") {
    return { label: "ID potvrđen", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" };
  }
  if (v === "REJECTED") {
    return { label: "Odbijeno", className: "border-red-500/40 bg-red-500/10 text-red-200" };
  }
  return { label: "Čeka verifikaciju", className: "border-amber-500/40 bg-amber-500/10 text-amber-100" };
}

export default function ExamsList(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examCourseId = searchParams.get("courseId")?.trim() || DEFAULT_PILOT_COURSE;
  const eligibilityKey = useMemo(
    () => ["examEngine", "eligibility", examCourseId] as const,
    [examCourseId],
  );
  const queryClient = useQueryClient();
  const [startOpen, setStartOpen] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [rulesCheckbox, setRulesCheckbox] = useState(false);

  const {
    data: attempts = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ATTEMPTS_KEY,
    queryFn: fetchMyAttempts,
  });

  const { data: eligibility } = useQuery({
    queryKey: eligibilityKey,
    queryFn: () => fetchExamEligibility(examCourseId),
    enabled: startOpen,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const el = await fetchExamEligibility(examCourseId);
      if (!el.eligible) {
        throw new Error(el.reason ?? "Trenutno niste osposobljeni za ispit.");
      }
      if (!el.rulesAccepted) {
        await acceptExamRules(examCourseId);
        void queryClient.invalidateQueries({ queryKey: eligibilityKey });
      }
      return startExam(
        examCourseId,
        MVP_NUM,
        {
          EASY: MVP_BALANCE.EASY,
          MEDIUM: MVP_BALANCE.MEDIUM,
          HARD: MVP_BALANCE.HARD,
        },
        { rulesAcknowledged: true },
      );
    },
    onSuccess: (res: ExamStartResponse) => {
      setStartError(null);
      setRulesCheckbox(false);
      const verificationRequired = res.verificationRequired !== false;
      const seqExtras =
        res.sequentialDelivery === true && res.answerSignSecret && res.totalQuestions != null
          ? {
              sequentialDelivery: true as const,
              answerSignSecret: res.answerSignSecret,
              totalQuestions: res.totalQuestions,
              ...(res.examDeadlineIso ? { examDeadlineIso: res.examDeadlineIso } : {}),
              ...(res.accommodationFlags ? { accommodationFlags: res.accommodationFlags } : {}),
            }
          : {};
      saveExamSession(res.attemptId, {
        questions: res.questions ?? [],
        startTime: res.startTime,
        courseId: res.courseId,
        verificationRequired: res.verificationRequired !== false,
        ...seqExtras,
      });
      setStartOpen(false);
      void queryClient.invalidateQueries({ queryKey: ATTEMPTS_KEY });
      void queryClient.invalidateQueries({ queryKey: eligibilityKey });
      const state = {
        questions: res.questions ?? [],
        startTime: res.startTime,
        courseId: res.courseId,
        verificationRequired,
        ...seqExtras,
      } satisfies ExamPlayerLocationState;
      if (verificationRequired) {
        void navigate(`/exam-verification/${encodeURIComponent(res.attemptId)}`, {
          state,
        });
      } else {
        void navigate(`/exam-player/${encodeURIComponent(res.attemptId)}`, {
          state,
        });
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Pokretanje ispita nije uspjelo.";
      setStartError(msg);
    },
  });

  const openStart = useCallback(() => {
    setStartError(null);
    setRulesCheckbox(false);
    setStartOpen(true);
  }, []);

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <BookOpenCheck className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Ispiti</h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Pregled pokušaja i pokretanje završnog ispita za kurs{" "}
                <span className="font-mono text-text-primary">{examCourseId}</span> (parametar{" "}
                <span className="font-mono">?courseId=</span> u URL-u).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border/60 bg-surface-secondary/80"
              onClick={() => {
                void refetch();
              }}
              disabled={isFetching}
            >
              {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Osvježi
            </Button>
            <Button type="button" className="bg-brand text-white hover:bg-brand/90" onClick={openStart}>
              <Play className="mr-2 h-4 w-4" />
              Započni novi ispit
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            Učitavanje…
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            Nije moguće učitati istoriju pokušaja.
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface-secondary/40 ring-1 ring-white/[0.04]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-surface-primary/40 text-xs uppercase tracking-wider text-text-muted">
                    <th className="px-4 py-3 font-semibold">Datum</th>
                    <th className="px-4 py-3 font-semibold">Kurs</th>
                    <th className="w-28 px-4 py-3 font-semibold">Bodovi</th>
                    <th className="w-36 px-4 py-3 font-semibold">Status</th>
                    <th className="w-40 px-4 py-3 font-semibold">Identitet</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                        Još nema pokušaja. Započni novi ispit kada si spreman/na.
                      </td>
                    </tr>
                  ) : (
                    attempts.map((a) => {
                      const sb = statusBadge(a.status);
                      const vb = verificationBadge(a.status, a.verificationStatus);
                      const score =
                        a.scorePercent != null && Number.isFinite(a.scorePercent)
                          ? `${a.scorePercent.toFixed(1)} %`
                          : "—";
                      return (
                        <tr
                          key={a.attemptId}
                          className="border-b border-border/30 transition-colors hover:bg-surface-primary/30"
                        >
                          <td className="px-4 py-3 text-text-primary">{formatDate(a.startedAt)}</td>
                          <td className="px-4 py-3 font-mono text-xs text-text-secondary">{a.courseId}</td>
                          <td className="px-4 py-3 text-text-primary">{score}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={cn("font-semibold", sb.className)}>
                              {sb.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {vb ? (
                              <Badge variant="outline" className={cn("text-xs font-semibold", vb.className)}>
                                {vb.label}
                              </Badge>
                            ) : (
                              <span className="text-text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <Dialog open={startOpen} onOpenChange={setStartOpen}>
          <DialogContent className="border-border/60 bg-surface-secondary text-text-primary sm:rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-text-primary">Novi ispit</DialogTitle>
              <DialogDescription className="text-text-secondary">
                Kurs <span className="font-mono text-text-primary">{examCourseId}</span>,{" "}
                <span className="font-mono text-text-primary">{MVP_NUM}</span> pitanja, raspodjela težina 40% / 40% /
                20%.
              </DialogDescription>
            </DialogHeader>
            {startError ? (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {startError}
              </p>
            ) : null}
            {eligibility && !eligibility.eligible ? (
              <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                {eligibility.reason ?? "Trenutno niste osposobljeni za ispit."}
              </p>
            ) : null}
            {eligibility?.requiresMfa && !eligibility.mfaSatisfied ? (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                Za ovaj ispit potrebna je MFA verifikacija naloga. Aktiviraj MFA u postavkama sigurnosti pa se ponovo
                prijavi.
              </p>
            ) : null}
            {eligibility ? (
              <div className="grid gap-2 rounded-lg border border-border/40 bg-surface-primary/35 px-3 py-3 text-xs text-text-muted">
                <p>
                  Završena obuka:{" "}
                  <span className="font-medium text-text-secondary">{eligibility.courseCompleted ? "Da" : "Ne"}</span>
                  {" · "}
                  Pravila: <span className="font-medium text-text-secondary">{eligibility.rulesAccepted ? "prihvaćena" : "nisu prihvaćena"}</span>
                </p>
                <p>
                  Pokušaji:{" "}
                  <span className="font-medium text-text-secondary">
                    {eligibility.attemptsUsed}/{eligibility.maxAttempts}
                  </span>
                  {" · "}
                  Prag prolaza:{" "}
                  <span className="font-medium text-text-secondary">{eligibility.passingScorePercent}%</span>
                </p>
                {eligibility.cooldownUntil ? (
                  <p>Retry / cooling: {formatDate(eligibility.cooldownUntil)}</p>
                ) : null}
                {eligibility.retryBefore ? <p>Dodatni pokušaj dostupan do: {formatDate(eligibility.retryBefore)}</p> : null}
              </div>
            ) : null}
            <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-surface-primary/40 px-3 py-3">
              <Checkbox
                id="exam-rules-ack"
                checked={rulesCheckbox}
                onCheckedChange={(v) => {
                  setRulesCheckbox(v === true);
                }}
                className="mt-0.5"
              />
              <Label htmlFor="exam-rules-ack" className="cursor-pointer text-sm leading-snug text-text-secondary">
                Pročitao/la sam pravila ispita i potvrđujem pokretanje u skladu s CONFORA pravilima (ovo se bilježi na
                serveru zajedno sa zahtjevom za start).
              </Label>
            </div>
            <div className="grid gap-2 py-2 text-sm text-text-secondary">
              <Label className="text-text-muted">Šta slijedi</Label>
              <p>
                Ako je uključena provjera identiteta, slijedi sigurnosni korak (kamera), zatim cjelozaslonski ispit.
                Potvrda o položenom ispitu nije certifikacija osobe — nalazi se pod „Moji dokumenti”.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-xs text-text-muted">
                <li>Ispit je formalni pokušaj i auditira se na serveru.</li>
                <li>AttemptId je vezan za kurs i korisnika; pokušaj ne možete prebaciti na drugi kurs.</li>
                <li>Ako ne položite, dodatni pokušaj vrijedi u retry prozoru od najviše 3 mjeseca kada je konfigurisan.</li>
              </ul>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="border-border/60"
                onClick={() => {
                  setStartOpen(false);
                }}
                disabled={startMutation.isPending}
              >
                Otkaži
              </Button>
              <Button
                type="button"
                className="bg-brand text-white hover:bg-brand/90"
                disabled={startMutation.isPending || !rulesCheckbox}
                onClick={() => {
                  startMutation.mutate();
                }}
              >
                {startMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Priprema…
                  </>
                ) : (
                  "Potvrdi i započni"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
