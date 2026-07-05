import { api } from "@/lib/api";
import {
  exportReport,
  getAuditReport,
  getCertificationPipelineReport,
  getCertificatesReport,
  getLifecycleReport,
  getReportsCatalog,
} from "@/lib/api/reports-client";
import { requiresExportReason } from "@/lib/api/reports-export.util";
import type { ReportKey } from "@/lib/api/reports-types";

export type ChartDataRow = { readonly label: string; readonly value: number };

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

export type AdminAuditEvent = {
  readonly id: string;
  readonly occurredAt: string;
  readonly domain: string;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId: string | null;
  readonly actorId: string | null;
  readonly actorRole: string | null;
  readonly summary: string;
};

export type AdminCertificationApplicationsReport = {
  readonly applicationsByStatus: Readonly<Record<string, number>>;
  readonly eligibilityByStatus?: Readonly<Record<string, number>>;
};

export type AdminCertificationDecisionsReport = {
  readonly items: readonly {
    readonly reviewId: string;
    readonly applicationId: string;
    readonly status: string;
    readonly outcome: string | null;
    readonly quorumConfirmed: boolean;
    readonly quorumCount: number;
    readonly requiredQuorum: number;
  }[];
};

export type AdminCertificationLifecycleReport = {
  readonly publicVerificationActivityCount: number;
  readonly lifecycleByEventType: Readonly<Record<string, number>>;
};

export type AdminEvidenceOverview = {
  readonly documentPreviewCount: number;
  readonly certificatePdfCount: number;
  readonly educationCompletionCertificateCount: number;
  readonly identityDocumentAccess: string;
};

/** Canonical POST export targets for AdminReportsPage (F4-8e). */
export const ADMIN_REPORT_EXPORT_KEYS = {
  dashboard: "overview",
  certificationApplications: "certification-pipeline",
  certificationDecisions: "overview",
  certificateLifecycle: "lifecycle",
  evidenceOverview: "certificates",
  auditEvents: "audit",
} as const satisfies Record<string, ReportKey>;

export async function fetchAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const { data } = await api.get<AdminDashboardSummary>("/v1/admin/dashboard/summary");
  return data;
}

export async function fetchAdminAuditEvents(opts?: {
  domain?: string;
  action?: string;
  take?: number;
}): Promise<{ readOnly: boolean; items: AdminAuditEvent[] }> {
  const report = await getAuditReport({ limit: opts?.take ?? 40 });
  const domainFilter = opts?.domain?.trim().toLowerCase();
  const items = (report.items ?? [])
    .filter((row) => !domainFilter || row.domain?.toLowerCase() === domainFilter)
    .map((row) => ({
      id: row.id,
      occurredAt: row.occurredAt,
      domain: row.domain ?? "governance",
      action: row.eventType,
      resourceType: row.targetType ?? "unknown",
      resourceId: row.targetReference ?? null,
      actorId: row.actorReference ?? null,
      actorRole: null,
      summary: row.outcome ?? row.eventType,
    }));
  return { readOnly: true, items };
}

export async function fetchAdminCertificationApplicationsReport(): Promise<AdminCertificationApplicationsReport> {
  const data = await getCertificationPipelineReport();
  return {
    applicationsByStatus: (data.applicationsByStatus as Record<string, number>) ?? {},
  };
}

export async function fetchAdminCertificationCertificatesReport(): Promise<{
  statusDistribution: Readonly<Record<string, number>>;
}> {
  const data = await getCertificatesReport();
  return { statusDistribution: (data.statusDistribution as Record<string, number>) ?? {} };
}

/**
 * Row-level certification decision reviews are not exposed on a dedicated staff report key.
 * Aggregate counts remain on the dashboard summary; detailed rows live on ISO staff reports.
 */
export async function fetchAdminCertificationDecisionsReport(): Promise<AdminCertificationDecisionsReport> {
  return { items: [] };
}

export async function fetchAdminCertificationLifecycleReport(): Promise<AdminCertificationLifecycleReport> {
  const data = await getLifecycleReport();
  return {
    publicVerificationActivityCount: 0,
    lifecycleByEventType: (data.eventsByType as Record<string, number>) ?? {},
  };
}

export async function fetchAdminEvidenceOverview(): Promise<AdminEvidenceOverview> {
  const summary = await fetchAdminDashboardSummary();
  return {
    documentPreviewCount: summary.evidence.documentPreviewCount,
    certificatePdfCount: summary.certification.issuedCount,
    educationCompletionCertificateCount: summary.evidence.educationCompletionCertificateCount,
    identityDocumentAccess: "staff-only via presign-preview; never public catalogue",
  };
}

export async function fetchAdminExportCatalog(): Promise<{
  readOnly: boolean;
  exports: readonly { id: string; domain: string; format: string; path: string }[];
}> {
  const catalog = await getReportsCatalog();
  return {
    readOnly: true,
    exports: (catalog.reports ?? []).map((entry) => ({
      id: entry.key,
      domain: entry.key,
      format: "json/csv",
      path: `/v1/staff/reports/${entry.key}`,
    })),
  };
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadAdminReportExport(
  reportKey: ReportKey,
  filename: string,
  opts?: { readonly reason?: string; readonly includeDetails?: boolean; readonly includeAggregates?: boolean },
): Promise<void> {
  const includeDetails = opts?.includeDetails ?? false;
  const includeAggregates = opts?.includeAggregates ?? true;
  const reason =
    opts?.reason ??
    (requiresExportReason(reportKey, includeDetails) ? "Admin dashboard read-only export" : undefined);

  const result = await exportReport({
    reportKey,
    format: "CSV",
    includeDetails,
    includeAggregates,
    ...(reason ? { reason } : {}),
  });

  if (result.kind !== "csv") {
    throw new Error("Expected CSV export response");
  }
  triggerBlobDownload(result.blob, result.filename ?? filename);
}

export async function downloadAdminAuditEventsCsv(domain?: string): Promise<void> {
  await downloadAdminReportExport("audit", "admin-audit-events.csv", {
    includeDetails: true,
    includeAggregates: false,
    reason: domain?.trim()
      ? `Admin audit viewer export (${domain.trim()})`
      : "Admin audit viewer read-only export",
  });
}

/** @deprecated Use downloadAdminReportExport with a ReportKey. */
export async function downloadAdminReportCsv(_path: string, _filename: string): Promise<void> {
  throw new Error("LEGACY_GET_EXPORT_REMOVED");
}
