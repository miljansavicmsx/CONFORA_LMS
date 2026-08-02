import { Link } from "react-router";
import type { JSX } from "react";

import { EnterpriseSectionHeader } from "@/design-system";
import type { KnowledgeEvidence, KnowledgeRegistryClause } from "@/lib/knowledge/knowledge-types";
import { evidenceChannelsForFacet } from "@/lib/knowledge/knowledge-evidence";

export function EvidenceCoveragePanel({
  channels,
  clause,
}: {
  readonly channels: readonly KnowledgeEvidence[];
  readonly clause: KnowledgeRegistryClause | undefined;
}): JSX.Element {
  const list = clause ? evidenceChannelsForFacet(clause.facets[0] ?? "general") : channels;

  return (
    <div className="rounded-2xl border border-border/50 bg-surface-primary/20 p-4">
      <EnterpriseSectionHeader title="Evidence kanali" description="Mapiranje na domene klauzule (orchestration)." />
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {list.map((ch) => (
          <li key={ch.id} className="rounded-lg border border-border/40 px-3 py-2 text-sm">
            <p className="font-semibold text-text-primary">{ch.label}</p>
            <p className="text-[11px] text-text-muted">{ch.entityKinds.join(", ")}</p>
            {ch.routeHint ? (
              <Link to={ch.routeHint} className="mt-1 inline-block text-xs text-brand hover:underline">
                Otvori modul
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
