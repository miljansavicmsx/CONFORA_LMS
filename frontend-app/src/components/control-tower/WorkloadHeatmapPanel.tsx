import { type JSX } from "react";

import { cn } from "@/lib/utils";
import type { WorkloadRoleSlice } from "@/lib/operations-intelligence/intelligence-types";

export function WorkloadHeatmapPanel({
  workload,
}: {
  readonly workload: readonly WorkloadRoleSlice[];
}): JSX.Element {
  return (
    <section aria-label="Workload po ulozi" className="rounded-2xl border border-border/45 bg-surface-secondary/30 p-4 ring-1 ring-white/[0.03]">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Workload heatmap</p>
      <p className="text-xs text-text-secondary">Saturacija 0–100% — inferencija iz dashboard konteksta.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {workload.map((w) => {
          const pct = Math.round(w.saturation * 100);
          return (
            <div key={w.roleId} className="rounded-xl border border-border/40 bg-black/20 p-3">
              <p className="text-xs font-semibold text-text-primary">{w.label}</p>
              <p className="mt-1 font-mono text-[11px] text-text-muted">
                Red {w.queueSize} · prekoračenja/proxy {w.overdue}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-all motion-reduce:transition-none",
                    pct >= 80 ? "bg-rose-500" : pct >= 55 ? "bg-amber-400" : "bg-emerald-400",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-text-muted">
                {pct}% saturacija —{" "}
                {w.avgCompletionHint.length > 70 ? `${w.avgCompletionHint.slice(0, 70)}…` : w.avgCompletionHint}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
