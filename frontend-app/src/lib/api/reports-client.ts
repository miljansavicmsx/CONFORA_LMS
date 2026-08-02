import { isReportExportEnabled, isReportsCanonicalEnabled } from "./reports-canonical-flag";
import {
  buildSafeExportFilename,
  mapOverviewToLegacySummary,
  parseContentDispositionFilename,
  LEGACY_SECTION_EXPORT_KEY,
} from "./reports-export.util";
import type {
  AvailableReportsResponse,
  JsonExportResponse,
  ReportCatalogResponse,
  ReportExportPolicy,
  ReportExportRequest,
  ReportKey,
  ReportQueryParams,
  ReportsSummary,
} from "./reports-types";
import { type NormalizedApiError } from "./api-error";
import { getHttpClient } from "./http-client";

export const CANONICAL_STAFF_REPORTS_PATH = "/v1/staff/reports";
export const CANONICAL_STAFF_REPORTS_EXPORT_PATH = "/v1/staff/reports/export";
export const LEGACY_ADMIN_REPORTS_CATALOG_PATH = "/v1/admin/reports/catalog";

function staffPath(segment: string): string {
  if (segment === "export") {
    return CANONICAL_STAFF_REPORTS_EXPORT_PATH;
  }
  return `${CANONICAL_STAFF_REPORTS_PATH}/${segment}`;
}

function toQueryParams(params?: ReportQueryParams): Record<string, string | number> | undefined {
  if (!params) {
    return undefined;
  }
  const out: Record<string, string | number> = {};
  if (params.dateFrom?.trim()) {
    out.dateFrom = params.dateFrom.trim();
  }
  if (params.dateTo?.trim()) {
    out.dateTo = params.dateTo.trim();
  }
  if (params.limit != null) {
    out.limit = params.limit;
  }
  if (params.offset != null) {
    out.offset = params.offset;
  }
  return Object.keys(out).length ? out : undefined;
}

function assertCanonicalReports(): void {
  if (!isReportsCanonicalEnabled()) {
    throw {
      status: 410,
      code: "HTTP_ERROR",
      message: "CANONICAL_REPORTS_REQUIRED",
    } satisfies NormalizedApiError;
  }
}

async function getReport<T>(segment: string, params?: ReportQueryParams): Promise<T> {
  assertCanonicalReports();
  const client = getHttpClient();
  const { data } = await client.get<T>(staffPath(segment), { params: toQueryParams(params) });
  return data;
}

export async function getReportsCatalog(): Promise<ReportCatalogResponse> {
  const client = getHttpClient();
  const path = isReportsCanonicalEnabled() ? staffPath("catalog") : LEGACY_ADMIN_REPORTS_CATALOG_PATH;
  const { data } = await client.get<ReportCatalogResponse>(path);
  return data;
}

export async function getAvailableReports(): Promise<AvailableReportsResponse> {
  return getReport<AvailableReportsResponse>("available");
}

export async function getOverviewReport(params?: ReportQueryParams) {
  return getReport("overview", params);
}

export async function getCertificationPipelineReport(params?: ReportQueryParams) {
  return getReport("certification-pipeline", params);
}

export async function getCertificatesReport(params?: ReportQueryParams) {
  return getReport("certificates", params);
}

export async function getLifecycleReport(params?: ReportQueryParams) {
  return getReport("lifecycle", params);
}

export async function getRecertificationReport(params?: ReportQueryParams) {
  return getReport("recertification", params);
}

export async function getAppealsReport(params?: ReportQueryParams) {
  return getReport("appeals", params);
}

export async function getComplaintsReport(params?: ReportQueryParams) {
  return getReport("complaints", params);
}

export async function getContactRequestsReport(params?: ReportQueryParams) {
  return getReport("contact-requests", params);
}

export async function getGovernanceReport(params?: ReportQueryParams) {
  return getReport("governance", params);
}

export async function getSlaReport(params?: ReportQueryParams) {
  return getReport("sla", params);
}

export async function getAuditReport(params?: ReportQueryParams) {
  return getReport("audit", params);
}

export async function getControlsReport(params?: ReportQueryParams) {
  return getReport("controls", params);
}

export async function getWorkloadReport(params?: ReportQueryParams) {
  return getReport("workload", params);
}

export async function getTenantHealthReport(params?: ReportQueryParams) {
  return getReport("tenant-health", params);
}

export async function getDomainHealthReport(params?: ReportQueryParams) {
  return getReport("domain-health", params);
}

export async function getReportExportPolicy(): Promise<ReportExportPolicy> {
  assertCanonicalReports();
  if (!isReportExportEnabled()) {
    return { formats: [], reportKeys: [] };
  }
  const client = getHttpClient();
  const { data } = await client.get<ReportExportPolicy>(staffPath("export/policy"));
  return data;
}

export type ExportReportResult =
  | { readonly kind: "csv"; readonly blob: Blob; readonly filename: string }
  | { readonly kind: "json"; readonly data: JsonExportResponse };

export async function exportReport(body: ReportExportRequest): Promise<ExportReportResult> {
  assertCanonicalReports();
  if (!isReportExportEnabled()) {
    throw {
      status: 403,
      code: "HTTP_ERROR",
      message: "EXPORT_DISABLED",
    } satisfies NormalizedApiError;
  }

  const client = getHttpClient();
  const payload = {
    reportKey: body.reportKey,
    format: body.format,
    ...(body.filters ? { filters: body.filters } : {}),
    ...(body.columns?.length ? { columns: [...body.columns] } : {}),
    ...(body.includeDetails != null ? { includeDetails: body.includeDetails } : {}),
    ...(body.includeAggregates != null ? { includeAggregates: body.includeAggregates } : {}),
    ...(body.reason?.trim() ? { reason: body.reason.trim() } : {}),
    ...(body.maxRows != null ? { maxRows: body.maxRows } : {}),
  };

  if (body.format === "CSV") {
    const response = await client.post<string>(staffPath("export"), payload, {
      responseType: "text",
      transformResponse: [(d) => d],
    });
    const filename =
      parseContentDispositionFilename(response.headers["content-disposition"]) ??
      buildSafeExportFilename(body.reportKey, "CSV");
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
    return { kind: "csv", blob, filename };
  }

  const { data } = await client.post<JsonExportResponse>(staffPath("export"), payload);
  return { kind: "json", data };
}

export async function fetchReportsSummary(params?: {
  readonly from?: string;
  readonly to?: string;
}): Promise<ReportsSummary> {
  const query: { dateFrom?: string; dateTo?: string } = {};
  if (params?.from?.trim()) {
    query.dateFrom = params.from.trim();
  }
  if (params?.to?.trim()) {
    query.dateTo = params.to.trim();
  }

  if (!isReportsCanonicalEnabled()) {
    const catalog = await getReportsCatalog();
    return {
      denied: (catalog.reports?.length ?? 0) === 0,
      roleSections: catalog.reports?.map((r) => r.key) ?? [],
      availableReports: catalog.reports?.map((r) => r.key) ?? [],
    };
  }

  const [overview, available] = await Promise.all([
    getOverviewReport(query),
    getAvailableReports(),
  ]);

  return mapOverviewToLegacySummary({
    overview: overview as {
      counts: Record<string, unknown>;
      slaSummary?: Record<string, unknown>;
      generatedAt?: string;
    },
    available: available.available ?? [],
  });
}

/** @deprecated Use exportReport — POST /v1/staff/reports/export only. */
export function reportsExportUrl(_section: string, _params?: { readonly from?: string; readonly to?: string }): string {
  throw new Error("LEGACY_GET_EXPORT_REMOVED");
}

export function legacySectionToReportKey(section: string): ReportKey | null {
  return LEGACY_SECTION_EXPORT_KEY[section] ?? null;
}
