export { API_BASE_URL, buildApiUrl } from "@/lib/api-base-url";

export {
  getConforaApiConfig,
  getDefaultLegacyBaseUrl,
  type ConforaApiConfig,
} from "@/lib/api/api-config";

export {
  buildConforaApiUrl,
  resolveApiBaseUrl,
  resolveApiTarget,
  resolveAuthApiBaseUrl,
  type ResolvedApiTarget,
} from "@/lib/api/api-provider";

export {
  isNormalizedApiError,
  normalizeApiError,
  type ApiErrorCode,
  type NormalizedApiError,
} from "@/lib/api/api-error";

export { getHttpClient } from "@/lib/api/http-client";

import axios from "axios";

import { buildConforaApiUrl } from "@/lib/api/api-provider";
import { normalizeApiError, type NormalizedApiError } from "@/lib/api/api-error";
import { getHttpClient } from "@/lib/api/http-client";

/**
 * R0-7D2S2: public verify helpers inlined so the a11y slice does not depend on
 * out-of-manifest `api/index.ts` / `public-verification-client.ts`.
 */

export type PublicCertificateVerifyResponse = {
  readonly valid: boolean;
  readonly verificationResult?: string;
  readonly certificateKind?: string;
  readonly credentialTypeLabel?: string;
  readonly fullName?: string;
  readonly courseTitle?: string;
  readonly issuedAt?: string;
  readonly expiryDate?: string | null;
  readonly certId?: string;
  readonly effectiveStatus?: string;
  readonly schemeTitle?: string;
  readonly schemeVersion?: string;
};

export type PublicVerifyByHashResult =
  | { readonly kind: "ok"; readonly data: PublicCertificateVerifyResponse }
  | { readonly kind: "not_found" }
  | { readonly kind: "error"; readonly normalized: NormalizedApiError };

const PUBLIC_VERIFY_BY_HASH = "/api/public/verify";
const PUBLIC_VERIFY_POST = "/api/public/certificates/verify";

function mapToVerifyResult(
  _hash: string,
  d: PublicCertificateVerifyResponse,
): PublicVerifyByHashResult {
  const st = String(d.effectiveStatus ?? d.verificationResult ?? "UNKNOWN");
  const hasPayload = Boolean(
    (d.certId && String(d.certId).trim()) ||
      (d.fullName && String(d.fullName).trim()) ||
      (d.certificateKind && String(d.certificateKind).trim()),
  );
  if (!d.valid && !hasPayload) {
    return { kind: "not_found" };
  }
  return { kind: "ok", data: { ...d, effectiveStatus: d.effectiveStatus ?? st } };
}

export async function verifyPublicCertificateByHash(
  verificationHash: string,
): Promise<PublicVerifyByHashResult> {
  const h = verificationHash.trim();
  if (!h) {
    return {
      kind: "error",
      normalized: {
        status: 0,
        code: "VALIDATION_ERROR",
        message: "missing_verification_hash",
      },
    };
  }
  const url = buildConforaApiUrl(`${PUBLIC_VERIFY_BY_HASH}/${encodeURIComponent(h)}`);
  try {
    const res = await axios.get<PublicCertificateVerifyResponse>(url, {
      headers: { Accept: "application/json" },
      validateStatus: (s) => s === 200,
    });
    return mapToVerifyResult(h, res.data);
  } catch (e) {
    if (axios.isAxiosError(e) && (e.response?.status === 404 || e.response?.status === 400)) {
      return { kind: "not_found" };
    }
    return { kind: "error", normalized: normalizeApiError(e) };
  }
}

export async function verifyPublicCertificateByReference(
  reference: string,
): Promise<PublicVerifyByHashResult> {
  const ref = reference.trim();
  if (!ref) {
    return {
      kind: "error",
      normalized: {
        status: 0,
        code: "VALIDATION_ERROR",
        message: "missing_reference",
      },
    };
  }
  const url = buildConforaApiUrl(PUBLIC_VERIFY_POST);
  try {
    const res = await axios.post<PublicCertificateVerifyResponse>(
      url,
      { reference: ref },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );
    return mapToVerifyResult(ref, res.data);
  } catch (e) {
    if (axios.isAxiosError(e) && (e.response?.status === 404 || e.response?.status === 400)) {
      return { kind: "not_found" };
    }
    return { kind: "error", normalized: normalizeApiError(e) };
  }
}

export const apiClient = getHttpClient();
export const api = apiClient;
