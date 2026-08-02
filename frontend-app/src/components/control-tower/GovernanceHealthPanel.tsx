import { type JSX, useMemo } from "react";

import { cn } from "@/lib/utils";
import type { GovernanceHealthResult, HealthBand } from "@/lib/operations-intelligence/intelligence-types";

const BAND_LABEL: Record<HealthBand, string> = {
  excellent: "Izvrsno",
  healthy: "Zdravo",
  warning: "Upozorenje",
  critical: "Kritično",
};

const BAND_STYLE: Record<HealthBand, string> = {
  excellent: "border-emerald-500/40 bg-emerald-500/10 text-emerald-50",
  healthy: "border-sky-500/40 bg-sky-500/10 text-sky-50",
  warning: "border-amber-500/45 bg-amber-500/10 text-amber-50",
  critical: "border-rose-500/50 bg-rose-600/15 text-rose-50",
};

export function GovernanceHealthPanel({ health }: { readonly health: GovernanceHealthResult }): JSX.Element {
  const top = useMemo(() => health.factors.slice(0, 5), [health.factors]);

  return (
    <section
      aria-label="Governance health"
      className={cn(
        "rounded-2xl border p-5 ring-1 ring-white/[0.04] backdrop-blur-sm transition-colors motion-reduce:transition-none",
        BAND_STYLE[health.band],
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Organizacijski health</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{health.score}</p>
          <p className="mt-1 text-xs opacity-90">{BAND_LABEL[health.band]} · heuristički indeks (0–100)</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs leading-snug opacity-95">
          {health.narrative}
        </div>
      </div>
      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-75">Faktori pritiska</p>
        <ul className="mt-2 space-y-2 text-xs">
          {top.length ? (
            top.map((f) => (
              <li key={f.id} className="flex justify-between gap-2 rounded-lg bg-black/20 px-2 py-1.5">
                <span>{f.label}</span>
                <span className="font-mono tabular-nums opacity-80">−{Math.round(f.penalty)}</span>
              </li>
            ))
          ) : (
            <li className="opacity-80">Nema značajnih faktora u ovom snimku.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
