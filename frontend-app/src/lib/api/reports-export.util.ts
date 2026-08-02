import type { ReportKey } from "./reports-types";

export const SENSITIVE_EXPORT_REPORT_KEYS = new Set<ReportKey>([
  "audit",
  "controls",
  "governance",
  "workload",
  "complaints",
  "appeals",
  "contact-requests",
]);

export function requiresExportReason(reportKey: ReportKey, includeDetails?: boolean): boolean {
  if (!SENSITIVE_EXPORT_REPORT_KEYS.has(reportKey)) {
    return false;
  }
  if (reportKey === "contact-requests") {
    return includeDetails === true;
  }
  return true;
}

/** Safe download filename — no user-controlled path segments or PII. */
export function buildSafeExportFilename(reportKey: string, format: "JSON" | "CSV"): string {
  const safeKey = reportKey.replace(/[^a-z0-9-]/gi, "").slice(0, 64) || "report";
  const ext = format === "CSV" ? "csv" : "json";
  const stamp = new Date().toISOString().slice(0, 10);
  return `confora-${safeKey}-${stamp}.${ext}`;
}

export function parseContentDispositionFilename(header: string | null | undefined): string | null {
  if (!header) {
    return null;
  }
  const match = /filename="([^"]+)"/i.exec(header);
  if (!match?.[1]) {
    return null;
  }
  const base = match[1].replace(/[/\\]/g, "").slice(0, 128);
  return base || null;
}

/** Legacy FastAPI section id → canonical reportKey (export). */
export const LEGACY_SECTION_EXPORT_KEY: Record<string, ReportKey | null> = {
  certificationFunnel: "certification-pipeline",
  certificates: "certificates",
  exams: "certification-pipeline",
  finance: null,
  appealsAndComplaints: "appeals",
  recertification: "recertification",
  governance: "governance",
};

export function mapOverviewToLegacySummary(input: {
  readonly overview: {
    counts: Record<string, unknown>;
    slaSummary?: Record<string, unknown>;
    generatedAt?: string;
  };
  readonly available: readonly string[];
}): import("./reports-types").ReportsSummary {
  const counts = input.overview.counts;
  return {
    denied: input.available.length === 0,
    roleSections: [...input.available],
    availableReports: [...input.available],
    generatedAt: input.overview.generatedAt,
    counts,
    slaSummary: input.overview.slaSummary as import("./reports-types").ReportsSummary["slaSummary"],
    certificationFunnel: counts.certificationApplications
      ? [
          {
            status: "submitted",
            count: (counts.certificationApplications as { submitted?: number }).submitted,
          },
          {
            status: "underReview",
            count: (counts.certificationApplications as { underReview?: number }).underReview,
          },
        ]
      : undefined,
    candidates: counts.certificationApplications
      ? { certificationApplicationsByStatus: counts.certificationApplications }
      : undefined,
    certificates: counts.certificates,
    recertification: counts.recertification ? { byStatus: counts.recertification } : undefined,
    appealsAndComplaints: {
      appealsByStatus: counts.appeals,
      complaintsByStatus: counts.complaints,
    },
    governance: counts.governance,
  } as import("./reports-types").ReportsSummary;
}
