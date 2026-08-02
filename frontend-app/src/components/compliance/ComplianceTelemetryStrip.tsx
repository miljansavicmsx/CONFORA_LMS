import { type JSX, useMemo } from "react";

import type { ComplianceTelemetrySlice } from "@/lib/compliance";

export function ComplianceTelemetryStrip({
  slices,
}: {
  readonly slices: readonly ComplianceTelemetrySlice[];
}): JSX.Element {
  const txt = useMemo(() => slices.map((s) => `${s.label}: ${s.value} ${s.unit}`).join(". "), [slices]);
  return (
    <section aria-label="Compliance telemetrija" className="rounded-2xl border border-border/45 bg-surface-secondary/30 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Observability</p>
      <p className="sr-only">{txt}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        {slices.map((s) => (
          <div key={s.id} className="min-w-[140px] rounded-xl border border-border/35 bg-surface-primary/50 px-3 py-2 text-xs">
            <p className="text-[10px] text-text-muted">{s.label}</p>
            <p className="font-mono text-lg tabular-nums text-text-primary">
              {s.value} <span className="text-[10px] font-sans text-text-secondary">{s.unit}</span>
            </p>
            <p className="mt-1 text-[10px] text-text-muted">{s.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
