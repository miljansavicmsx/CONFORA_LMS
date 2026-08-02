import type { TwinNormalizedInput } from "@/lib/digital-twin/twin-types";

/** Heuristički snimak operativa — usklađen s digital twin normalizacijom. */
export type ComplianceHeuristicSnapshot = TwinNormalizedInput;

export type FrameworkId =
  | "ISO17024"
  | "ISO17065"
  | "ISO17021"
  | "ISO9001"
  | "ISO27001"
  | "WCAG_GOV"
  | "INTERNAL_GRC";

export type GovernanceDomain =
  | "competence"
  | "impartiality"
  | "certification"
  | "complaints"
  | "governance"
  | "traceability"
  | "workflows"
  | "auditability"
  | "information_security"
  | "quality_ms"
  | "accessibility";

export type CoverageTier = "covered" | "partial" | "missing" | "needs_review";

export type AuditReadinessTier = "ready" | "partial" | "warning" | "critical";

export type ComplianceMaturityLevel = "ad_hoc" | "managed" | "controlled" | "optimized";

export interface RequirementGroup {
  readonly id: string;
  readonly frameworkId: FrameworkId;
  readonly label: string;
  readonly clauseRef: string;
  readonly domains: readonly GovernanceDomain[];
  readonly evidenceHints: readonly string[];
}

export interface ComplianceRequirement {
  readonly id: string;
  readonly groupId: string;
  readonly frameworkId: FrameworkId;
  readonly title: string;
  readonly clauseRef: string;
  readonly domains: readonly GovernanceDomain[];
  readonly weight: number;
}

export interface RequirementCoverageRow {
  readonly requirementId: string;
  readonly title: string;
  readonly clauseRef: string;
  readonly frameworkId: FrameworkId;
  readonly tier: CoverageTier;
  readonly score: number;
  readonly rationale: string;
}

export interface EvidenceChannelMapping {
  readonly channelId: string;
  readonly label: string;
  readonly entityKinds: readonly string[];
  readonly domains: readonly GovernanceDomain[];
  readonly routeHint?: string;
}

export interface ComplianceGap {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly severity: "info" | "warning" | "critical";
  readonly domain: GovernanceDomain;
  readonly actionRoute?: string;
}

export interface DomainReadiness {
  readonly domain: GovernanceDomain;
  readonly tier: AuditReadinessTier;
  readonly score: number;
  readonly narrative: string;
}

export interface AccreditationExposureItem {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly tier: AuditReadinessTier;
  readonly hint: string;
}

export interface ComplianceControl {
  readonly id: string;
  readonly label: string;
  readonly domain: GovernanceDomain;
  readonly description: string;
}

export interface ComplianceTelemetrySlice {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly hint: string;
}

export interface ComplianceMaturityResult {
  readonly level: ComplianceMaturityLevel;
  readonly score: number;
  readonly narrative: string;
}

export interface TraceabilityLink {
  readonly requirementId: string;
  readonly relationshipType: string;
  readonly targetKind: string;
  readonly targetLabel: string;
  readonly deepLink?: string;
}

export interface ComplianceOperatingBundle {
  readonly snapshot: ComplianceHeuristicSnapshot;
  readonly coverageRows: readonly RequirementCoverageRow[];
  readonly gaps: readonly ComplianceGap[];
  readonly domainReadiness: readonly DomainReadiness[];
  readonly accreditationExposure: readonly AccreditationExposureItem[];
  readonly maturity: ComplianceMaturityResult;
  readonly controls: readonly ComplianceControl[];
  readonly evidenceMappings: readonly EvidenceChannelMapping[];
  readonly telemetry: readonly ComplianceTelemetrySlice[];
  readonly traceability: readonly TraceabilityLink[];
  readonly ariaSummary: string;
}

export interface ComplianceBuildOptions {
  readonly governanceDocumentCount: number;
  readonly internalAuditRecords: number;
  readonly openAuditFindings: number;
}
