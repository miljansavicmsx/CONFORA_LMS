/** F4 staff report keys (operational + governance). */

export const OPERATIONAL_REPORT_KEYS = [
  "overview",
  "certification-pipeline",
  "certificates",
  "lifecycle",
  "recertification",
  "appeals",
  "complaints",
  "contact-requests",
] as const;

export const GOVERNANCE_REPORT_KEYS = [
  "governance",
  "sla",
  "audit",
  "controls",
  "workload",
  "tenant-health",
  "domain-health",
] as const;

export type OperationalReportKey = (typeof OPERATIONAL_REPORT_KEYS)[number];
export type GovernanceReportKey = (typeof GOVERNANCE_REPORT_KEYS)[number];
export type ReportKey = OperationalReportKey | GovernanceReportKey;

export type ExportFormat = "JSON" | "CSV";

export type ReportCatalogEntry = {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly readOnly: true;
};

export type ReportCatalogResponse = {
  readonly contractVersion?: string;
  readonly reports: readonly ReportCatalogEntry[];
};

export type AvailableReportsResponse = {
  readonly contractVersion?: string;
  readonly available: readonly string[];
  readonly tenantScoped?: boolean;
};

export type OverviewReportResponse = {
  readonly contractVersion?: string;
  readonly generatedAt?: string;
  readonly counts: Record<string, unknown>;
  readonly slaSummary?: Record<string, { dueSoon: number; overdue: number; open: number }>;
};

/** Legacy-compatible summary for gradual UI migration. */
export type ReportsSummary = {
  readonly denied?: boolean;
  readonly roleSections?: readonly string[];
  readonly counts?: Record<string, unknown>;
  readonly slaSummary?: Record<string, { dueSoon: number; overdue: number; open: number }>;
  readonly generatedAt?: string;
  readonly availableReports?: readonly string[];
  readonly education?: Record<string, unknown>;
  readonly learners?: Record<string, unknown>;
  readonly candidates?: Record<string, unknown>;
  readonly certificationFunnel?: readonly { status?: string; count?: number }[];
  readonly certificationDecisions?: Record<string, unknown>;
  readonly exams?: Record<string, unknown>;
  readonly certificates?: Record<string, unknown>;
  readonly finance?: Record<string, unknown>;
  readonly appealsAndComplaints?: Record<string, unknown>;
  readonly recertification?: Record<string, unknown>;
  readonly governance?: Record<string, unknown>;
  readonly sampleCaps?: Record<string, unknown>;
};

export type ReportExportPolicy = {
  readonly contractVersion?: string;
  readonly formats: readonly ExportFormat[];
  readonly reportKeys: readonly string[];
  readonly tenantScoped?: boolean;
  readonly defaultMaxRows?: number;
  readonly hardMaxRows?: number;
};

export type ReportExportRequest = {
  readonly reportKey: ReportKey;
  readonly format: ExportFormat;
  readonly filters?: Record<string, unknown>;
  readonly columns?: readonly string[];
  readonly includeDetails?: boolean;
  readonly includeAggregates?: boolean;
  readonly reason?: string;
  readonly maxRows?: number;
};

export type JsonExportResponse = {
  readonly contractVersion?: string;
  readonly reportKey: string;
  readonly format: "JSON";
  readonly generatedAt?: string;
  readonly rowCount?: number;
  readonly data?: readonly Record<string, unknown>[];
};

export type ReportQueryParams = {
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly limit?: number;
  readonly offset?: number;
};
