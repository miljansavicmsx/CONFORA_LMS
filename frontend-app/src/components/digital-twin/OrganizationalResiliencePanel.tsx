import { type JSX, useMemo } from "react";

import type { ResilienceSignal } from "@/lib/digital-twin";
import { cn } from "@/lib/utils";

const SEV: Record<ResilienceSignal["severity"], string> = {
  info: "border-sky-500/35 bg-sky-500/5 text-sky-100",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-50",
  critical: "border-rose-500/45 bg-rose-600/10 text-rose-50",
};

export function OrganizationalResiliencePanel({
  signals,
  aggregateSeverity,
}: {
  readonly signals: readonly ResilienceSignal[];
  readonly aggregateSeverity: ResilienceSignal["severity"];
}): JSX.Element {
  const text = useMemo(
    () =>
      signals.length
        ? signals.map((s) => `${s.title}: ${s.detail}`).join(" ")
        : "Nema detektiranih otpornosnih signala u ovom snimku.",
    [signals],
  );

  return (
    <section aria-label="Organizacijska otpornost" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Operational resilience</p>
      <p className="mt-1 text-sm text-text-secondary">
        Agregat: <span className="font-medium text-text-primary">{aggregateSeverity}</span>
      </p>
      <p className="sr-only">{text}</p>
      <ul className="mt-3 space-y-2">
        {signals.slice(0, 6).map((s) => (
          <li
            key={s.id}
            className={cn("rounded-xl border px-3 py-2 text-xs motion-reduce:transition-none", SEV[s.severity])}
          >
            <span className="font-semibold">{s.title}</span>
            <p className="mt-1 opacity-90">{s.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
