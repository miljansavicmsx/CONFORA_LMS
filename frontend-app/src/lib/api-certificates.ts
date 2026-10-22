/**
 * ISO 17024 certifikati — credential wallet (auth) i javna verifikacija.
 */

import { getConforaApiConfig } from "@/lib/api/api-config";
import { resolveOwnerForPath } from "@/lib/api/endpoint-registry";
import { api } from "@/lib/api";
import {
  fetchNestRegistryConfig,
  resolveNestEffectiveRegistryMode,
} from "@/lib/api-staff-cert-registry";

/** Canonical Nest learner wallet (P1-B2). */
const NEST_WALLET_PATH = "/v1/me/certificates";
/** Legacy rollback path. */
const LEGACY_WALLET_PATH = "/api/certificates/my";

function resolveWalletApiPath(): string {
  const provider = getConforaApiConfig().provider;
  if (provider === "legacy") return LEGACY_WALLET_PATH;
  if (provider === "nest") return NEST_WALLET_PATH;
  return resolveOwnerForPath(NEST_WALLET_PATH, "hybrid") === "nest"
    ? NEST_WALLET_PATH
    : LEGACY_WALLET_PATH;
}

const NEST_WALLET_PDF_URL_PATH = "/v1/me/certificates";

function resolveWalletPdfUrlPath(certificateId: string): string {
  const encoded = encodeURIComponent(certificateId.trim());
  const provider = getConforaApiConfig().provider;
  if (provider === "legacy") {
    return `/api/certificates/my/${encoded}/pdf-url`;
  }
  if (provider === "nest") {
    return `${NEST_WALLET_PDF_URL_PATH}/${encoded}/pdf-url`;
  }
  return resolveOwnerForPath(`${NEST_WALLET_PDF_URL_PATH}/${encoded}/pdf-url`, "hybrid") === "nest"
    ? `${NEST_WALLET_PDF_URL_PATH}/${encoded}/pdf-url`
    : `/api/certificates/my/${encoded}/pdf-url`;
}

/** Kategorije u novčaniku — odvojeno od `certificateKind` (strogi backend enum). */
export type CredentialWalletCategory = "exam_pass" | "certification";

export type MyCertificateItem = {
  readonly certificateId: string;
  readonly certificateKind: string;
  readonly credentialWalletCategory: CredentialWalletCategory;
  /** Kratak opis tipa dokumenta za UI. */
  readonly documentTypeLabel: string;
  readonly title: string;
  readonly courseName: string | null;
  readonly certificationLevel: string | null;
  readonly certificateNumber: string;
  readonly issueDate: string | null;
  readonly expiryDate: string | null;
  readonly lifecycleStatus: string;
  readonly qrHash: string | null;
  readonly pdfUrl: string | null;
  readonly pdfDownloadAvailable?: boolean;
  readonly publicVerifyUrl?: string | null;
  readonly verifyHash?: string | null;
  /** Relativna putanja u learner SPA (npr. /verify/CON-…). */
  readonly learnerVerifyPath: string;
  /** Puni URL javne provjere (CERTIFICATE_VERIFY_BASE_URL). */
  readonly publicVerificationUrl: string | null;
  readonly supersededByCertificateId: string | null;
  /** Backend (exam pass) — kratka napomena da nije certifikacija osobe. */
  readonly credentialScopeNote?: string | null;
  /** TD-081 selector-safe fields */
  readonly schemeTitle?: string;
  readonly issuedAt?: string | null;
  readonly validUntil?: string | null;
  readonly publicNumber?: string;
  readonly recertificationEligible?: boolean;
  readonly cpdEligible?: boolean;
  readonly verifiableCredentialUrl?: string | null;
  readonly reminders?: readonly { readonly kind: string; readonly dueAt: string }[];
};

export async function fetchMyCertificates(): Promise<MyCertificateItem[]> {
  const path = resolveWalletApiPath();
  const { data } = await api.get<
    MyCertificateItem[] | { readonly items?: MyCertificateItem[]; readonly contractVersion?: string }
  >(path);
  if (Array.isArray(data)) {
    return data;
  }
  return Array.isArray(data?.items) ? data.items : [];
}

/** Registar (ISO) — samo PERSON_CERTIFICATION, filtrirano po tenantu u backendu. */
export type CertificateRegistryRow = {
  readonly certificateId: string;
  readonly holderName: string;
  readonly certificateType: string;
  readonly status: string;
  readonly issuedAt: string | null;
  readonly expiresAt: string | null;
  readonly verificationHash: string | null;
  readonly linkedApplicationId: string | null;
  readonly learnerVerifyPath: string;
  readonly publicVerificationUrl: string | null;
};

export async function fetchCertificatesRegistry(status?: string): Promise<CertificateRegistryRow[]> {
  const q = status?.trim() ? `?status=${encodeURIComponent(status.trim())}` : "";
  const { data } = await api.get<CertificateRegistryRow[]>(`/api/certificates/registry${q}`);
  return Array.isArray(data) ? data : [];
}

/** Resolves staff registry source mode (env override → Nest config → dual). */
export async function resolveEffectiveCertRegistrySourceMode(): Promise<"dual" | "nest"> {
  const envMode = import.meta.env.VITE_CERT_REGISTRY_SOURCE?.trim().toLowerCase();
  if (envMode === "nest" || envMode === "dual") {
    return envMode;
  }
  try {
    const config = await fetchNestRegistryConfig();
    return resolveNestEffectiveRegistryMode(config);
  } catch {
    return "dual";
  }
}

/** Presigned PDF download URL after JWT ownership check (P1-B2-6 Nest in hybrid/nest). */
export async function fetchMyCertificatePdfUrl(certificateId: string): Promise<string> {
  const path = resolveWalletPdfUrlPath(certificateId);
  const { data } = await api.get<
    | { pdfUrl: string }
    | {
        readonly pdfUrl: string;
        readonly contractVersion?: string;
        readonly certificateId?: string;
        readonly expiresAt?: string;
        readonly accessMode?: string;
      }
  >(path);
  const url = String(data.pdfUrl ?? "").trim();
  if (!url) {
    throw new Error("PDF URL nije dostupan.");
  }
  return url;
}
