export { API_BASE_URL, buildApiUrl } from "@/lib/api-base-url";

export {
  buildConforaApiUrl,
  getConforaApiConfig,
  getCurrentUser,
  getCurrentUserPermissions,
  getHttpClient,
  getPublicContactRequestStatus,
  isContactCanonicalEnabled,
  isNormalizedApiError,
  normalizeApiError,
  normalizeAuthProfile,
  refresh,
  resolveApiBaseUrl,
  resolveApiTarget,
  resolveAuthApiBaseUrl,
  submitPublicContact,
  verifyPublicCertificateByHash,
  verifyPublicCertificateByReference,
  fetchPublicCatalogCourses,
  fetchPublicCatalogCourseByIdentifier,
  type PublicContactStatusResult,
  type PublicContactSubmitResult,
} from "@/lib/api/index";

import { getHttpClient } from "@/lib/api/http-client";

export const apiClient = getHttpClient();
export const api = apiClient;
