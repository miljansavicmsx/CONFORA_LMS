import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { LearnerJourneyBoundaryBanner } from "@/components/learner/LearnerJourneyBoundaryBanner";
import { LearnerDashboardNextAction } from "@/components/learner/LearnerDashboardNextAction";
import { LearnerSupportEntryCard } from "@/components/learner/LearnerSupportEntryCard";
import { moduleProgressLabel } from "@/lib/learner-flow-labels";
import {
  educationEnrolmentStatusLabel,
  educationProgressStatusLabel,
  isEducationEnrolmentCompleted,
  LEARNER_EDUCATION_COMPLETION_BOUNDARY,
} from "@/lib/learner-polish-labels";
import {
  fetchEducationEnrolments,
  fetchCompletionCertificate,
  fetchModuleProgress,
  patchModuleProgress,
  type EducationCompletionCertificate,
  type EducationEnrolment,
  type EducationProgressStatus,
} from "@/lib/learner-education-api";
import { cn } from "@/lib/utils";

type EducationTab = "active" | "completed";

function EnrolmentRow({
  e,
  expandedId,
  setExpandedId,
  moduleQ,
  updateModule,
  onViewCompletionCert,
  showCompletedActions,
}: {
  readonly e: EducationEnrolment;
  readonly expandedId: string | null;
  readonly setExpandedId: (id: string | null) => void;
  readonly moduleQ: ReturnType<typeof useQuery>;
  readonly updateModule: ReturnType<typeof useMutation>;
  readonly onViewCompletionCert: (id: string) => void;
  readonly showCompletedActions: boolean;
}): JSX.Element {
  const completed = isEducationEnrolmentCompleted(e);

  return (
    <li
      className="rounded-xl border border-border/50 p-4"
      data-testid={`learner-enrolment-row-${e.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text-primary">{e.courseTitle}</p>
          <p className="text-xs text-text-muted">
            Status:{" "}
            <span data-testid={`learner-enrolment-progress-${e.id}`}>
              {educationProgressStatusLabel(e.progressStatus)} · {educationEnrolmentStatusLabel(e.enrolmentStatus)}
            </span>
            {" · "}
            {e.progressPct}%
          </p>
          <p className="mt-0.5 text-[11px] text-text-muted">
            Interni ID: <span className="font-mono">{e.courseId.slice(0, 8)}…</span>
          </p>
          {e.completedAt ? (
            <p className="text-xs text-text-secondary">Završeno: {e.completedAt.slice(0, 10)}</p>
          ) : null}
          {!completed && e.progressPct < 100 ? (
            <p className="mt-2 text-xs text-text-secondary" data-testid={`learner-enrolment-next-step-${e.id}`}>
              Sljedeći korak: otvorite module i nastavite učenje.
            </p>
          ) : null}
          {showCompletedActions && completed ? (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-amber-200/90">{LEARNER_EDUCATION_COMPLETION_BOUNDARY}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                data-testid={`learner-view-completion-cert-${e.id}`}
                onClick={() => onViewCompletionCert(e.id)}
              >
                Potvrda o završetku edukacije
              </Button>
            </div>
          ) : null}
        </div>
        {!completed ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            data-testid={`learner-enrolment-modules-toggle-${e.id}`}
            onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
          >
            {expandedId === e.id ? "Sakrij module" : "Nastavi / moduli"}
          </Button>
        ) : null}
      </div>

      {expandedId === e.id && !completed ? (
        <div className="mt-4 border-t border-border/40 pt-3" data-testid={`learner-module-progress-${e.id}`}>
          {moduleQ.isPending ? (
            <p className="text-xs text-text-muted">Učitavanje modula…</p>
          ) : (
            <ul className="space-y-2">
              {(moduleQ.data?.modules ?? []).map((m) => (
                <li
                  key={m.moduleId}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs"
                  data-testid={`learner-module-row-${m.moduleId}`}
                >
                  <span>
                    {m.order}. {m.title} —{" "}
                    <span data-testid={`learner-module-status-${m.moduleId}`}>
                      {moduleProgressLabel(m.status)}
                    </span>
                  </span>
                  {m.status !== "COMPLETED" ? (
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        data-testid={`learner-module-inprogress-${m.moduleId}`}
                        disabled={updateModule.isPending}
                        onClick={() =>
                          updateModule.mutate({
                            enrollmentId: e.id,
                            moduleId: m.moduleId,
                            status: "IN_PROGRESS",
                          })
                        }
                      >
                        U tijeku
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        data-testid={`learner-module-complete-${m.moduleId}`}
                        disabled={updateModule.isPending}
                        onClick={() =>
                          updateModule.mutate({
                            enrollmentId: e.id,
                            moduleId: m.moduleId,
                            status: "COMPLETED",
                          })
                        }
                      >
                        Završi
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {moduleQ.data ? (
            <p className="mt-2 text-xs text-text-secondary" data-testid={`learner-aggregate-progress-${e.id}`}>
              Agregirani napredak: {moduleQ.data.progressPct}% (
              {educationProgressStatusLabel(moduleQ.data.progressStatus)})
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export default function LearnerEducationPage(): JSX.Element {
  const qc = useQueryClient();
  const [tab, setTab] = useState<EducationTab>("active");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completionCert, setCompletionCert] = useState<EducationCompletionCertificate | null>(null);

  const listQ = useQuery({
    queryKey: ["learner", "education", "enrolments"],
    queryFn: fetchEducationEnrolments,
  });

  const moduleQ = useQuery({
    queryKey: ["learner", "education", "modules", expandedId],
    queryFn: () => fetchModuleProgress(expandedId!),
    enabled: Boolean(expandedId),
  });

  const updateModule = useMutation({
    mutationFn: ({
      enrollmentId,
      moduleId,
      status,
    }: {
      enrollmentId: string;
      moduleId: string;
      status: EducationProgressStatus;
    }) => patchModuleProgress(enrollmentId, moduleId, status),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["learner", "education"] });
    },
  });

  const { active, completed } = useMemo(() => {
    const all = listQ.data ?? [];
    const done: EducationEnrolment[] = [];
    const ongoing: EducationEnrolment[] = [];
    for (const e of all) {
      if (isEducationEnrolmentCompleted(e)) {
        done.push(e);
      } else {
        ongoing.push(e);
      }
    }
    return { active: ongoing, completed: done };
  }, [listQ.data]);

  const visible = tab === "active" ? active : completed;

  const loadCompletionCert = (id: string): void => {
    void fetchCompletionCertificate(id)
      .then(setCompletionCert)
      .catch(() => setCompletionCert(null));
  };

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="learner-education-page">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-text-primary" data-testid="learner-education-heading">
            Moje edukacije
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Upisi, napredak po modulima i završetak (odvojeno od certifikacije).
          </p>
        </header>

        <LearnerJourneyBoundaryBanner />

        <LearnerDashboardNextAction activeProgrammes={active.length} />

        <LearnerSupportEntryCard context="education" />

        <p className="text-sm">
          <Link to="/courses" className="text-brand underline-offset-4 hover:underline">
            Otvori katalog programa
          </Link>
        </p>

        <div
          className="flex gap-2 border-b border-border/40 pb-2"
          role="tablist"
          aria-label="Aktivne i završene edukacije"
          data-testid="learner-education-tabs"
        >
          {(
            [
              { id: "active" as const, label: "Aktivne edukacije", count: active.length },
              { id: "completed" as const, label: "Završene edukacije", count: completed.length },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              data-testid={`learner-education-tab-${t.id}`}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-brand/15 text-brand"
                  : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
              )}
              onClick={() => setTab(t.id)}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {listQ.isError ? <p className="text-sm text-red-400">Nije moguće učitati upise.</p> : null}

        {listQ.isPending ? (
          <p className="text-sm text-text-muted" data-testid="learner-education-loading">
            Učitavanje upisa…
          </p>
        ) : null}

        <ul className="space-y-3" data-testid="learner-education-enrolment-list">
          {visible.map((e) => (
            <EnrolmentRow
              key={e.id}
              e={e}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              moduleQ={moduleQ}
              updateModule={updateModule}
              onViewCompletionCert={loadCompletionCert}
              showCompletedActions={tab === "completed"}
            />
          ))}
          {!listQ.isPending && visible.length === 0 ? (
            <li className="text-sm text-text-muted" data-testid="learner-no-enrolments">
              {tab === "active"
                ? "Nema aktivnih upisa — upišite se iz kataloga."
                : "Još nemate završenih edukacija."}
            </li>
          ) : null}
        </ul>

        {completionCert ? (
          <div
            className="rounded-xl border border-brand/40 bg-brand/5 p-4 text-sm"
            data-testid="learner-completion-certificate-panel"
          >
            <h2 className="font-semibold text-text-primary" data-testid="learner-completion-cert-title">
              Potvrda o završetku edukacije
            </h2>
            <p className="mt-1 text-xs text-amber-400" data-testid="learner-completion-cert-boundary">
              {LEARNER_EDUCATION_COMPLETION_BOUNDARY}
            </p>
            <dl className="mt-3 space-y-1 text-xs text-text-secondary">
              <div>
                <dt className="inline font-medium">Referenca: </dt>
                <dd className="inline" data-testid="learner-completion-cert-reference">
                  {completionCert.reference}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Program: </dt>
                <dd className="inline">{completionCert.courseTitle}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Završeno: </dt>
                <dd className="inline">{completionCert.completedAt.slice(0, 10)}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
