import { type JSX, useMemo } from "react";

import type { GovernanceExposureSlice, ReadinessStatus } from "@/lib/digital-twin";
import { cn } from "@/lib/utils";

const ST: Record<ReadinessStatus, string> = {
  ready: "border-emerald-500/35 text-emerald-100",
  warning: "border-amber-500/40 text-amber-50",
  critical: "border-rose-500/45 text-rose-50",
};

export function GovernanceExposurePanel({ slices }: { readonly slices: readonly GovernanceExposureSlice[] }): JSX.Element {
  const summary = useMemo(
    () => slices.map((s) => `${s.label}: ${s.value}`).join(", "),
    [slices],
  );

  return (
    <section aria-label="Governance izloženost" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Governance exposure</p>
      <p className="sr-only">Eksponiranost operativnog zdjelama: {summary}</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {slices.map((s) => (
          <li key={s.id} className={cn("rounded-xl border bg-black/15 px-3 py-2 text-xs", ST[s.status])}>
            <p className="font-medium text-text-primary">{s.label}</p>
            <p className="mt-1 font-mono text-lg tabular-nums">{s.value}</p>
            <p className="mt-1 text-[10px] opacity-90">{s.hint}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
