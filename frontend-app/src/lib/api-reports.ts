/**
 * Staff report entry used by the ISO reports page.
 * Aggregate calls stay unavailable until that page is wired to the current Nest report routes.
 */
import type { ExportFormat, ReportKey } from "@/lib/api/reports-types";

export type ReportsSummary = {
  readonly sections?: readonly { readonly key: string; readonly title: string }[];
};

function unavailable(): never {
  throw new Error("REPORTS_UNAVAILABLE");
}

export async function fetchReportsSummary(): Promise<ReportsSummary> {
  return unavailable();
}

export async function exportReport(
  _reportKey: ReportKey,
  _format: ExportFormat,
  _reason?: string,
): Promise<never> {
  return unavailable();
}

export function getReportExportPolicy(): null {
  return null;
}

export function legacySectionToReportKey(_section: string): ReportKey {
  return "overview";
}

export {
  isLegacyReportBuilderBlocked,
  isReportExportEnabled,
} from "@/lib/api/reports-canonical-flag";

export { requiresExportReason } from "@/lib/api/reports-export.util";
