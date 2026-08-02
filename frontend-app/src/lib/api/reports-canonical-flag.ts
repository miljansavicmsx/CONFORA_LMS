/**
 * F4-8e feature flags for canonical staff reports and controlled export.
 */
export function parseReportsCanonicalEnabled(raw: string | undefined): boolean {
  const v = (raw ?? "true").trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") {
    return false;
  }
  return true;
}

export function isReportsCanonicalEnabled(): boolean {
  return parseReportsCanonicalEnabled(import.meta.env.VITE_REPORTS_CANONICAL_ENABLED);
}

export function parseReportExportEnabled(raw: string | undefined): boolean {
  const v = (raw ?? "true").trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") {
    return false;
  }
  return true;
}

export function isReportExportEnabled(): boolean {
  return parseReportExportEnabled(import.meta.env.VITE_REPORT_EXPORT_ENABLED);
}

export function parseBlockLegacyReportBuilder(raw: string | undefined): boolean {
  const v = (raw ?? "true").trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") {
    return false;
  }
  return true;
}

export function isLegacyReportBuilderBlocked(): boolean {
  return parseBlockLegacyReportBuilder(import.meta.env.VITE_BLOCK_LEGACY_REPORT_BUILDER);
}
