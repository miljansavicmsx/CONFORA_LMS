import { type JSX } from "react";

import { cn } from "@/lib/utils";
import type { WorkflowInsight } from "@/lib/operations-intelligence/intelligence-types";

const SEV: Record<string, string> = {
  info: "border-slate-500/35 bg-slate-500/10",
  warning: "border-amber-500/40 bg-amber-500/10",
  critical: "border-rose-500/45 bg-rose-600/15",
};

export function WorkflowBottleneckPanel({
  insights,
}: {
  readonly insights: readonly WorkflowInsight[];
}): JSX.Element {
  return (
    <section aria-label="Workflow bottleneck inteligencija" className="space-y-3">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Workflow inteligencija</p>
        <p className="text-sm text-text-secondary">
          Heuristike: najduže čekanje, kongestija odobrenja, zastoj certifikacije — bez backend AI.
        </p>
      </header>
      <ul className="space-y-2">
        {insights.length ? (
          insights.map((w) => (
            <li
              key={w.id}
              className={cn("rounded-xl border px-3 py-2 text-sm ring-1 ring-white/[0.03]", SEV[w.severity])}
            >
              <p className="font-semibold text-text-primary">{w.title}</p>
              <p className="text-xs text-text-secondary">{w.detail}</p>
            </li>
          ))
        ) : (
          <li className="rounded-xl border border-border/40 bg-surface-secondary/30 px-3 py-2 text-sm text-text-muted">
            Nema detektovanih bottleneck signala u trenutnom kontekstu.
          </li>
        )}
      </ul>
    </section>
  );
}
