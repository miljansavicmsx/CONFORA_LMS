import type { JSX } from "react";

import { EntityKind, type EntityRelationshipEdge } from "@/lib/entity-relationships";

export type EntityLineagePanelProps = {
  readonly centerId: string;
  readonly centerType: EntityKind;
  readonly centerLabel: string;
  readonly edges: readonly EntityRelationshipEdge[];
  readonly maxGraphNodes?: number;
};

/** Read-only diagram for explaining relationships; it does not query or alter records. */
export function EntityLineagePanel({
  centerId,
  centerType,
  centerLabel,
  edges,
  maxGraphNodes = 7,
}: EntityLineagePanelProps): JSX.Element {
  const visibleEdges = edges.slice(0, Math.max(0, maxGraphNodes - 1));

  return (
    <section aria-label="Trust relationship explanation" className="space-y-3" data-testid="entity-lineage-panel">
      <p className="rounded-md border border-border/50 bg-surface-primary px-3 py-2 text-sm font-medium text-text-primary">
        {centerLabel} <span className="text-xs font-normal text-text-muted">({centerType})</span>
      </p>
      <ul className="space-y-2 text-xs text-text-secondary">
        {visibleEdges.map((edge) => (
          <li key={`${centerId}-${edge.sourceId}-${edge.targetId}`} className="rounded-md border border-border/40 px-3 py-2">
            <span className="font-medium text-text-primary">{edge.sourceLabel}</span> {edge.relationshipLabel}{" "}
            <span className="font-medium text-text-primary">{edge.targetLabel}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
