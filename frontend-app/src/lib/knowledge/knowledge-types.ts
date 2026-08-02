/**
 * Standards & knowledge intelligence — frontend orchestration model (no regulatory engine).
 * Human-in-the-loop; all scores are heuristic / explainable.
 */

import type { RelationshipType } from "@/lib/entity-relationships/relationship-types";

/** Supported standards in the static registry (expand over time). */
export type KnowledgeStandardId =
  | "ISO17024"
  | "ISO17065"
  | "ISO9001"
  | "ISO27001"
  | "ISO56001"
  | "INTERNAL_GRC";

/** Facets for taxonomy & search (not ABAC resources). KnowledgeDomain is a logical facet string. */
export type KnowledgeFacetId =
  | "impartiality"
  | "competence"
  | "examination"
  | "certification_decision"
  | "surveillance"
  | "recertification"
  | "appeals"
  | "complaints"
  | "management_system"
  | "information_security"
  | "innovation_governance"
  | "general";

export interface KnowledgeDomain {
  readonly id: KnowledgeFacetId;
  readonly label: string;
  readonly labelBs: string;
  readonly description: string;
  readonly relatedFacets: readonly KnowledgeFacetId[];
}

/** Registry clause — clauseRef is a display reference (may be illustrative, not exhaustive norm text). */
export interface KnowledgeRegistryClause {
  readonly id: string;
  readonly standardId: KnowledgeStandardId;
  readonly clauseRef: string;
  readonly title: string;
  readonly summary: string;
  readonly facets: readonly KnowledgeFacetId[];
  readonly requirements: readonly string[];
  readonly controls: readonly string[];
  readonly evidenceGuidance: readonly string[];
  readonly auditGuidance: readonly string[];
  readonly workflowMappings: readonly { readonly route: string; readonly label: string }[];
  readonly governanceMappings: readonly string[];
  readonly relatedRisks: readonly string[];
  readonly capaTriggers: readonly string[];
}

/** Flattened atomic requirement row for matrices. */
export interface KnowledgeRequirement {
  readonly id: string;
  readonly clauseId: string;
  readonly standardId: KnowledgeStandardId;
  readonly text: string;
  readonly facet: KnowledgeFacetId;
  readonly weight: number;
}

export type KnowledgeEvidenceKind =
  | "audit_event"
  | "workflow_state"
  | "approval"
  | "competence_profile"
  | "capa"
  | "complaint"
  | "certificate"
  | "management_review"
  | "risk_register"
  | "document";

export interface KnowledgeEvidence {
  readonly id: string;
  readonly kind: KnowledgeEvidenceKind;
  readonly label: string;
  readonly clauseIds: readonly string[];
  readonly routeHint?: string;
  readonly entityKinds: readonly string[];
}

export type KnowledgeRelationshipEndpointKind = "clause" | "entity_kind" | "workflow" | "facet";

export interface KnowledgeRelationship {
  readonly id: string;
  readonly sourceKind: KnowledgeRelationshipEndpointKind;
  readonly sourceId: string;
  readonly targetKind: KnowledgeRelationshipEndpointKind;
  readonly targetId: string;
  readonly relationshipType: RelationshipType;
  readonly label: string;
  readonly explainHint: string;
}

export type CoverageBand = "strong" | "medium" | "weak" | "unknown";

export interface KnowledgeExplainableRecommendation {
  readonly id: string;
  readonly title: string;
  readonly explanation: string;
  readonly confidence: number;
  readonly confidenceBand: "low" | "medium" | "high";
  readonly evidenceBasis: readonly string[];
  readonly governanceBasis: readonly string[];
  readonly auditBasis: readonly string[];
  readonly relatedStandards: readonly KnowledgeStandardId[];
  readonly relatedClauseRefs: readonly string[];
  readonly humanReviewRequired: true;
}

export interface KnowledgeWorkspaceTelemetry {
  readonly coverageDensity: number;
  readonly orphanRequirements: number;
  readonly orphanEvidence: number;
  readonly unresolvedRelationships: number;
  readonly governanceBlindSpots: number;
  readonly weakAuditTraceability: number;
  readonly weakEvidenceConfidence: number;
}

export type KnowledgeInsightSeverity = "info" | "warning" | "critical";

export type KnowledgeInsight = {
  readonly id: string;
  readonly severity: KnowledgeInsightSeverity;
  readonly title: string;
  readonly detail: string;
  readonly actionRoute?: string;
};

export interface KnowledgeWorkspaceBundle {
  readonly clauses: readonly KnowledgeRegistryClause[];
  readonly requirements: readonly KnowledgeRequirement[];
  readonly relationships: readonly KnowledgeRelationship[];
  readonly evidenceChannels: readonly KnowledgeEvidence[];
  readonly ariaSummary: string;
  readonly graphTelemetry?: KnowledgeWorkspaceTelemetry;
  readonly insights?: readonly KnowledgeInsight[];
}
