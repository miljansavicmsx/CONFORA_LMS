import { type JSX, useMemo } from "react";

import type { EvidenceChannelMapping } from "@/lib/compliance";
import { Link } from "react-router";

export function EvidenceCoveragePanel({ mappings }: { readonly mappings: readonly EvidenceChannelMapping[] }): JSX.Element {
  const summary = useMemo(
    () => mappings.map((m) => `${m.label} → ${m.domains.join(", ")}`).join("; "),
    [mappings],
  );

  return (
    <section aria-label="Mapiranje dokaza" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Evidence coverage</p>
      <p className="sr-only">{summary}</p>
      <ul className="mt-3 space-y-2 text-xs">
        {mappings.map((m) => (
          <li key={m.channelId} className="rounded-xl border border-border/35 bg-surface-primary/50 px-3 py-2">
            <p className="font-medium text-text-primary">{m.label}</p>
            <p className="mt-1 text-text-muted">Domene: {m.domains.join(", ")}</p>
            <p className="mt-1 font-mono text-[10px] text-text-muted">{m.entityKinds.join(", ")}</p>
            {m.routeHint ? (
              <Link to={m.routeHint} className="mt-2 inline-block text-[11px] font-medium text-brand underline-offset-2 hover:underline">
                Otvori lanac →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
