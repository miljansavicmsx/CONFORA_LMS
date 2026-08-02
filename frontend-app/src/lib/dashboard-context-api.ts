import { api } from "@/lib/api";

export const DASHBOARD_CONTEXT_QUERY_KEY = ["dashboard", "context"] as const;

export type DashboardPersona =
  | "candidate"
  | "training_admin"
  | "technical_committee"
  | "certification_committee"
  | "appeals_committee"
  | "iso_governance"
  | "director"
  | "sys_admin"
  | "unknown";

export type LearnerDashboardJson = {
  readonly heroSubtitle: string;
  readonly overallProgressPct: number;
  readonly continueCourseId: string;
  readonly stats: {
    readonly activeCourses: number;
    readonly totalCourses: number;
    readonly weekLearningLabel: string;
    readonly certificatesCount: number;
    readonly lastCertificateLabel: string;
    readonly lastExamResultLabel?: string;
    readonly avgScorePct: number;
    readonly trendActive: "up" | "down";
    readonly trendWeek: "up" | "down";
    readonly trendCerts: "up" | "down";
    readonly trendScore: "up" | "down";
  };
  readonly activities: readonly {
    readonly id: string;
    readonly kind: string;
    readonly title: string;
    readonly courseTag: string;
    readonly timeLabel: string;
    readonly detail?: string;
  }[];
};

export type CandidateDashboardPayload = {
  readonly learner: LearnerDashboardJson;
  readonly platformInfo: string;
  readonly reminders: readonly {
    readonly id: string;
    readonly message: string;
    readonly severity: "info" | "warning";
  }[];
  readonly examStatus: {
    readonly passedCourses: number;
    readonly failedOrIncomplete: number;
    readonly lastExamLabel: string;
  };
  readonly certificateKinds: {
    readonly examPassIssued: number;
    readonly examPassActive: number;
    readonly certificationIssued: number;
    readonly certificationActive: number;
  };
  readonly certificationPipeline: {
    readonly applicationStatus: string;
    readonly applicationId: string | null;
    readonly decisionStatus: string;
    readonly decisionId: string | null;
  };
  readonly notifications: readonly {
    readonly id: string;
    readonly title: string;
    readonly body: string;
    readonly createdAt: string;
  }[];
  readonly nextAction: {
    readonly label: string;
    readonly href: string;
    readonly reason: string;
  };
};

export type TrainingAdminDashboardPayload = {
  readonly coursesTotal: number;
  readonly coursesPublished: number;
  readonly pendingPublishDrafts: number;
  readonly coursesPendingContent: number;
  readonly coursesPendingValidation: number;
  readonly activeLearners: number;
  readonly enrollmentsCompleted: number;
  readonly enrollmentsActive: number;
  readonly learnersReadyForExam: number;
  readonly pendingSupportTickets: number;
  readonly revenuePaidTotalEur: number;
  readonly unpaidInvoices: number;
};

export type TechnicalCommitteeDashboardPayload = {
  readonly coursesPendingValidation: number;
  readonly itemBankDraftAi: number;
  readonly itemBankTotalSampled: number;
  readonly coiReminder: string;
};

export type CertificationCommitteeDashboardPayload = {
  readonly applicationsPendingQueue: number;
  readonly applicationsInReview: number;
  readonly applicationsEligible: number;
  readonly decisionsOpen: number;
  readonly decisionsReviewStarted: number;
  readonly decisionsTodayTotal: number;
  readonly decisionsTodayApproved: number;
  readonly decisionsTodayRejected: number;
  readonly decisionsCoiIncomplete: number;
  readonly decisionsQuorumPending: number;
  readonly coiReminder: string;
};

export type AppealsCommitteeDashboardPayload = {
  readonly openAppeals: number;
  readonly openComplaints: number;
  readonly oldestOpenAppealDays: number;
  readonly oldestOpenComplaintDays: number;
  readonly agingSamples: readonly {
    readonly id: string;
    readonly label: string;
    readonly daysOpen: number;
  }[];
};

export type DirectorDashboardPayload = {
  readonly governanceOverdue: number;
  readonly governanceOpenEthics: number;
  readonly examPassCertificatesIssued: number;
  readonly personCertificationsIssued: number;
  readonly certificatesTotalSampled: number;
  readonly suspensionsRevocations: number;
  readonly revenuePaidTotalEur: number;
  readonly certificatesTrendLabel: string;
  readonly strategicRisksPlaceholder: string;
  readonly governanceAlerts: readonly string[];
  readonly capaOpenNonconformities?: number;
  readonly capaOverdue?: number;
  readonly capaClosureRateLabel?: string;
  readonly governanceRiskTrendLabel?: string;
  readonly riskAcceptedCritical?: number;
  readonly riskGovernanceExposureLabel?: string;
  readonly riskReductionTrendLabel?: string;
};

export type IsoGovernanceDashboardPayload = {
  readonly activeCertificates: number;
  readonly openAppeals: number;
  readonly openComplaints: number;
  readonly openGovernanceCases: number;
  readonly capaOpenNonconformities?: number;
  readonly capaOverdue?: number;
  readonly capaCriticalOpen?: number;
  readonly capaEffectivenessTrendLabel?: string;
  readonly riskOpenHighCritical?: number;
  readonly riskOverdueReviews?: number;
  readonly riskMitigationTrendLabel?: string;
  readonly impartialityOpenThreats?: number;
  readonly impartialityOverdueReviews?: number;
  readonly impartialityActiveDeclarations?: number;
  readonly managementReviewOpenCycles?: number;
  readonly managementReviewPendingApproval?: number;
  readonly managementReviewOverdueActions?: number;
  readonly managementReviewEffectivenessSampleLabel?: string;
  readonly competenceProfilesDueValidity?: number;
  readonly competenceValiditySummaryLabel?: string;
  readonly note: string;
};

export type SysAdminDashboardPayload = {
  readonly usersSampled: number;
  readonly tenantsActive: number;
  readonly roleDistribution: Readonly<Record<string, number>>;
  readonly auditEventsRecent: number;
  readonly auditSensitiveFlags: number;
  readonly verificationHits24h: number;
  readonly jobStatusLabel: string;
  readonly integrationStatusLabel: string;
  readonly apiStatus: string;
};

export type DashboardContextPayload = {
  readonly persona: DashboardPersona;
  readonly role: string;
  /** ISO/IEC 17024 uloga (slug); 'unknown' ako nema mape s CONFORA primarne uloge. */
  readonly isoRole: string;
  readonly isoRoleLabel: string;
  readonly candidate?: CandidateDashboardPayload | null;
  readonly trainingAdmin?: TrainingAdminDashboardPayload | null;
  readonly technicalCommittee?: TechnicalCommitteeDashboardPayload | null;
  readonly certificationCommittee?: CertificationCommitteeDashboardPayload | null;
  readonly appealsCommittee?: AppealsCommitteeDashboardPayload | null;
  readonly isoGovernance?: IsoGovernanceDashboardPayload | null;
  readonly director?: DirectorDashboardPayload | null;
  readonly sysAdmin?: SysAdminDashboardPayload | null;
};

export async function fetchDashboardContext(): Promise<DashboardContextPayload> {
  const { data } = await api.get<DashboardContextPayload>("/api/dashboard/context");
  return {
    ...data,
    isoRole: data.isoRole ?? "unknown",
    isoRoleLabel: data.isoRoleLabel ?? "Nepoznato",
  };
}
