import { type JSX } from "react";

import type { ComplianceGap } from "@/lib/compliance";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

const SEV: Record<ComplianceGap["severity"], string> = {
  info: "border-sky-500/35 bg-sky-500/5",
  warning: "border-amber-500/40 bg-amber-500/10",
  critical: "border-rose-500/45 bg-rose-600/12",
};

export function ComplianceGapPanel({ gaps }: { readonly gaps: readonly ComplianceGap[] }): JSX.Element {
  return (
    <section aria-label="Compliance jazovi" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Gaps</p>
      <ul className="mt-3 space-y-2">
        {gaps.length ? (
          gaps.map((g) => (
            <li key={g.id} className={cn("rounded-xl border px-3 py-2 text-xs", SEV[g.severity])}>
              <p className="font-semibold text-text-primary">{g.title}</p>
              <p className="mt-1 text-text-secondary">{g.detail}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-text-muted">{g.domain}</p>
              {g.actionRoute ? (
                <Link
                  to={g.actionRoute}
                  className="mt-2 inline-block text-[11px] font-medium text-brand underline-offset-2 hover:underline"
                >
                  Akcija →
                </Link>
              ) : null}
            </li>
          ))
        ) : (
          <li className="text-sm text-text-muted">Nema detektiranih jazova u ovom snimku.</li>
        )}
      </ul>
    </section>
  );
}
