/**
 * Prijava za ispit — learner exam registration MVP (EXAM-REG-1).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Loader2, Lock } from "lucide-react";
import { useCallback, useState, type JSX } from "react";
import { Link } from "react-router";

import { CertificationLexiconBanner } from "@/components/learner/CertificationLexiconBanner";
import { ContextRibbon } from "@/components/information-disclosure";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createExamRegistration,
  fetchExamRegistrationOptions,
  type LearnerExamRegistrationAvailableItem,
} from "@/lib/api-exam-registration";
import {
  EXAM_REGISTRATION_AVAILABLE_EMPTY,
  EXAM_REGISTRATION_BLOCKED_EMPTY,
  EXAM_REGISTRATION_BOUNDARY_NOTICE,
  EXAM_REGISTRATION_MY_EMPTY,
  EXAM_REGISTRATION_RESULTS_NOTICE,
  learnerExamRegistrationStatusLabel,
} from "@/lib/exam-registration-labels";
import { IA_RIBBON_LEARNER_TRUST } from "@/lib/workspace-continuity";

const OPTIONS_KEY = ["exam-registration", "options"] as const;

function formatWhen(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  try {
    return new Date(iso).toLocaleString("bs-BA", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function ExamRegistrationPage(): JSX.Element {
  const [toast, setToast] = useState<string | null>(null);
  const [busyCourseId, setBusyCourseId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: OPTIONS_KEY,
    queryFn: fetchExamRegistrationOptions,
  });

  const registerMutation = useMutation({
    mutationFn: createExamRegistration,
    onSuccess: (res) => {
      setToast(res.message);
      void queryClient.invalidateQueries({ queryKey: OPTIONS_KEY });
    },
    onError: () => {
      setToast("Prijava za ispit trenutno nije dostupna. Provjerite uslove programa.");
    },
    onSettled: () => {
      setBusyCourseId(null);
    },
  });

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const onRegister = useCallback(
    (item: LearnerExamRegistrationAvailableItem) => {
      if (!item.canRegister || busyCourseId) {
        return;
      }
      setBusyCourseId(item.courseId);
      registerMutation.mutate({ courseId: item.courseId, examId: item.examId });
    },
    [busyCourseId, registerMutation],
  );

  const available = data?.available ?? [];
  const registrations = data?.registrations ?? [];
  const blocked = data?.blocked ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="learner-exam-registration-page">
      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-emerald-950/90 px-4 py-3 text-sm text-emerald-100 shadow-lg backdrop-blur"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-brand" aria-hidden />
            <h1 className="text-2xl font-bold text-text-primary">Prijava za ispit</h1>
          </div>
          <p className="mt-3 text-sm text-text-secondary" data-testid="learner-exam-registration-boundary">
            {EXAM_REGISTRATION_BOUNDARY_NOTICE}
          </p>
          <p className="mt-2 text-xs text-text-muted" data-testid="learner-exam-registration-results-notice">
            {EXAM_REGISTRATION_RESULTS_NOTICE}
          </p>
          <div className="mt-4">
            <ContextRibbon title="IA kontinuitet — ispit vs certifikacija" items={IA_RIBBON_LEARNER_TRUST} />
          </div>
        </header>

        <div className="mb-8">
          <CertificationLexiconBanner variant="compact" />
        </div>

        <div className="mb-6 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border/60"
            disabled={isFetching}
            onClick={() => {
              void refetch();
            }}
          >
            {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Osvježi
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            Učitavanje opcija prijave…
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            Nije moguće učitati opcije prijave za ispit. Provjerite prijavu i vezu s API-jem.
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <div className="space-y-12">
            <section aria-labelledby="exam-reg-available-heading" data-testid="learner-exam-section-available">
              <h2 id="exam-reg-available-heading" className="text-lg font-semibold text-text-primary">
                A. Dostupno za prijavu
              </h2>
              {available.length === 0 ? (
                <p className="mt-4 rounded-xl border border-border/40 bg-surface-secondary/30 px-4 py-6 text-sm text-text-secondary">
                  {EXAM_REGISTRATION_AVAILABLE_EMPTY}
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {available.map((item) => (
                    <li
                      key={`${item.courseId}-${item.examId}`}
                      className="rounded-2xl border border-border/50 bg-surface-secondary/40 p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <p className="font-semibold text-text-primary">{item.courseTitle}</p>
                          <p className="text-sm text-text-secondary">{item.examTitle}</p>
                          <Badge variant="outline" className="mt-1 border-emerald-500/40 text-emerald-100">
                            {item.learnerLabel}
                          </Badge>
                          <p className="text-xs text-text-muted">{item.nextStep}</p>
                          {item.deliveryMode ? (
                            <p className="text-xs text-text-muted">Način: {item.deliveryMode === "ONLINE" ? "Online" : item.deliveryMode}</p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="shrink-0 bg-brand text-white hover:bg-brand/90"
                          disabled={!item.canRegister || busyCourseId === item.courseId}
                          data-testid={`learner-exam-register-btn-${item.courseId}`}
                          onClick={() => onRegister(item)}
                        >
                          {busyCourseId === item.courseId ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Prijavi ispit
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="exam-reg-my-heading" data-testid="learner-exam-section-registrations">
              <h2 id="exam-reg-my-heading" className="text-lg font-semibold text-text-primary">
                B. Moje prijave za ispit
              </h2>
              {registrations.length === 0 ? (
                <p className="mt-4 rounded-xl border border-border/40 bg-surface-secondary/30 px-4 py-6 text-sm text-text-secondary">
                  {EXAM_REGISTRATION_MY_EMPTY}
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {registrations.map((reg) => (
                    <li
                      key={reg.registrationId}
                      className="rounded-2xl border border-border/50 bg-surface-secondary/40 p-5"
                    >
                      <p className="font-semibold text-text-primary">{reg.examTitle}</p>
                      <p className="text-sm text-text-secondary">{reg.courseTitle}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-brand/40 text-brand">
                          {reg.learnerLabel || learnerExamRegistrationStatusLabel(reg.status)}
                        </Badge>
                        <span className="text-xs text-text-muted" data-testid={`learner-exam-reg-status-${reg.registrationId}`}>
                          {learnerExamRegistrationStatusLabel(reg.status)}
                        </span>
                      </div>
                      <dl className="mt-3 grid gap-1 text-xs text-text-secondary sm:grid-cols-2">
                        <div>
                          <dt className="text-text-muted">Zakazano</dt>
                          <dd>{formatWhen(reg.scheduledAt)}</dd>
                        </div>
                        <div>
                          <dt className="text-text-muted">Način</dt>
                          <dd>{reg.deliveryMode === "ONLINE" ? "Online" : reg.deliveryMode ?? "—"}</dd>
                        </div>
                      </dl>
                      <p className="mt-2 text-xs text-text-muted">{reg.nextStep}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="exam-reg-blocked-heading" data-testid="learner-exam-section-blocked">
              <h2 id="exam-reg-blocked-heading" className="text-lg font-semibold text-text-primary">
                C. Još nisu ispunjeni uslovi
              </h2>
              {blocked.length === 0 ? (
                <p className="mt-4 rounded-xl border border-border/40 bg-surface-secondary/30 px-4 py-6 text-sm text-text-secondary">
                  {EXAM_REGISTRATION_BLOCKED_EMPTY}
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {blocked.map((item) => (
                    <li
                      key={item.courseId}
                      className="rounded-2xl border border-dashed border-border/50 bg-surface-secondary/25 p-5"
                    >
                      <div className="flex items-start gap-2">
                        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
                        <div>
                          <p className="font-semibold text-text-primary">{item.courseTitle}</p>
                          {item.examTitle ? (
                            <p className="text-sm text-text-secondary">{item.examTitle}</p>
                          ) : null}
                          <p className="mt-1 text-sm font-medium text-amber-100">{item.learnerLabel}</p>
                          <p className="text-xs text-text-muted">{item.reason}</p>
                          <p className="mt-2 text-xs text-text-secondary">{item.nextStep}</p>
                          {item.eligibilityStatus === "BLOCKED_EDUCATION_NOT_COMPLETED" ? (
                            <Button asChild type="button" variant="link" className="mt-2 h-auto p-0 text-brand">
                              <Link to="/dashboard/learner/education">Nastavite edukaciju</Link>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
