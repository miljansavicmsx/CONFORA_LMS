import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { LearnerJourneyBoundaryBanner } from "@/components/learner/LearnerJourneyBoundaryBanner";
import { LearnerDashboardNextAction } from "@/components/learner/LearnerDashboardNextAction";
import { LearnerSupportEntryCard } from "@/components/learner/LearnerSupportEntryCard";
import {
  educationEnrolmentStatusLabel,
  educationProgressStatusLabel,
  isEducationEnrolmentCompleted,
  LEARNER_EDUCATION_COMPLETION_BOUNDARY,
} from "@/lib/learner-polish-labels";
import { fetchEducationEnrolments, type EducationEnrolment } from "@/lib/learner-education-api";
import { cn } from "@/lib/utils";

type EducationTab = "active" | "completed";

function EnrolmentRow({
  enrolment,
  showCompletedActions,
}: {
  readonly enrolment: EducationEnrolment;
  readonly showCompletedActions: boolean;
}): JSX.Element {
  const completed = isEducationEnrolmentCompleted(enrolment);
  return (
    <li className="rounded-xl border border-border/50 p-4" data-testid={`learner-enrolment-row-${enrolment.id}`}>
      <p className="font-semibold text-text-primary">{enrolment.courseTitle}</p>
      <p className="text-xs text-text-muted">
        Status:{" "}
        <span data-testid={`learner-enrolment-progress-${enrolment.id}`}>
          {educationProgressStatusLabel(enrolment.progressStatus)} · {educationEnrolmentStatusLabel(enrolment.enrolmentStatus)}
        </span>
        {" · "}
        {enrolment.progressPct}%
      </p>
      {enrolment.completedAt ? (
        <p className="text-xs text-text-secondary">Završeno: {enrolment.completedAt.slice(0, 10)}</p>
      ) : null}
      {showCompletedActions && completed ? (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-text-secondary">{LEARNER_EDUCATION_COMPLETION_BOUNDARY}</p>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link to="/dashboard/certification/documents">Potvrde o edukaciji i ispitu</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-3">
          <Button type="button" size="sm" variant="secondary" asChild>
            <Link to={`/dashboard/learner/courses/${encodeURIComponent(enrolment.id)}`}>Nastavi učenje</Link>
          </Button>
        </div>
      )}
    </li>
  );
}

export default function LearnerEducationPage(): JSX.Element {
  const [tab, setTab] = useState<EducationTab>("active");
  const listQ = useQuery({
    queryKey: ["learner", "education", "enrolments"],
    queryFn: fetchEducationEnrolments,
  });
  const { active, completed } = useMemo(() => {
    const done: EducationEnrolment[] = [];
    const ongoing: EducationEnrolment[] = [];
    for (const enrolment of listQ.data ?? []) {
      if (isEducationEnrolmentCompleted(enrolment)) done.push(enrolment);
      else ongoing.push(enrolment);
    }
    return { active: ongoing, completed: done };
  }, [listQ.data]);
  const visible = tab === "active" ? active : completed;

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="learner-education-page">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-text-primary" data-testid="learner-education-heading">
            Moje edukacije
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Upisi i napredak. Lekcije se bilježe u playeru. Završetak edukacije nije certifikacijska odluka.
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
        <div className="flex gap-2 border-b border-border/40 pb-2" role="tablist" aria-label="Aktivne i završene edukacije" data-testid="learner-education-tabs">
          {(
            [
              { id: "active" as const, label: "Aktivne edukacije", count: active.length },
              { id: "completed" as const, label: "Završene edukacije", count: completed.length },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              data-testid={`learner-education-tab-${item.id}`}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                tab === item.id ? "bg-brand/15 text-brand" : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
              )}
              onClick={() => setTab(item.id)}
            >
              {item.label} ({item.count})
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
          {visible.map((enrolment) => (
            <EnrolmentRow key={enrolment.id} enrolment={enrolment} showCompletedActions={tab === "completed"} />
          ))}
          {!listQ.isPending && visible.length === 0 ? (
            <li className="text-sm text-text-muted" data-testid="learner-no-enrolments">
              {tab === "active" ? "Nema aktivnih upisa — upišite se iz kataloga nakon prijave." : "Još nemate završenih edukacija."}
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
