import { type JSX } from "react";

import type { ComplianceHeuristicSnapshot } from "@/lib/compliance";
import { Link } from "react-router";

export function CorrectiveExposurePanel({ s }: { readonly s: ComplianceHeuristicSnapshot }): JSX.Element {
  return (
    <section aria-label="Korektivna izloženost" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Corrective exposure</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/40 bg-black/15 px-3 py-2">
          <p className="text-[10px] text-text-muted">CAPA preko roka</p>
          <p className="font-mono text-2xl tabular-nums text-text-primary">{s.capaOverdue}</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-black/15 px-3 py-2">
          <p className="text-[10px] text-text-muted">Otvoreno CAPA/NCR</p>
          <p className="font-mono text-2xl tabular-nums text-text-primary">{s.capaOpen}</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-black/15 px-3 py-2">
          <p className="text-[10px] text-text-muted">MR akcije (prekoračenje)</p>
          <p className="font-mono text-2xl tabular-nums text-text-primary">{s.managementReviewOverdueActions}</p>
        </div>
      </div>
      <Link
        to="/dashboard/iso/capa"
        className="mt-3 inline-flex text-xs font-medium text-brand underline-offset-2 hover:underline"
      >
        Otvori CAPA radni prostor →
      </Link>
    </section>
  );
}
