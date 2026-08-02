import { type JSX } from "react";

import { cn } from "@/lib/utils";
import type { CrossModuleInsight } from "@/lib/operations-intelligence/intelligence-types";

const SEV: Record<string, string> = {
  info: "border-slate-500/30",
  warning: "border-amber-500/40",
  critical: "border-rose-500/45",
};

export function ComplianceHealthPanel({
  insights,
}: {
  readonly insights: readonly CrossModuleInsight[];
}): JSX.Element {
  return (
    <section
      aria-label="Cross-module compliance uvid"
      className="rounded-2xl border border-border/45 bg-surface-secondary/35 p-4 ring-1 ring-white/[0.03]"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Cross-module uvidi</p>
      <p className="text-xs text-text-secondary">
        Heurističke kombinacije signala (pritužbe, odbor, CAPA, audit).
      </p>
      <ul className="mt-3 space-y-2">
        {insights.length ? (
          insights.map((c) => (
            <li key={c.id} className={cn("rounded-xl border bg-black/20 px-3 py-2 text-sm", SEV[c.severity])}>
              <p className="font-semibold text-text-primary">{c.title}</p>
              <p className="text-xs text-text-secondary">{c.detail}</p>
            </li>
          ))
        ) : (
          <li className="text-sm text-text-muted">Nema kombinovanih uvida u ovom snimku.</li>
        )}
      </ul>
    </section>
  );
}
