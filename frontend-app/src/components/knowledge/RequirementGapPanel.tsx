import type { JSX } from "react";

import { EnterpriseSectionHeader } from "@/design-system";
import type { AuditReadinessBundle } from "@/lib/audit-readiness";
import type { KnowledgeWorkspaceTelemetry } from "@/lib/knowledge/knowledge-types";

export function RequirementGapPanel({
  graphTelemetry,
  readiness,
}: {
  readonly graphTelemetry: KnowledgeWorkspaceTelemetry;
  readonly readiness: AuditReadinessBundle;
}): JSX.Element {
  return (
    <div className="rounded-2xl border border-border/50 bg-surface-primary/20 p-4">
      <EnterpriseSectionHeader title="Gap signali" description="Kombinacija grafa i audit readiness (heuristika)." titleLevel="h3" />
      <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-text-secondary">
        {graphTelemetry.orphanEvidence > 0 ? <li>Orphan evidence kanali: {graphTelemetry.orphanEvidence}</li> : null}
        {graphTelemetry.unresolvedRelationships > 0 ? <li>Nerazriješeni odnosi: {graphTelemetry.unresolvedRelationships}</li> : null}
        {graphTelemetry.governanceBlindSpots > 0 ? <li>Governance sljepa mjesta: {graphTelemetry.governanceBlindSpots}</li> : null}
        {readiness.topBlockers.slice(0, 4).map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
