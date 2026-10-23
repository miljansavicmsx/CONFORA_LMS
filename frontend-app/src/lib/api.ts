import axios, { type InternalAxiosRequestConfig } from "axios";

import { purgePersistedAuthSecrets } from "@/lib/api/auth-token-provider";
import { isNormalizedApiError, normalizeApiError } from "@/lib/api/api-error";
import { resolveApiBaseUrl } from "@/lib/api/api-provider";
import { browserCsrfToken, noteSessionLost, refreshOidcSession } from "@/lib/oidc-browser-session";

export { isNormalizedApiError };

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** Existing shared client boundary. It selects only endpoints already classified by the endpoint registry. */
export const api = axios.create({ withCredentials: true });

api.interceptors.request.use((config) => {
  purgePersistedAuthSecrets();
  const path = typeof config.url === "string" ? config.url : "/";
  config.baseURL = resolveApiBaseUrl(path);
  config.withCredentials = true;
  config.headers.delete("Authorization");
  const method = String(config.method ?? "get").toLowerCase();
  const token = browserCsrfToken();
  if (token && method !== "get" && method !== "head" && method !== "options") {
    config.headers.set("X-CSRF-Token", token);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config || error.response?.status !== 401) {
      return Promise.reject(error);
    }
    const original = error.config as RetryConfig;
    const url = String(original.url ?? "");
    const expired = String(error.response.headers?.["x-confora-session"] ?? "") === "expired";
    if (original._retry || expired || url.includes("/auth/oidc/")) {
      noteSessionLost(expired ? "expired" : "session");
      return Promise.reject(error);
    }
    original._retry = true;
    const refreshed = await refreshOidcSession();
    if (!refreshed) return Promise.reject(error);
    return api(original);
  },
);

type PublicVerify = { readonly valid: boolean; readonly verificationResult?: string; readonly certificateKind?: string };
export type PublicCertificateReferenceResult =
  | { readonly kind: "ok"; readonly data: PublicVerify }
  | { readonly kind: "not_found" }
  | { readonly kind: "error"; readonly normalized: ReturnType<typeof normalizeApiError> };

/** Existing public, read-only verification endpoint; no user credentials are accepted or logged. */
export async function verifyPublicCertificateByReference(reference: string): Promise<PublicCertificateReferenceResult> {
  const trimmed = reference.trim();
  if (!trimmed) return { kind: "not_found" };
  try {
    const { data } = await api.post<PublicVerify>("/api/public/certificates/verify", { reference: trimmed });
    return { kind: "ok", data };
  } catch (error) {
    const normalized = normalizeApiError(error);
    return normalized.status === 404 ? { kind: "not_found" } : { kind: "error", normalized };
  }
}
