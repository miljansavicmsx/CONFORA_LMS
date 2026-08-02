import { type JSX } from "react";

import type { AccreditationExposureItem, AuditReadinessTier } from "@/lib/compliance";
import { cn } from "@/lib/utils";

const T: Record<AuditReadinessTier, string> = {
  ready: "border-emerald-500/35",
  partial: "border-slate-500/30",
  warning: "border-amber-500/40",
  critical: "border-rose-500/45",
};

export function AccreditationExposurePanel({
  items,
}: {
  readonly items: readonly AccreditationExposureItem[];
}): JSX.Element {
  return (
    <section aria-label="Akreditacijska izloženost" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Accreditation exposure</p>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i.id} className={cn("flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs", T[i.tier])}>
            <div>
              <p className="font-medium text-text-primary">{i.label}</p>
              <p className="mt-1 text-[11px] text-text-secondary">{i.hint}</p>
            </div>
            <span className="font-mono text-lg tabular-nums text-text-primary">{i.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
