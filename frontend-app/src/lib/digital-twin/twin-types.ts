import type { DashboardContextPayload } from "@/lib/dashboard-context-api";
import type { GovernanceCommitteeRow } from "@/lib/api-governance";

/** Funkcionalni slojevi certifikacionog tijela (topologija). */
export type TwinFunctionalRoleId =
  | "certification_committee"
  | "appeals_committee"
  | "impartiality_committee"
  | "quality_management"
  | "auditors"
  | "training_administration"
  | "system_administration";

export type TopologyLinkKind = "owns" | "depends_on" | "escalates_to" | "supports" | "audits";

export type ReadinessStatus = "ready" | "warning" | "critical";

export type MaturityLevel = "reactive" | "managed" | "controlled" | "optimized";

export type ResilienceSeverity = "info" | "warning" | "critical";

export type TwinHealthBand = "excellent" | "healthy" | "watch" | "critical";

export interface TopologyNodePosition {
  readonly xPct: number;
  readonly yPct: number;
}

export interface OrganizationalTopologyNode {
  readonly id: TwinFunctionalRoleId | string;
  readonly label: string;
  readonly role: TwinFunctionalRoleId | "committee_instance";
  readonly description: string;
  /** Vlasništvo / mandat (kratko). */
  readonly ownershipHint: string;
  readonly workloadHint: string;
  readonly position: TopologyNodePosition;
  readonly committeeId?: string;
  readonly memberCount?: number;
}

export interface TopologyEdge {
  readonly from: string;
  readonly to: string;
  readonly kind: TopologyLinkKind;
  readonly label: string;
}

export interface EscalationPath {
  readonly id: string;
  readonly steps: readonly string[];
  readonly context: string;
}

export interface AccreditationPillar {
  readonly id: string;
  readonly label: string;
  readonly standardRef: string;
  readonly status: ReadinessStatus;
  readonly score: number;
  readonly detail: string;
}

export interface GovernanceMaturityResult {
  readonly level: MaturityLevel;
  readonly score: number;
  readonly narrative: string;
  readonly drivers: readonly { readonly id: string; readonly label: string; readonly contribution: number }[];
}

export interface ResilienceSignal {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly severity: ResilienceSeverity;
}

export interface CommitteeCapacityRow {
  readonly committeeId: string;
  readonly name: string;
  readonly committeeType: string;
  readonly activeWorkloadProxy: number;
  readonly overdueLoadProxy: number;
  readonly reviewVelocityHint: string;
  readonly concentrationRisk: ReadinessStatus;
  readonly reviewerSpread: number;
  readonly saturation: number;
}

export interface GovernanceExposureSlice {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly status: ReadinessStatus;
  readonly hint: string;
}

export interface DigitalTwinInsight {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly tone: "positive" | "neutral" | "concern";
}

export interface TwinNormalizedInput {
  readonly capaOverdue: number;
  readonly capaOpen: number;
  readonly riskOverdueReviews: number;
  readonly riskOpenHighCritical: number;
  readonly openComplaints: number;
  readonly openAppeals: number;
  readonly managementReviewOverdueActions: number;
  readonly managementReviewPendingApproval: number;
  readonly competenceDue: number;
  readonly impartialityThreats: number;
  readonly impartialityReviewsOverdue: number;
  readonly certQueue: number;
  readonly certInReview: number;
  readonly decisionsOpen: number;
  readonly quorumPending: number;
  readonly coiIncomplete: number;
  readonly openGovernanceCases: number;
  readonly trainingBacklog: number;
  readonly auditEventsRecent: number;
  readonly auditSensitiveFlags: number;
  readonly documentCount: number;
  readonly internalAuditRecords: number;
  readonly openAuditFindings: number;
  readonly committeeCount: number;
  readonly singleMemberCommittees: number;
  readonly technicalValidationBacklog: number;
}

export interface TwinBuildInput {
  readonly ctx: DashboardContextPayload;
  readonly committees: readonly GovernanceCommitteeRow[];
  readonly governanceDocumentCount: number;
  readonly internalAuditRecords: number;
  readonly openAuditFindings: number;
}

export interface DigitalTwinHealth {
  readonly band: TwinHealthBand;
  readonly score: number;
  readonly summary: string;
}

export interface DigitalTwinBundle {
  readonly input: TwinNormalizedInput;
  readonly topology: {
    readonly nodes: readonly OrganizationalTopologyNode[];
    readonly edges: readonly TopologyEdge[];
    readonly escalations: readonly EscalationPath[];
  };
  readonly accreditation: {
    readonly pillars: readonly AccreditationPillar[];
    readonly aggregateStatus: ReadinessStatus;
  };
  readonly maturity: GovernanceMaturityResult;
  readonly resilience: {
    readonly signals: readonly ResilienceSignal[];
    readonly aggregateSeverity: ResilienceSeverity;
  };
  readonly capacity: readonly CommitteeCapacityRow[];
  readonly exposure: readonly GovernanceExposureSlice[];
  readonly insights: readonly DigitalTwinInsight[];
  readonly health: DigitalTwinHealth;
}

export interface TwinAriaContext {
  readonly summary: string;
}
