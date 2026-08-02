import { type JSX } from "react";

import type { GovernanceMaturityResult, MaturityLevel } from "@/lib/digital-twin";
import { cn } from "@/lib/utils";

const LV: Record<MaturityLevel, string> = {
  reactive: "Reaktivno",
  managed: "Upravljano",
  controlled: "Kontrolirano",
  optimized: "Optimizirano",
};

const BAR: Record<MaturityLevel, string> = {
  reactive: "bg-rose-500/70",
  managed: "bg-amber-500/70",
  controlled: "bg-sky-500/70",
  optimized: "bg-emerald-500/70",
};

export function GovernanceMaturityPanel({ maturity }: { readonly maturity: GovernanceMaturityResult }): JSX.Element {
  const pct = maturity.score;
  return (
    <section aria-label="Zrelost upravljanja" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Governance maturity</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <p className="text-2xl font-semibold tabular-nums text-text-primary">{pct}</p>
        <p className="text-sm text-text-secondary">/ 100 · {LV[maturity.level]}</p>
      </div>
      <p className="sr-only">
        Zrelost {maturity.level}, skor {maturity.score}. {maturity.narrative}
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/30" role="presentation">
        <div
          className={cn("h-full rounded-full motion-safe:transition-[width] motion-reduce:transition-none", BAR[maturity.level])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-text-secondary">{maturity.narrative}</p>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-text-muted">Pokretači</p>
      <ul className="mt-2 space-y-1 text-xs">
        {maturity.drivers.slice(0, 5).map((d) => (
          <li key={d.id} className="flex justify-between gap-2 rounded-lg bg-black/20 px-2 py-1">
            <span>{d.label}</span>
            <span className="font-mono tabular-nums text-text-muted">{Math.round(d.contribution)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
