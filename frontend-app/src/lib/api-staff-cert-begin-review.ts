/**
 * P1-B5-3b — Nest-only staff certification application begin-review API client.
 * No legacy fallback for review start or status reads.
 */

import { api } from "@/lib/api";
import { normalizeApiError, type NormalizedApiError } from "@/lib/api/api-error";

export type ReviewState = "NOT_STARTED" | "IN_PROGRESS";

export type ApplicationReviewStatusResponse = {
  readonly contractVersion: string;
  readonly applicationId: string;
  readonly applicationStatus: string;
  readonly reviewState: ReviewState;
  readonly assignmentStatus: "ACCEPTED" | "IN_REVIEW" | null;
  readonly assigneeReference: string | null;
  readonly reviewStartedAt: string | null;
};

export type StaffBeginReviewErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PRECONDITION"
  | "ALREADY_IN_REVIEW"
  | "VALIDATION"
  | "NETWORK"
  | "UNKNOWN";

export type StaffBeginReviewError = {
  readonly code: StaffBeginReviewErrorCode;
  readonly messageKey: string;
  readonly normalized: NormalizedApiError;
};

function staffReviewBasePath(applicationId: string): string {
  const id = applicationId.trim();
  if (!id) {
    throw new Error("missing_application_id");
  }
  return `/v1/staff/certification/applications/${encodeURIComponent(id)}`;
}

function assertNestReviewPath(path: string): void {
  if (!path.startsWith("/v1/staff/certification/applications/")) {
    throw new Error("begin_review_routes_are_nest_only");
  }
}

function sanitizeReviewStatusResponse(
  data: ApplicationReviewStatusResponse,
): ApplicationReviewStatusResponse {
  return {
    contractVersion: data.contractVersion,
    applicationId: data.applicationId,
    applicationStatus: data.applicationStatus,
    reviewState: data.reviewState,
    assignmentStatus: data.assignmentStatus,
    assigneeReference: data.assigneeReference,
    reviewStartedAt: data.reviewStartedAt,
  };
}

/** Map API errors to i18n message keys for begin-review UI. */
export function mapStaffBeginReviewError(error: unknown): StaffBeginReviewError {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();

  const isConflictMessage =
    /coi|conflict of interest|separation|sod|segregation|already been started|already started/i.test(
      message,
    );

  if (normalized.status === 0 && normalized.code === "NETWORK_ERROR") {
    return {
      code: "NETWORK",
      messageKey: "review.errors.network",
      normalized,
    };
  }

  if (normalized.status === 403 && isConflictMessage) {
    return {
      code: "CONFLICT",
      messageKey: "review.errors.conflict",
      normalized,
    };
  }

  if (normalized.status === 403) {
    return {
      code: "FORBIDDEN",
      messageKey: "review.errors.forbidden",
      normalized,
    };
  }

  if (normalized.status === 409) {
    return {
      code: "ALREADY_IN_REVIEW",
      messageKey: "review.errors.alreadyInReview",
      normalized,
    };
  }

  if (normalized.status === 404) {
    return {
      code: "NOT_FOUND",
      messageKey: "review.errors.notFound",
      normalized,
    };
  }

  if (normalized.status === 400) {
    if (isConflictMessage) {
      return {
        code: "CONFLICT",
        messageKey: "review.errors.conflict",
        normalized,
      };
    }
    if (/submitted|accepted|assignment|precondition|draft|status/i.test(message)) {
      return {
        code: "PRECONDITION",
        messageKey: "review.errors.precondition",
        normalized,
      };
    }
    return {
      code: "VALIDATION",
      messageKey: "review.errors.validation",
      normalized,
    };
  }

  return {
    code: "UNKNOWN",
    messageKey: "review.errors.generic",
    normalized,
  };
}

export async function fetchApplicationReviewStatus(
  applicationId: string,
): Promise<ApplicationReviewStatusResponse> {
  const path = `${staffReviewBasePath(applicationId)}/review/status`;
  assertNestReviewPath(path);
  const { data } = await api.get<ApplicationReviewStatusResponse>(path);
  return sanitizeReviewStatusResponse(data);
}

export async function startApplicationReview(
  applicationId: string,
  acknowledgementNote?: string,
): Promise<ApplicationReviewStatusResponse> {
  const path = `${staffReviewBasePath(applicationId)}/review/start`;
  assertNestReviewPath(path);
  const { data } = await api.post<ApplicationReviewStatusResponse>(path, {
    ...(acknowledgementNote?.trim() ? { acknowledgementNote: acknowledgementNote.trim() } : {}),
  });
  return sanitizeReviewStatusResponse(data);
}

/** Assert review payloads never expose forbidden fields in client contract. */
export function assertReviewStatusResponseRedacted(
  value: ApplicationReviewStatusResponse,
): void {
  const json = JSON.stringify(value);
  if (/tenantId|tenant_id|userId|user_id|complianceSignature|compliance_signature/i.test(json)) {
    throw new Error("review_response_contains_forbidden_fields");
  }
}
