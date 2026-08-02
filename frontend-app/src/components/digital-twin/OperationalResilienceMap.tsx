import { type JSX } from "react";

import type { ResilienceSignal } from "@/lib/digital-twin";
import { cn } from "@/lib/utils";

/** Lagani „flow” bez teškog grafa — tekstualni koraci + status traka. */
export function OperationalResilienceMap({
  signals,
}: {
  readonly signals: readonly ResilienceSignal[];
}): JSX.Element {
  const flow = ["Odbor", "QM / MR", "CAPA", "Audit", "Platform"];
  return (
    <section aria-label="Operativna otpornost tok" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Operational resilience map</p>
      <p className="mt-2 text-xs text-text-secondary">
        Pojednostavljen protok rješavanja — ne zamjenjuje BPMN; služi observability digital twin-u.
      </p>
      <ol className="mt-4 flex flex-wrap gap-2" aria-label="Pojednostavljeni koraci otpornosti">
        {flow.map((step, i) => (
          <li key={step} className="flex items-center gap-2 text-xs">
            <span className="rounded-lg border border-border/50 bg-surface-primary/70 px-2 py-1 font-medium text-text-primary">
              {i + 1}. {step}
            </span>
            {i < flow.length - 1 ? <span aria-hidden className="text-text-muted">→</span> : null}
          </li>
        ))}
      </ol>
      <div className="mt-4 space-y-2 border-t border-border/30 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Aktivni signal</p>
        {signals[0] ? (
          <p className={cn("text-xs", signals[0].severity === "critical" && "text-rose-200")}>{signals[0].detail}</p>
        ) : (
          <p className="text-xs text-text-muted">Nema prioritetnog resiliency signala.</p>
        )}
      </div>
    </section>
  );
}
