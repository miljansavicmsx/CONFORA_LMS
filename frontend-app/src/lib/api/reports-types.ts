/** Canonical report/export identifiers shared by existing staff-only report callers. */
export type ReportKey =
  | "overview"
  | "audit"
  | "certification-pipeline"
  | "certificates"
  | "lifecycle";

/** Server-approved export representations. Authority remains server-side. */
export type ExportFormat = "CSV" | "XLSX" | "PDF";
