/**
 * ISO 17024 — public certificate verification helpers for the a11y slice.
 *
 * R0-7D2S2: wallet/registry staff helpers removed so this already-tracked module
 * stays within the manifest-locked import closure (no api-staff-cert-registry,
 * no separate public-verification-client file).
 *
 * Type stubs for MyCertificateItem / CertificateRegistryRow remain so in-closure
 * entity-relationship builders typecheck without pulling staff APIs.
 */

import {
  verifyPublicCertificateByHash,
  type PublicCertificateVerifyResponse,
} from "@/lib/api";

export type CredentialWalletCategory = "exam_pass" | "certification";

export type MyCertificateItem = {
  readonly certificateId: string;
  readonly certificateKind: string;
  readonly credentialWalletCategory: CredentialWalletCategory;
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
  readonly learnerVerifyPath: string;
  readonly publicVerificationUrl: string | null;
  readonly supersededByCertificateId: string | null;
  readonly credentialScopeNote?: string | null;
  readonly schemeTitle?: string;
  readonly issuedAt?: string | null;
  readonly validUntil?: string | null;
};

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

export type VerifiedCertificatePublic = {
  readonly certificateId: string;
  readonly fullName: string;
  readonly courseName: string | null;
  readonly issueDate: string | null;
  readonly expiryDate: string | null;
  readonly effectiveStatus?: string;
  readonly status: string;
  readonly verificationResult?: string;
  readonly certificateKind?: string;
  readonly credentialTypeLabel?: string | null;
};

export type VerifyCertificateResult =
  | { readonly kind: "ok"; readonly data: VerifiedCertificatePublic }
  | { readonly kind: "not_found" }
  | { readonly kind: "error"; readonly message: string };

/**
 * Canonical public verify by verification hash (64 hex). No JWT.
 */
export async function verifyCertificate(verificationHash: string): Promise<VerifyCertificateResult> {
  const h = verificationHash.trim();
  if (!h) {
    return { kind: "error", message: "Nedostaje verifikacijski hash u URL-u." };
  }
  const result = await verifyPublicCertificateByHash(h);
  if (result.kind === "not_found") {
    return { kind: "not_found" };
  }
  if (result.kind === "error") {
    return { kind: "error", message: result.normalized.message };
  }
  const d = result.data as PublicCertificateVerifyResponse;
  const st = String(d.effectiveStatus ?? d.verificationResult ?? "UNKNOWN");
  const base: VerifiedCertificatePublic = {
    certificateId: String(d.certId ?? "").trim() || `${h.slice(0, 16)}…`,
    fullName: String(d.fullName ?? "").trim() || "—",
    courseName: d.courseTitle ?? null,
    issueDate: d.issuedAt ?? null,
    expiryDate: d.expiryDate ?? null,
    status: st,
  };
  const mapped: VerifiedCertificatePublic = {
    ...base,
    ...(d.effectiveStatus !== undefined && d.effectiveStatus !== null
      ? { effectiveStatus: d.effectiveStatus }
      : {}),
    ...(d.verificationResult !== undefined && d.verificationResult !== null
      ? { verificationResult: d.verificationResult }
      : {}),
    ...(d.certificateKind !== undefined && d.certificateKind !== null
      ? { certificateKind: d.certificateKind }
      : {}),
    ...(d.credentialTypeLabel !== undefined && d.credentialTypeLabel !== null
      ? { credentialTypeLabel: d.credentialTypeLabel }
      : {}),
  };
  return { kind: "ok", data: mapped };
}
