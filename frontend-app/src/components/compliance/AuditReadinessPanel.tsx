import { type JSX } from "react";

import type { DomainReadiness, AuditReadinessTier } from "@/lib/compliance";
import { cn } from "@/lib/utils";

const T: Record<AuditReadinessTier, string> = {
  ready: "border-emerald-500/40 text-emerald-100",
  partial: "border-sky-500/40 text-sky-50",
  warning: "border-amber-500/45 text-amber-50",
  critical: "border-rose-500/50 text-rose-50",
};

const L: Record<AuditReadinessTier, string> = {
  ready: "Spremno",
  partial: "Djelomično",
  warning: "Upozorenje",
  critical: "Kritično",
};

export function AuditReadinessPanel({ domains }: { readonly domains: readonly DomainReadiness[] }): JSX.Element {
  return (
    <section aria-label="Audit readiness po domenama" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Audit readiness</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {domains.map((d) => (
          <li key={d.domain} className={cn("rounded-xl border bg-black/15 px-3 py-2 text-xs", T[d.tier])}>
            <p className="font-medium capitalize text-text-primary">{d.domain.replace(/_/g, " ")}</p>
            <p className="mt-1 text-[10px] opacity-90">{L[d.tier]} · {d.score}</p>
            <p className="mt-1 text-[11px] text-text-secondary">{d.narrative}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
