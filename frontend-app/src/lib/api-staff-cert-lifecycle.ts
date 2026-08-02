/**
 * P1-B12 — Nest staff certificate lifecycle API client.
 */

import { api } from "@/lib/api";
import { normalizeApiError, type NormalizedApiError } from "@/lib/api/api-error";

export type StoredCertificateStatus =
  | "ISSUED"
  | "ACTIVE"
  | "SUSPENDED"
  | "WITHDRAWN"
  | "REVOKED"
  | "EXPIRED";

export type CertificateLifecycleStatusResponse = {
  readonly contractVersion: string;
  readonly certificateId: string;
  readonly certificateStatus: StoredCertificateStatus;
  readonly lifecycleStatus: string;
  readonly validityState: string;
  readonly currentlyValid: boolean;
  readonly certificateNumber: string | null;
  readonly verificationHash: string | null;
};

export type LifecycleEventItem = {
  readonly id: string;
  readonly eventType: string;
  readonly occurredAt: string;
  readonly reasonText: string | null;
};

export type CertificateLifecycleResponse = {
  readonly contractVersion: string;
  readonly certificateId: string;
  readonly certificateStatus: StoredCertificateStatus;
  readonly events: readonly LifecycleEventItem[];
};

function lifecycleBasePath(certificateId: string): string {
  return `/v1/staff/certificates/${encodeURIComponent(certificateId.trim())}/lifecycle`;
}

export function mapStaffLifecycleError(error: unknown): {
  code: string;
  messageKey: string;
  normalized: NormalizedApiError;
} {
  const normalized = normalizeApiError(error);
  if (normalized.status === 403) {
    return { code: "FORBIDDEN", messageKey: "lifecycle.errors.forbidden", normalized };
  }
  if (normalized.status === 404) {
    return { code: "NOT_FOUND", messageKey: "lifecycle.errors.notFound", normalized };
  }
  if (normalized.status === 409) {
    return { code: "CONFLICT", messageKey: "lifecycle.errors.conflict", normalized };
  }
  return { code: "UNKNOWN", messageKey: "lifecycle.errors.generic", normalized };
}

export async function fetchCertificateLifecycleStatus(
  certificateId: string,
): Promise<CertificateLifecycleStatusResponse> {
  const { data } = await api.get<CertificateLifecycleStatusResponse>(
    `${lifecycleBasePath(certificateId)}/status`,
  );
  return data;
}

export async function fetchCertificateLifecycle(
  certificateId: string,
): Promise<CertificateLifecycleResponse> {
  const { data } = await api.get<CertificateLifecycleResponse>(lifecycleBasePath(certificateId));
  return data;
}

export async function activateCertificate(
  certificateId: string,
  reasonText?: string,
): Promise<CertificateLifecycleResponse> {
  const { data } = await api.post<CertificateLifecycleResponse>(
    `${lifecycleBasePath(certificateId)}/activate`,
    reasonText?.trim() ? { reasonText: reasonText.trim() } : {},
  );
  return data;
}
