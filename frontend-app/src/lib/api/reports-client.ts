import { normalizeApiError, type NormalizedApiError } from "./api-error";
import { getHttpClient } from "./http-client";

/** Exact BAR-P08 certification-application aggregate routes (T026). */
export const REPORTS_BY_STATUS_PATH =
  "/v1/staff/reports/certification-applications/by-status" as const;
export const REPORTS_BY_SCHEME_REF_PATH =
  "/v1/staff/reports/certification-applications/by-scheme-ref" as const;

/**
 * P08 RFC3339 lexical pattern.
 * Fractional seconds: OPTIONAL_1_TO_3_DIGITS (absent, or exactly 1–3 digits).
 */
export const P08_RFC3339_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

export const T026_NETWORK_QUERY_KEYS = [
  "status",
  "schemeRef",
  "createdFrom",
  "createdTo",
  "submittedFrom",
  "submittedTo",
] as const;

export type T026NetworkQueryKey = (typeof T026_NETWORK_QUERY_KEYS)[number];

export type CertificationApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type CertificationApplicationsReportQuery = {
  readonly status?: CertificationApplicationStatus;
  readonly schemeRef?: string;
  readonly createdFrom?: string;
  readonly createdTo?: string;
  readonly submittedFrom?: string;
  readonly submittedTo?: string;
};

export type StatusGroupCell =
  | { readonly status: string; readonly suppressed: false; readonly count: number }
  | { readonly status: string; readonly suppressed: true };

export type SchemeGroupCell =
  | { readonly schemeRef: string; readonly suppressed: false; readonly count: number }
  | { readonly schemeRef: string; readonly suppressed: true };

export type CertificationApplicationsByStatusResult = {
  readonly groups: readonly StatusGroupCell[];
  readonly total?: number;
};

export type CertificationApplicationsBySchemeRefResult = {
  readonly groups: readonly SchemeGroupCell[];
  readonly total?: number;
};

const FORBIDDEN_QUERY_KEYS = new Set([
  "tenantId",
  "organizationId",
  "reportType",
  "groupBy",
  "dateFrom",
  "dateTo",
  "limit",
  "offset",
  "page",
  "pageSize",
]);

export function isValidP08Rfc3339(value: string): boolean {
  return P08_RFC3339_PATTERN.test(value);
}

/**
 * Convert a YYYY-MM-DD calendar date to a P08 RFC3339 UTC day-start instant.
 * Mechanical UTC calendar-day bound (OPTIONAL_1_TO_3_DIGITS with three digits).
 */
export function calendarDateToP08DayStartUtc(yyyyMmDd: string): string {
  return `${yyyyMmDd.trim()}T00:00:00.000Z`;
}

/**
 * Convert a YYYY-MM-DD calendar date to a P08 RFC3339 UTC day-end instant.
 */
export function calendarDateToP08DayEndUtc(yyyyMmDd: string): string {
  return `${yyyyMmDd.trim()}T23:59:59.999Z`;
}

function assertAllowedDate(value: string | undefined, key: T026NetworkQueryKey): void {
  if (value === undefined) return;
  if (!isValidP08Rfc3339(value)) {
    const err: NormalizedApiError = {
      status: 400,
      code: "VALIDATION_ERROR",
      message: `INVALID_${key.toUpperCase()}`,
    };
    throw err;
  }
}

/** Build axios params from the exact six allowed keys only. */
export function buildCertificationApplicationsReportParams(
  query: CertificationApplicationsReportQuery = {},
): Record<T026NetworkQueryKey, string> {
  const params: Partial<Record<T026NetworkQueryKey, string>> = {};

  if (query.status !== undefined) {
    params.status = query.status;
  }
  if (query.schemeRef !== undefined) {
    params.schemeRef = query.schemeRef;
  }
  if (query.createdFrom !== undefined) {
    assertAllowedDate(query.createdFrom, "createdFrom");
    params.createdFrom = query.createdFrom;
  }
  if (query.createdTo !== undefined) {
    assertAllowedDate(query.createdTo, "createdTo");
    params.createdTo = query.createdTo;
  }
  if (query.submittedFrom !== undefined) {
    assertAllowedDate(query.submittedFrom, "submittedFrom");
    params.submittedFrom = query.submittedFrom;
  }
  if (query.submittedTo !== undefined) {
    assertAllowedDate(query.submittedTo, "submittedTo");
    params.submittedTo = query.submittedTo;
  }

  for (const key of Object.keys(params)) {
    if (FORBIDDEN_QUERY_KEYS.has(key)) {
      delete params[key as T026NetworkQueryKey];
    }
  }

  return params as Record<T026NetworkQueryKey, string>;
}

function parseStatusResult(data: unknown): CertificationApplicationsByStatusResult {
  if (!data || typeof data !== "object") {
    return { groups: [] };
  }
  const o = data as Record<string, unknown>;
  const groups = Array.isArray(o.groups) ? (o.groups as StatusGroupCell[]) : [];
  if (Object.prototype.hasOwnProperty.call(o, "total") && typeof o.total === "number") {
    return { groups, total: o.total };
  }
  return { groups };
}

function parseSchemeResult(data: unknown): CertificationApplicationsBySchemeRefResult {
  if (!data || typeof data !== "object") {
    return { groups: [] };
  }
  const o = data as Record<string, unknown>;
  const groups = Array.isArray(o.groups) ? (o.groups as SchemeGroupCell[]) : [];
  if (Object.prototype.hasOwnProperty.call(o, "total") && typeof o.total === "number") {
    return { groups, total: o.total };
  }
  return { groups };
}

async function getAggregate<T>(
  path: typeof REPORTS_BY_STATUS_PATH | typeof REPORTS_BY_SCHEME_REF_PATH,
  query: CertificationApplicationsReportQuery,
  parse: (data: unknown) => T,
): Promise<T> {
  const client = getHttpClient();
  const params = buildCertificationApplicationsReportParams(query);
  try {
    const { data } = await client.get<unknown>(path, { params });
    return parse(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/** GET /v1/staff/reports/certification-applications/by-status */
export async function getCertificationApplicationsByStatus(
  query: CertificationApplicationsReportQuery = {},
): Promise<CertificationApplicationsByStatusResult> {
  return getAggregate(REPORTS_BY_STATUS_PATH, query, parseStatusResult);
}

/** GET /v1/staff/reports/certification-applications/by-scheme-ref */
export async function getCertificationApplicationsBySchemeRef(
  query: CertificationApplicationsReportQuery = {},
): Promise<CertificationApplicationsBySchemeRefResult> {
  return getAggregate(REPORTS_BY_SCHEME_REF_PATH, query, parseSchemeResult);
}
