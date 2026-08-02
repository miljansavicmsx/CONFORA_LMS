export {
  AUTH_ME_PATH,
  AUTH_PERMISSIONS_PATH,
  AUTH_REFRESH_PATH,
  getCurrentUser,
  getCurrentUserPermissions,
  loginWithPassword,
  normalizeAuthProfile,
  refresh,
  resolveAuthRefreshTransport,
  type AuthClientResult,
  type AuthMeProfileRaw,
  type AuthTokenResponse,
} from "./auth-client";

export {
  getConforaApiConfig,
  getDefaultLegacyBaseUrl,
  joinBaseUrlAndPath,
  normalizeApiPath,
  parseApiProviderMode,
  parseAuthProviderMode,
  type ApiProviderMode,
  type AuthProviderMode,
  type ConforaApiConfig,
} from "./api-config";

export {
  buildConforaApiUrl,
  resolveApiBaseUrl,
  resolveApiTarget,
  resolveAuthApiBaseUrl,
  resolveAuthApiTarget,
  resolveBaseUrlForProvider,
  type ResolvedApiTarget,
} from "./api-provider";

export {
  ENDPOINT_DEFINITIONS,
  getEndpointsByGroup,
  resolveHybridOwnerForPath,
  resolveOwnerForPath,
  type EndpointDefinition,
  type EndpointGroup,
  type EndpointOwner,
  type EndpointRisk,
} from "./endpoint-registry";

export {
  authorizationHeaderValue,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
  type AuthTokenPair,
} from "./auth-token-provider";

export {
  isNormalizedApiError,
  normalizeApiError,
  type ApiErrorCode,
  type NormalizedApiError,
} from "./api-error";

export {
  getHttpClient,
  resetHttpClientForTests,
} from "./http-client";

export {
  CANONICAL_CONTACT_SUBMIT_PATH,
  CONTACT_SUBMIT_PATH,
  LEGACY_CONTACT_SUBMIT_PATH,
  buildCanonicalContactRequestBody,
  getPublicContactRequestStatus,
  submitContactRequest,
  submitLegacyPublicContact,
  submitPublicContact,
  type CanonicalContactRequestBody,
  type PublicContactFormInput,
  type PublicContactStatusResult,
  type PublicContactSubmitResult,
} from "./contact-client";

export { isContactCanonicalEnabled, parseContactCanonicalEnabled } from "./contact-canonical-flag";

export {
  CANONICAL_PUBLIC_COMPLAINTS_PATH,
  CANONICAL_LEARNER_COMPLAINTS_PATH,
  CANONICAL_STAFF_COMPLAINTS_PATH,
  LEGACY_ME_COMPLAINTS_PATH,
  LEGACY_ADMIN_COMPLAINTS_PATH,
  acknowledgeComplaint,
  getLearnerComplaint,
  getPublicComplaintStatus,
  getStaffComplaint,
  listLearnerComplaints,
  listStaffComplaints,
  submitLearnerComplaint,
  submitPublicComplaint,
  voidComplaint,
} from "./complaints-client";

export { isComplaintsCanonicalEnabled, parseComplaintsCanonicalEnabled } from "./complaints-canonical-flag";

export type {
  AppealCaseType,
  AppealDetail,
  AppealListItem,
  AppealOutcome,
  AppealStatus,
  B14DecisionOutcome,
} from "./appeals-types";

export {
  CANONICAL_LEARNER_APPEALS_PATH,
  CANONICAL_STAFF_APPEALS_PATH,
  LEGACY_ADMIN_APPEALS_PATH,
  LEGACY_ME_APPEALS_PATH,
  acknowledgeAppeal,
  getLearnerAppeal,
  getStaffAppeal,
  listLearnerAppeals,
  listStaffAppeals,
  recordAppealDecision,
  startAppealDecision,
  submitLearnerAppeal,
  voidAppeal,
} from "./appeals-client";

export { isAppealsCanonicalEnabled, parseAppealsCanonicalEnabled } from "./appeals-canonical-flag";

export type {
  AvailableReportsResponse,
  ExportFormat,
  JsonExportResponse,
  ReportCatalogResponse,
  ReportExportPolicy,
  ReportExportRequest,
  ReportKey,
  ReportsSummary,
} from "./reports-types";

export {
  CANONICAL_STAFF_REPORTS_PATH,
  exportReport,
  fetchReportsSummary,
  getAvailableReports,
  getOverviewReport,
  getReportExportPolicy,
  getReportsCatalog,
  legacySectionToReportKey,
} from "./reports-client";

export {
  isLegacyReportBuilderBlocked,
  isReportExportEnabled,
  isReportsCanonicalEnabled,
  parseBlockLegacyReportBuilder,
  parseReportExportEnabled,
  parseReportsCanonicalEnabled,
} from "./reports-canonical-flag";

export { requiresExportReason } from "./reports-export.util";

export type {
  CaseCategory,
  ComplaintCaseType,
  ComplaintDetail,
  ComplaintListItem,
  ComplaintStatus,
  ComplaintTargetType,
  GrievanceEventItem,
  PublicComplaintStatusResult,
  PublicComplaintSubmitResult,
} from "./complaints-types";

export {
  PUBLIC_VERIFY_BY_HASH,
  PUBLIC_VERIFY_POST,
  verifyPublicCertificateByHash,
  verifyPublicCertificateByReference,
  type PublicCertificateVerifyResponse,
  type PublicVerifyByHashResult,
} from "./public-verification-client";

export {
  PUBLIC_CATALOG_LIST,
  PUBLIC_CATALOG_LOOKUP,
  fetchPublicCatalogCourseByIdentifier,
  fetchPublicCatalogCourses,
  type PublicCatalogCourseRow,
  type PublicCatalogListQuery,
  type PublicCatalogListResult,
  type PublicCatalogLookupResult,
} from "./public-catalog-client";

/**
 * Compatibility wrapper pattern for future domain module migration:
 *
 * ```ts
 * import { getHttpClient, resolveApiTarget } from "@/lib/api";
 *
 * export async function fetchExample() {
 *   const path = "/v1/me/dashboard";
 *   const target = resolveApiTarget(path);
 *   const { data } = await getHttpClient().get(path);
 *   return data;
 * }
 * ```
 */
