import { type JSX, useMemo } from "react";

import type { AccreditationPillar, ReadinessStatus } from "@/lib/digital-twin";
import { cn } from "@/lib/utils";

const ST: Record<ReadinessStatus, string> = {
  ready: "border-emerald-500/40 bg-emerald-500/10 text-emerald-50",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-50",
  critical: "border-rose-500/45 bg-rose-600/15 text-rose-50",
};

const HR: Record<ReadinessStatus, string> = {
  ready: "Spremno",
  warning: "Upozorenje",
  critical: "Kritično",
};

export function AccreditationReadinessPanel({
  pillars,
  aggregateStatus,
}: {
  readonly pillars: readonly AccreditationPillar[];
  readonly aggregateStatus: ReadinessStatus;
}): JSX.Element {
  const summary = useMemo(
    () =>
      `Akreditacijska spremnost ukupno ${aggregateStatus}. ` +
      pillars.map((p) => `${p.label}: ${HR[p.status]}, bod ${p.score}.`).join(" "),
    [aggregateStatus, pillars],
  );

  return (
    <section aria-label="Akreditacijska spremnost" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Accreditation readiness</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", ST[aggregateStatus])}>
          Agregat: {HR[aggregateStatus]}
        </span>
        <span className="text-xs text-text-muted">ISO/IEC 17024 (heuristički sloj, ne revizija treće strane)</span>
      </div>
      <p className="sr-only">{summary}</p>
      <ul className="mt-4 space-y-2">
        {pillars.map((p) => (
          <li
            key={p.id}
            className={cn("flex flex-col gap-1 rounded-xl border px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between", ST[p.status])}
          >
            <div>
              <p className="font-semibold text-text-primary">{p.label}</p>
              <p className="text-[10px] opacity-80">{p.standardRef}</p>
              <p className="mt-1 opacity-90">{p.detail}</p>
            </div>
            <span className="shrink-0 font-mono text-sm tabular-nums">{p.score}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
