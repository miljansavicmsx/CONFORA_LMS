import { getDefaultLegacyBaseUrl, joinBaseUrlAndPath, normalizeApiPath } from "@/lib/api/api-config";
import { resolveApiBaseUrl } from "@/lib/api/api-provider";

/** @deprecated Prefer `resolveApiBaseUrl(path)` — legacy default base for backward compatibility. */
export const API_BASE_URL: string = getDefaultLegacyBaseUrl();

export function buildApiUrl(path: string): string {
  const normalized = normalizeApiPath(path);
  return joinBaseUrlAndPath(resolveApiBaseUrl(normalized), normalized);
}
