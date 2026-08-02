import { Award, CheckCircle2, ClipboardList, GraduationCap } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import type { DashboardActivity } from "@/lib/dashboard-home-api";
import { cn } from "@/lib/utils";

function activityIcon(kind: DashboardActivity["kind"]): JSX.Element {
  const cls = "h-4 w-4 shrink-0 text-brand";
  switch (kind) {
    case "lesson":
      return <CheckCircle2 className={cls} aria-hidden />;
    case "quiz":
      return <ClipboardList className={cls} aria-hidden />;
    default:
      return <GraduationCap className={cls} aria-hidden />;
  }
}

export function ActivityBlock({
  activities,
}: {
  readonly activities: readonly DashboardActivity[];
}): JSX.Element {
  return (
    <>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Nedavna aktivnost</h2>
      {activities.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-surface-primary/35 p-4">
          <Award className="h-5 w-5 text-text-muted" aria-hidden />
          <p className="mt-3 text-sm font-medium text-text-primary">Još nema aktivnosti.</p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            Kada pokrenete lekciju, završite ispit ili podnesete prijavu, ovdje će se pojaviti trag aktivnosti.
          </p>
          <Button asChild type="button" size="sm" variant="outline" className="mt-4 border-border/60">
            <Link to="/dashboard/courses">Otvori edukacije</Link>
          </Button>
        </div>
      ) : null}
      <ul className="mt-4 space-y-0 divide-y divide-border/40">
        {activities.map((a) => (
          <li key={a.id} className="flex gap-3 py-4 first:pt-0">
            <span className="mt-0.5">{activityIcon(a.kind)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-text-primary">{a.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                <span>{a.timeLabel}</span>
                {a.detail ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{a.detail}</span>
                  </>
                ) : null}
                <span
                  className={cn("rounded-md bg-surface-tertiary/60 px-2 py-0.5 font-medium text-text-secondary")}
                >
                  {a.courseTag}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
