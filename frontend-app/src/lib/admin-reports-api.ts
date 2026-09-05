import {
  getCertificationApplicationsBySchemeRef,
  getCertificationApplicationsByStatus,
  type CertificationApplicationsBySchemeRefResult,
  type CertificationApplicationsByStatusResult,
  type CertificationApplicationsReportQuery,
  type SchemeGroupCell,
  type StatusGroupCell,
} from "@/lib/api/reports-client";

/** Retained for admin-gov-ux-labels type import (no active dashboard summary fetch). */
export type ChartDataRow = { readonly label: string; readonly value: number };

/** Retained for admin-gov-ux-labels createAdminPilotEmptyDashboardSummary typing only. */
export type AdminDashboardSummary = {
  readonly generatedAt: string;
  readonly readOnly: true;
  readonly syntheticLocalPilot: true;
  readonly education: {
    readonly courseCount: number;
    readonly enrolmentCount: number;
    readonly completionCount: number;
    readonly publicCourseCount: number;
    readonly completionRate: number;
    readonly enrolmentByStatus: Readonly<Record<string, number>>;
  };
  readonly certification: {
    readonly applicationsByStatus: Readonly<Record<string, number>>;
    readonly decisionsByOutcome: Readonly<Record<string, number>>;
    readonly decisionsRecorded: number;
    readonly decisionsPending: number;
    readonly certificatesByStatus: Readonly<Record<string, number>>;
    readonly issuedCount: number;
    readonly publicVerificationCount: number;
    readonly quorumEvidence: {
      readonly decisionsWithQuorumConfirmed: number;
      readonly reviewsInProgress: number;
      readonly requiredQuorumDefault: number;
    };
  };
  readonly identity: {
    readonly reviewQueueCount: number;
    readonly verifiedCount: number;
    readonly rejectedCount: number;
    readonly manualNonBiometric: true;
  };
  readonly audit: {
    readonly totalEventCount: number;
    readonly educationEventCount: number;
    readonly certificationEventCount: number;
    readonly identityEventCount: number;
    readonly governanceEventCount: number;
    readonly reportExportCount: number;
  };
  readonly evidence: {
    readonly documentPreviewCount: number;
    readonly educationCompletionCertificateCount: number;
  };
  readonly system: {
    readonly activeLocalDemoSurface: true;
    readonly knownNonBlockingGaps: readonly string[];
  };
  readonly chartData: {
    readonly certificationApplicationsByStatus: readonly ChartDataRow[];
    readonly certificationDecisionsByOutcome: readonly ChartDataRow[];
    readonly certificateLifecycleByStatus: readonly ChartDataRow[];
    readonly educationEnrolmentByStatus: readonly ChartDataRow[];
    readonly learnerProgressDistribution: readonly ChartDataRow[];
    readonly reportExportActivity: readonly ChartDataRow[];
    readonly auditActivityByDomain: readonly ChartDataRow[];
  };
  readonly boundaryNote: string;
};

/** Frontend-static T026 catalog — exactly two P08 aggregate views. */
export const T026_REPORT_CATALOG = [
  { id: "by-status", view: "by-status" },
  { id: "by-scheme-ref", view: "by-scheme-ref" },
] as const;

export type T026ReportViewId = (typeof T026_REPORT_CATALOG)[number]["id"];

export const T026_SMALL_CELL_THRESHOLD = 5;

export type AdminReportsFilterInput = CertificationApplicationsReportQuery;

export type AdminReportsLoadResult =
  | { readonly view: "by-status"; readonly data: CertificationApplicationsByStatusResult }
  | { readonly view: "by-scheme-ref"; readonly data: CertificationApplicationsBySchemeRefResult };

/** Load exactly one of the two approved aggregate views. */
export async function loadAdminCertificationApplicationsReport(
  view: T026ReportViewId,
  filters: AdminReportsFilterInput,
): Promise<AdminReportsLoadResult> {
  if (view === "by-status") {
    const data = await getCertificationApplicationsByStatus(filters);
    return { view, data };
  }
  const data = await getCertificationApplicationsBySchemeRef(filters);
  return { view, data };
}

/**
 * Display helper for P08 small-cell privacy.
 * suppressed → never rematerialize; count 0 → exact zero; count >=5 → exact.
 */
export function formatAggregateCountLabel(
  cell: StatusGroupCell | SchemeGroupCell,
  suppressedLabel: string,
): string {
  if (cell.suppressed) {
    return suppressedLabel;
  }
  return String(cell.count);
}

/** True when backend omitted total (must remain omitted — no rematerialization). */
export function isTotalOmitted(result: {
  readonly total?: number;
  readonly groups?: unknown;
}): boolean {
  return !Object.prototype.hasOwnProperty.call(result, "total") || result.total === undefined;
}
