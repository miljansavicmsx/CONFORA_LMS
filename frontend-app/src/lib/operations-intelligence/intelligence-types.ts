/**
 * Operations intelligence — canonical types for the executive control tower (frontend inference only).
 */

export type HealthBand = "excellent" | "healthy" | "warning" | "critical";

export type AlertSeverity = "info" | "warning" | "critical";

/** Flattened signals distilled from `DashboardContextPayload` (+ optional CB supplement). */
export type IntelligenceInput = {
  readonly capaOverdue: number;
  readonly capaOpen: number;
  readonly capaCriticalOpen: number;
  readonly riskOverdueReviews: number;
  readonly riskOpenHighCritical: number;
  readonly openComplaints: number;
  readonly openAppeals: number;
  readonly managementReviewOverdueActions: number;
  readonly managementReviewPendingApproval: number;
  readonly managementReviewOpenCycles: number;
  readonly competenceProfilesDueValidity: number;
  readonly impartialityOpenThreats: number;
  readonly impartialityOverdueReviews: number;
  /** Certification committee — queue pressure */
  readonly applicationsPendingQueue: number;
  readonly applicationsInReview: number;
  readonly decisionsQuorumPending: number;
  readonly decisionsOpen: number;
  /** Training / platform */
  readonly pendingSupportTickets: number;
  readonly learnersReadyForExam: number;
  /** Sys admin / observability */
  readonly auditEventsRecent: number;
  readonly auditSensitiveFlags: number;
  /** Supplementary CB rows (governance hub) */
  readonly cbCapaRecords: number;
  readonly cbOpenFindings: number;
  readonly cbOpenImpartiality: number;
};

export type HealthFactor = {
  readonly id: string;
  readonly label: string;
  readonly penalty: number;
  readonly detail: string;
};

export type GovernanceHealthResult = {
  readonly band: HealthBand;
  /** 0–100, higher is healthier */
  readonly score: number;
  readonly factors: readonly HealthFactor[];
  readonly narrative: string;
};

export type ExecutiveAlert = {
  readonly id: string;
  readonly severity: AlertSeverity;
  readonly title: string;
  readonly detail: string;
  readonly metric?: string;
  readonly route?: string;
};

export type TrendPoint = { readonly t: string; readonly v: number };

export type TrendSeries = {
  readonly id: string;
  readonly label: string;
  readonly points: readonly TrendPoint[];
};

export type WorkloadRoleSlice = {
  readonly roleId:
    | "cert_committee"
    | "quality_manager"
    | "auditor"
    | "training_admin"
    | "sys_admin";
  readonly label: string;
  readonly queueSize: number;
  readonly overdue: number;
  /** 0–1 synthetic saturation */
  readonly saturation: number;
  readonly avgCompletionHint: string;
};

export type WorkflowInsight = {
  readonly id: string;
  readonly severity: AlertSeverity;
  readonly title: string;
  readonly detail: string;
};

export type CrossModuleInsight = {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly severity: AlertSeverity;
};

export type IntelligenceRecommendation = {
  readonly id: string;
  readonly title: string;
  readonly rationale: string;
  /** 0–1 heuristički, nije ML model */
  readonly confidence: number;
  readonly actionRoute?: string;
};

export type GovernanceTimelineEvent = {
  readonly id: string;
  readonly at: string;
  readonly kind: string;
  readonly title: string;
  readonly detail?: string;
};

export type OperationalRiskProfile = {
  readonly complianceScore: number;
  readonly label: string;
  readonly drivers: readonly string[];
};

export type OperationsIntelligenceBundle = {
  readonly input: IntelligenceInput;
  readonly health: GovernanceHealthResult;
  readonly alerts: readonly ExecutiveAlert[];
  readonly trends: readonly TrendSeries[];
  readonly workload: readonly WorkloadRoleSlice[];
  readonly workflowInsights: readonly WorkflowInsight[];
  readonly crossModule: readonly CrossModuleInsight[];
  readonly recommendations: readonly IntelligenceRecommendation[];
  readonly timeline: readonly GovernanceTimelineEvent[];
  readonly risk: OperationalRiskProfile;
};
