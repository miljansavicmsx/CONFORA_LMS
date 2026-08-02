import type { ReactNode } from "react";

import { DisclosureSection } from "./DisclosureSection";

export type ProgressivePanelProps = {
  readonly summary: ReactNode;
  readonly insight: ReactNode;
  readonly detail?: ReactNode;
  readonly traceability?: ReactNode;
  readonly evidence?: ReactNode;
  readonly auditLineage?: ReactNode;
  readonly className?: string;
};

/**
 * Standardni enterprise disclosure ladder: SUMMARY → … → AUDIT_LINEAGE (Phase H).
 */
export function ProgressivePanel({
  summary,
  insight,
  detail,
  traceability,
  evidence,
  auditLineage,
  className,
}: ProgressivePanelProps): ReactNode {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <DisclosureSection level="SUMMARY" defaultOpen>
        {summary}
      </DisclosureSection>
      <DisclosureSection level="INSIGHT" defaultOpen>
        {insight}
      </DisclosureSection>
      {detail ? <DisclosureSection level="DETAIL">{detail}</DisclosureSection> : null}
      {traceability ? <DisclosureSection level="TRACEABILITY">{traceability}</DisclosureSection> : null}
      {evidence ? <DisclosureSection level="EVIDENCE">{evidence}</DisclosureSection> : null}
      {auditLineage ? <DisclosureSection level="AUDIT_LINEAGE">{auditLineage}</DisclosureSection> : null}
    </div>
  );
}
