import { type JSX } from "react";

import type { ComplianceMaturityResult, ComplianceMaturityLevel } from "@/lib/compliance";
import { cn } from "@/lib/utils";

const LV: Record<ComplianceMaturityLevel, string> = {
  ad_hoc: "Ad hoc",
  managed: "Upravljano",
  controlled: "Kontrolirano",
  optimized: "Optimizirano",
};

const BAR: Record<ComplianceMaturityLevel, string> = {
  ad_hoc: "bg-rose-500/75",
  managed: "bg-amber-500/75",
  controlled: "bg-sky-500/75",
  optimized: "bg-emerald-500/75",
};

export function ComplianceMaturityPanel({ maturity }: { readonly maturity: ComplianceMaturityResult }): JSX.Element {
  const pct = maturity.score;
  return (
    <section aria-label="Zrelost usklađenosti" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Compliance maturity</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">{pct}</p>
      <p className="text-sm text-text-secondary">{LV[maturity.level]}</p>
      <p className="sr-only">
        {maturity.narrative}
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/30" role="presentation">
        <div
          className={cn("h-full rounded-full motion-safe:transition-[width] motion-reduce:transition-none", BAR[maturity.level])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-text-secondary">{maturity.narrative}</p>
    </section>
  );
}
