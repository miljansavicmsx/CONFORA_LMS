/**
 * Organizacijski izvještaji — F4 canonical staff reports (B14/B15 read-only aggregates).
 */

export type { ReportsSummary } from "@/lib/api/reports-types";

export {
  CANONICAL_STAFF_REPORTS_PATH,
  exportReport,
  fetchReportsSummary,
  getAvailableReports,
  getOverviewReport,
  getReportExportPolicy,
  getReportsCatalog,
  legacySectionToReportKey,
  reportsExportUrl,
} from "@/lib/api/reports-client";

export {
  isLegacyReportBuilderBlocked,
  isReportExportEnabled,
  isReportsCanonicalEnabled,
} from "@/lib/api/reports-canonical-flag";

export { requiresExportReason } from "@/lib/api/reports-export.util";
