/**
 * F5-UI-4 — Nest staff tenant-scoped identity review queue.
 */

import { api } from "@/lib/api";
import { normalizeApiError, type NormalizedApiError } from "@/lib/api/api-error";

export type NestIdentityQueueStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type StaffIdentityQueueItem = {
  readonly verificationId: string;
  readonly userId: string;
  readonly email: string;
  readonly fullName: string;
  readonly docType: string;
  readonly documentKey: string | null;
  readonly status: NestIdentityQueueStatus;
  readonly verifiedAt: string | null;
};

export type StaffIdentityQueueResponse = {
  readonly contractVersion: string;
  readonly items: readonly StaffIdentityQueueItem[];
};

export function mapStaffIdentityReviewError(error: unknown): {
  code: string;
  messageKey: string;
  normalized: NormalizedApiError;
} {
  const normalized = normalizeApiError(error);
  if (normalized.status === 403) {
    return { code: "FORBIDDEN", messageKey: "identityReview.errors.forbidden", normalized };
  }
  if (normalized.status === 404) {
    return { code: "NOT_FOUND", messageKey: "identityReview.errors.notFound", normalized };
  }
  return { code: "UNKNOWN", messageKey: "identityReview.errors.generic", normalized };
}

export async function fetchStaffIdentityQueue(
  status?: NestIdentityQueueStatus,
): Promise<StaffIdentityQueueResponse> {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  const { data } = await api.get<StaffIdentityQueueResponse>(`/v1/staff/identity-review/queue${q}`);
  return {
    contractVersion: data.contractVersion ?? "F5-UI-4-staff-identity-review-v1",
    items: Array.isArray(data.items) ? data.items : [],
  };
}

export async function patchStaffIdentityReview(
  verificationId: string,
  body: { status: NestIdentityQueueStatus; note?: string },
): Promise<StaffIdentityQueueItem> {
  const { data } = await api.patch<StaffIdentityQueueItem>(
    `/v1/staff/identity-review/queue/${encodeURIComponent(verificationId)}`,
    body,
  );
  return data;
}
