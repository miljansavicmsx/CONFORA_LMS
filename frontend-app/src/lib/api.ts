import axios from "axios";

import { authorizationHeaderValue } from "@/lib/api/auth-token-provider";
import { isNormalizedApiError, normalizeApiError } from "@/lib/api/api-error";
import { resolveApiBaseUrl } from "@/lib/api/api-provider";

export { isNormalizedApiError };

/** Existing shared client boundary. It selects only endpoints already classified by the endpoint registry. */
export const api = axios.create();

api.interceptors.request.use((config) => {
  const path = typeof config.url === "string" ? config.url : "/";
  config.baseURL = resolveApiBaseUrl(path);
  const authorization = authorizationHeaderValue();
  if (authorization) config.headers.set("Authorization", authorization);
  return config;
});

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
