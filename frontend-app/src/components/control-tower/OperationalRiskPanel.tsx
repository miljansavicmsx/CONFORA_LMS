import { type JSX } from "react";

import { cn } from "@/lib/utils";
import type { OperationalRiskProfile } from "@/lib/operations-intelligence/intelligence-types";

export function OperationalRiskPanel({ risk }: { readonly risk: OperationalRiskProfile }): JSX.Element {
  return (
    <section
      aria-label="Operativni rizik usklađenosti"
      className="rounded-2xl border border-border/45 bg-surface-secondary/35 p-5 ring-1 ring-white/[0.03]"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Compliance & operativni rizik</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">{risk.complianceScore}</p>
      <p className="text-sm text-text-secondary">{risk.label}</p>
      <ul className="mt-4 space-y-2 text-sm text-text-secondary">
        {risk.drivers.length ? (
          risk.drivers.map((d, i) => (
            <li key={i} className={cn("rounded-lg border border-border/35 bg-black/20 px-3 py-2")}>
              {d}
            </li>
          ))
        ) : (
          <li className="text-text-muted">Nema akumuliranih drivera u trenutnom snimku.</li>
        )}
      </ul>
      <p className="mt-3 text-[10px] text-text-muted">
        Inferencija isključivo iz agregiranih brojki — nije automatizovani regulatorni zaključak.
      </p>
    </section>
  );
}
