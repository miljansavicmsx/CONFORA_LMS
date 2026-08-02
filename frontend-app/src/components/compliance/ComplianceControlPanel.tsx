import { type JSX } from "react";

import type { ComplianceControl } from "@/lib/compliance";

export function ComplianceControlPanel({ controls }: { readonly controls: readonly ComplianceControl[] }): JSX.Element {
  return (
    <section aria-label="Interni kontrolni okvir" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Controls</p>
      <ul className="mt-3 space-y-2 text-xs">
        {controls.map((c) => (
          <li key={c.id} className="rounded-xl border border-border/35 bg-surface-primary/50 px-3 py-2">
            <p className="font-semibold text-text-primary">{c.label}</p>
            <p className="mt-1 text-text-secondary">{c.description}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-text-muted">{c.domain}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
