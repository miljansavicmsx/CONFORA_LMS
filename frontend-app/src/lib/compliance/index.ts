import type { DashboardContextPayload } from "@/lib/dashboard-context-api";
import type { GovernanceCommitteeRow } from "@/lib/api-governance";

import { normalizeTwinInput } from "@/lib/digital-twin/twin-governance";

import { COMPLIANCE_CONTROLS } from "./compliance-controls";
import { computeAllRequirementCoverage } from "./compliance-coverage";
import { EVIDENCE_CHANNEL_MAPPINGS } from "./compliance-evidence";
import { detectComplianceGaps } from "./compliance-gaps";
import { computeComplianceMaturity } from "./compliance-maturity";
import { buildAccreditationExposure, buildComplianceTelemetry } from "./compliance-observability";
import { computeAllDomainReadiness } from "./compliance-readiness";
import { buildAllTraceability, buildComplianceRequirements } from "./compliance-requirements";
import type { ComplianceBuildOptions, ComplianceOperatingBundle, ComplianceHeuristicSnapshot } from "./compliance-types";

export function buildComplianceOperatingBundle(
  ctx: DashboardContextPayload,
  committees: readonly GovernanceCommitteeRow[],
  options: ComplianceBuildOptions,
): ComplianceOperatingBundle {
  const snapshot: ComplianceHeuristicSnapshot = normalizeTwinInput(
    ctx,
    committees,
    options.governanceDocumentCount,
    options.internalAuditRecords,
    options.openAuditFindings,
  );

  const requirements = buildComplianceRequirements();
  const coverageRows = computeAllRequirementCoverage(requirements, snapshot, options.governanceDocumentCount);
  const gaps = detectComplianceGaps(snapshot, options.governanceDocumentCount);
  const domainReadiness = computeAllDomainReadiness(snapshot, options.governanceDocumentCount);
  const accreditationExposure = buildAccreditationExposure(snapshot);
  const maturity = computeComplianceMaturity(snapshot, options.governanceDocumentCount);
  const telemetry = buildComplianceTelemetry(snapshot);
  const traceability = buildAllTraceability(requirements, snapshot);

  const ariaSummary = [
    `Compliance orchestration snapshot: CAPA preko roka ${snapshot.capaOverdue}, pritužbe ${snapshot.openComplaints}.`,
    `Maturity ${maturity.level}, skor ${maturity.score}.`,
    `Gaps detektirano: ${gaps.length}.`,
    coverageRows.filter((c) => c.tier === "missing" || c.tier === "needs_review").length
      ? "Postoje zahtjevi s pokrivenošću koja traži pregled."
      : "Pokrivenost zahtjeva bez kritičnih missing stanja u heuristici.",
  ].join(" ");

  return {
    snapshot,
    coverageRows,
    gaps,
    domainReadiness,
    accreditationExposure,
    maturity,
    controls: COMPLIANCE_CONTROLS,
    evidenceMappings: EVIDENCE_CHANNEL_MAPPINGS,
    telemetry,
    traceability,
    ariaSummary,
  };
}

export * from "./compliance-types";
export { COMPLIANCE_FRAMEWORK_LABEL, REQUIREMENT_GROUPS, groupsByFramework, listFrameworkIds } from "./compliance-frameworks";
export {
  buildComplianceRequirements,
  requirementsForFramework,
  requirementById,
  buildRequirementTraceability,
  buildAllTraceability,
} from "./compliance-requirements";
export { EVIDENCE_CHANNEL_MAPPINGS, channelsForDomain } from "./compliance-evidence";
export { computeRequirementCoverage, computeAllRequirementCoverage } from "./compliance-coverage";
export { detectComplianceGaps } from "./compliance-gaps";
export { computeDomainReadiness, computeAllDomainReadiness } from "./compliance-readiness";
export { COMPLIANCE_CONTROLS, controlsForDomain } from "./compliance-controls";
export { computeComplianceMaturity } from "./compliance-maturity";
export { buildAccreditationExposure, buildComplianceTelemetry } from "./compliance-observability";
