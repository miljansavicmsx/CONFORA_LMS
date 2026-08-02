import axios from "axios";

import { buildConforaApiUrl } from "./api-provider";
import { normalizeApiError, type NormalizedApiError } from "./api-error";

/** Legacy public catalog row (`GET /api/courses`, lookup). */
export type PublicCatalogCourseRow = {
  readonly courseId: string;
  readonly slug: string;
  readonly title: string;
  readonly domain: string | null;
  readonly categorySlug?: string | null;
  readonly price: number | null;
  readonly level?: string;
  readonly durationHours?: number;
  readonly thumbnailUrl?: string | null;
  readonly heroBannerUrl?: string | null;
  readonly badges?: readonly string[];
  readonly enrollmentCount?: number;
  readonly createdAt?: string;
  readonly status?: string;
  readonly isCertifiable?: boolean;
  readonly featured?: boolean;
  readonly description?: string | null;
  readonly shortSummary?: string | null;
  readonly learningOutcomes?: readonly string[] | null;
  readonly leadsToCertification?: boolean;
  readonly hasFinalExam?: boolean;
  readonly autoIssueExamPassCertificate?: boolean;
  readonly certificationSchemeReference?: string | null;
  readonly moduleCount?: number | null;
  readonly lessonCountTotal?: number | null;
  readonly structurePreview?: readonly { readonly title: string; readonly lessonCount: number }[] | null;
  readonly learningGoals?: readonly string[] | null;
};

export type PublicCatalogListQuery = {
  readonly featured?: boolean;
  readonly oblast?: string;
  readonly nivo?: string;
  readonly sort?: string;
  readonly q?: string;
  readonly priceRanges?: string;
};

export type PublicCatalogListResult =
  | { readonly kind: "ok"; readonly data: PublicCatalogCourseRow[] }
  | { readonly kind: "error"; readonly normalized: NormalizedApiError };

export type PublicCatalogLookupResult =
  | { readonly kind: "ok"; readonly data: PublicCatalogCourseRow }
  | { readonly kind: "not_found" }
  | { readonly kind: "error"; readonly normalized: NormalizedApiError };

const PUBLIC_CATALOG_LIST = "/api/courses";
const PUBLIC_CATALOG_LOOKUP = "/api/courses/lookup";

function buildListQueryString(query?: PublicCatalogListQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.featured === true) params.set("featured", "true");
  if (query.oblast?.trim()) params.set("oblast", query.oblast.trim());
  if (query.nivo?.trim()) params.set("nivo", query.nivo.trim());
  if (query.sort?.trim()) params.set("sort", query.sort.trim());
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.priceRanges?.trim()) params.set("priceRanges", query.priceRanges.trim());
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** GET `/api/courses` — public catalog list; no JWT; provider-aware base URL. */
export async function fetchPublicCatalogCourses(
  query?: PublicCatalogListQuery,
): Promise<PublicCatalogListResult> {
  const path = `${PUBLIC_CATALOG_LIST}${buildListQueryString(query)}`;
  const url = buildConforaApiUrl(path);
  try {
    const res = await axios.get<PublicCatalogCourseRow[]>(url, {
      headers: { Accept: "application/json" },
    });
    return { kind: "ok", data: Array.isArray(res.data) ? res.data : [] };
  } catch (e) {
    return { kind: "error", normalized: normalizeApiError(e) };
  }
}

/** GET `/api/courses/lookup/{slug|id}` — public course lookup; no JWT. */
export async function fetchPublicCatalogCourseByIdentifier(
  identifier: string,
): Promise<PublicCatalogLookupResult> {
  const ident = identifier.trim();
  if (!ident) {
    return {
      kind: "error",
      normalized: { status: 0, code: "VALIDATION_ERROR", message: "missing_course_identifier" },
    };
  }
  const url = buildConforaApiUrl(`${PUBLIC_CATALOG_LOOKUP}/${encodeURIComponent(ident)}`);
  try {
    const res = await axios.get<PublicCatalogCourseRow>(url, {
      headers: { Accept: "application/json" },
    });
    return { kind: "ok", data: res.data };
  } catch (e) {
    if (axios.isAxiosError(e) && (e.response?.status === 404 || e.response?.status === 400)) {
      return { kind: "not_found" };
    }
    return { kind: "error", normalized: normalizeApiError(e) };
  }
}

export { PUBLIC_CATALOG_LIST, PUBLIC_CATALOG_LOOKUP };
