"use client";

import type { CourseAccessibilitySummary } from "@/lib/admin-course-a11y-api";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<CourseAccessibilitySummary["status"], string> = {
  green: "Spremno",
  yellow: "U grace periodu — popravite prije isteka",
  red: "Nije spremno — COM_TECH ne može odobriti",
};

const STATUS_CLASS: Record<CourseAccessibilitySummary["status"], string> = {
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  yellow: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  red: "border-red-500/40 bg-red-500/10 text-red-900 dark:text-red-100",
};

export function AccessibilityReadinessWidget({
  summary,
  loading,
  error,
}: {
  readonly summary: CourseAccessibilitySummary | null;
  readonly loading?: boolean;
  readonly error?: string | null;
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border/40 bg-surface-secondary p-4 text-sm text-text-muted">
        Učitavam accessibility readiness…
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }
  if (!summary) {
    return null;
  }

  return (
    <section
      className={cn("rounded-lg border p-4", STATUS_CLASS[summary.status])}
      aria-labelledby="a11y-readiness-heading"
    >
      <h3 id="a11y-readiness-heading" className="text-sm font-semibold">
        Accessibility readiness (WCAG 1.2)
      </h3>
      <p className="mt-1 text-xs opacity-90">
        Status: <strong>{STATUS_LABEL[summary.status]}</strong>
        {summary.videoLessonCount > 0 ? ` · ${summary.videoLessonCount} video lekcija` : ""}
      </p>
      {summary.inGracePeriod && summary.graceUntil ? (
        <p className="mt-2 text-xs" role="status">
          Grandfather grace do {new Date(summary.graceUntil).toLocaleDateString()} — objava je još dopuštena, ali
          titlovi/transkripti su obavezni prije isteka (ISO §9.1.4).
        </p>
      ) : null}
      {summary.missing.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs">
          {summary.missing.map((m) => (
            <li key={m.lessonId}>
              <span className="font-medium">{m.lessonTitle}</span>: nedostaje {m.missing.join(", ")}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs">Sve video lekcije imaju potrebne metapodatke pristupačnosti.</p>
      )}
    </section>
  );
}
