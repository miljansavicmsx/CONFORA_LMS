/**
 * P1-B11 — Nest staff certificate issuance API client.
 */

import { api } from "@/lib/api";
import { normalizeApiError, type NormalizedApiError } from "@/lib/api/api-error";

export type CertificateIssuanceReviewStatus = "NOT_STARTED" | "IN_PROGRESS" | "ISSUED" | "VOIDED";

export type IssuedCertificateSnapshot = {
  readonly id: string;
  readonly applicationId: string;
  readonly certificateNumber: string;
  readonly verificationHash: string;
  readonly status: "ISSUED";
  readonly issuedAt: string;
  readonly validFrom: string;
  readonly validUntil: string | null;
};

export type CertificateIssuanceReview = {
  readonly id: string;
  readonly applicationId: string;
  readonly status: CertificateIssuanceReviewStatus;
  readonly startedAt: string;
  readonly issuedAt: string | null;
  readonly notes: string | null;
};

export type CertificateIssuanceResponse = {
  readonly contractVersion: string;
  readonly issuanceStarted: boolean;
  readonly certificateIssuanceReview: CertificateIssuanceReview | null;
  readonly certificate: IssuedCertificateSnapshot | null;
};

export type CertificateDocumentResponse = {
  readonly contractVersion: string;
  readonly applicationId: string;
  readonly documentGenerated: boolean;
  readonly checksumSha256: string | null;
  readonly downloadUrl: string | null;
  readonly generatedAt: string | null;
};

function issuanceBasePath(applicationId: string): string {
  return `/v1/staff/certificate-issuance/${encodeURIComponent(applicationId.trim())}`;
}

export function mapStaffIssuanceError(error: unknown): {
  code: string;
  messageKey: string;
  normalized: NormalizedApiError;
} {
  const normalized = normalizeApiError(error);
  if (normalized.status === 403) {
    return { code: "FORBIDDEN", messageKey: "issuance.errors.forbidden", normalized };
  }
  if (normalized.status === 404) {
    return { code: "NOT_FOUND", messageKey: "issuance.errors.notFound", normalized };
  }
  if (normalized.status === 409) {
    return { code: "CONFLICT", messageKey: "issuance.errors.conflict", normalized };
  }
  return { code: "UNKNOWN", messageKey: "issuance.errors.generic", normalized };
}

export async function fetchCertificateIssuance(
  applicationId: string,
): Promise<CertificateIssuanceResponse> {
  const { data } = await api.get<CertificateIssuanceResponse>(issuanceBasePath(applicationId));
  return data;
}

export async function startCertificateIssuance(
  applicationId: string,
  notes?: string,
): Promise<CertificateIssuanceResponse> {
  const { data } = await api.post<CertificateIssuanceResponse>(
    `${issuanceBasePath(applicationId)}/start`,
    notes?.trim() ? { notes: notes.trim() } : {},
  );
  return data;
}

export async function issueCertificate(
  applicationId: string,
  notes?: string,
): Promise<CertificateIssuanceResponse> {
  const { data } = await api.post<CertificateIssuanceResponse>(
    `${issuanceBasePath(applicationId)}/issue`,
    notes?.trim() ? { notes: notes.trim() } : {},
  );
  return data;
}

export async function fetchCertificateDocument(
  applicationId: string,
): Promise<CertificateDocumentResponse> {
  const { data } = await api.get<CertificateDocumentResponse>(
    `${issuanceBasePath(applicationId)}/document`,
  );
  return data;
}

export async function generateCertificateDocument(
  applicationId: string,
): Promise<CertificateDocumentResponse> {
  const { data } = await api.post<CertificateDocumentResponse>(
    `${issuanceBasePath(applicationId)}/generate-document`,
    {},
  );
  return data;
}
