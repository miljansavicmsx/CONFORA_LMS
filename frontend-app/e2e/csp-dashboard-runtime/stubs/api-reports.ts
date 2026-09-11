/**
 * Vitest/E2E-local stub for missing `@/lib/api-reports`.
 * Production must not ship a shim at `src/lib/api-reports.ts` (DR4-08).
 * Pre-existing gap on integration and MD13 candidate tips.
 */

export type ReportsSummary = Record<string, unknown>;

export async function fetchReportsSummary(): Promise<ReportsSummary> {
  return {};
}

export async function exportReport(): Promise<Blob> {
  return new Blob([]);
}

export function getReportExportPolicy(): Record<string, unknown> {
  return {};
}

export function isLegacyReportBuilderBlocked(): boolean {
  return true;
}

export function isReportExportEnabled(): boolean {
  return false;
}

export function legacySectionToReportKey(): string {
  return "";
}

export function requiresExportReason(): boolean {
  return false;
}
