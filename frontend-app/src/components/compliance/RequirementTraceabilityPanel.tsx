import { type JSX } from "react";

import type { TraceabilityLink } from "@/lib/compliance";
import { Link } from "react-router";

export function RequirementTraceabilityPanel({
  links,
}: {
  readonly links: readonly TraceabilityLink[];
}): JSX.Element {
  return (
    <section aria-label="Trag zahtjeva" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Traceability</p>
      <p className="mt-2 text-xs text-text-secondary">
        Predložene veze u vokabularu relationship layera (nisu perzistirane granove u bazi).
      </p>
      <ul className="mt-3 space-y-2 text-xs">
        {links.slice(0, 24).map((l, idx) => (
          <li key={`${l.requirementId}-${idx}`} className="rounded-lg border border-border/35 bg-surface-primary/50 px-2 py-1.5">
            <span className="font-mono text-[10px] text-text-muted">{l.requirementId}</span>
            <span className="mx-1 text-text-muted">·</span>
            <span className="font-medium">{l.relationshipType}</span>
            <span className="mx-1 text-text-muted">→</span>
            <span className="text-text-primary">
              {l.targetKind}: {l.targetLabel}
            </span>
            {l.deepLink ? (
              <Link to={l.deepLink} className="ml-2 text-brand underline-offset-2 hover:underline">
                otvori
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
