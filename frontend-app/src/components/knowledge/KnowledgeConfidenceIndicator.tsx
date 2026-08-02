import type { JSX } from "react";

import { computeConfidence } from "@/lib/knowledge/knowledge-confidence";
import type { KnowledgeFacetId, KnowledgeRegistryClause } from "@/lib/knowledge/knowledge-types";
import type { TwinNormalizedInput } from "@/lib/digital-twin/twin-types";

export function KnowledgeConfidenceIndicator({
  facet,
  snapshot,
  clause,
}: {
  readonly facet: KnowledgeFacetId;
  readonly snapshot: TwinNormalizedInput;
  readonly clause: KnowledgeRegistryClause;
}): JSX.Element {
  const c = computeConfidence(facet, snapshot, clause);
  return (
    <div className="rounded-lg border border-border/40 bg-surface-secondary/40 px-3 py-2 text-xs text-text-secondary">
      <p className="font-semibold text-text-primary">Confidence (explainable)</p>
      <p className="tabular-nums text-lg font-bold text-brand">{c.score}%</p>
      <p>{c.rationale}</p>
    </div>
  );
}
