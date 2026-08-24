import { api } from "@/lib/api";
import { normalizeApiError } from "@/lib/api/api-error";

export type PublicCertificateVerifyResponse = { readonly certId?: string; readonly fullName?: string; readonly courseTitle?: string | null; readonly issuedAt?: string | null; readonly expiryDate?: string | null; readonly effectiveStatus?: string | null; readonly verificationResult?: string | null; readonly certificateKind?: string | null; readonly credentialTypeLabel?: string | null };
export type PublicCertificateVerifyResult = { readonly kind: "ok"; readonly data: PublicCertificateVerifyResponse } | { readonly kind: "not_found" } | { readonly kind: "error"; readonly normalized: ReturnType<typeof normalizeApiError> };

export async function verifyPublicCertificateByHash(hash: string): Promise<PublicCertificateVerifyResult> {
  const value = hash.trim(); if (!/^[0-9a-f]{64}$/iu.test(value)) return { kind: "not_found" };
  try { const { data } = await api.get<PublicCertificateVerifyResponse>(`/api/public/verify/${encodeURIComponent(value)}`); return { kind: "ok", data }; }
  catch (error) { const normalized = normalizeApiError(error); return normalized.status === 404 ? { kind: "not_found" } : { kind: "error", normalized }; }
}
