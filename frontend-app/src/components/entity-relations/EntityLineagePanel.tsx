import { type JSX } from "react";

import type { EntityRelationship } from "@/lib/entity-relationships/relationship-types";

import { EntityRelationshipGraph } from "./EntityRelationshipGraph";
import { EntityRelationshipList } from "./EntityRelationshipList";
import { GovernanceImpactPanel } from "./GovernanceImpactPanel";

export function EntityLineagePanel({
  centerId,
  centerType,
  centerLabel,
  edges,
  maxGraphNodes,
}: {
  readonly centerId: string;
  readonly centerType: string;
  readonly centerLabel?: string;
  readonly edges: readonly EntityRelationship[];
  readonly maxGraphNodes?: number;
}): JSX.Element {
  return (
    <div className="space-y-6">
      <GovernanceImpactPanel edges={edges} />
      <EntityRelationshipGraph
        centerId={centerId}
        centerType={centerType}
        {...(centerLabel ? { centerLabel } : {})}
        edges={edges}
        {...(maxGraphNodes !== undefined ? { maxNodes: maxGraphNodes } : {})}
      />
      <EntityRelationshipList centerId={centerId} centerType={centerType} edges={edges} />
    </div>
  );
}
