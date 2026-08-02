/**
 * P1-B5-2b — Nest-only staff certification application assignment API client.
 * No legacy fallback for assignment mutations or reads.
 */

import { api } from "@/lib/api";
import { normalizeApiError, type NormalizedApiError } from "@/lib/api/api-error";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ReviewAssignmentItem = {
  readonly assignmentId: string;
  readonly applicationId: string;
  readonly status: "ASSIGNED" | "ACCEPTED" | "DECLINED" | "REASSIGNED" | "IN_REVIEW";
  readonly assigneeReference: string;
  readonly assignmentType: string;
  readonly rationale: string | null;
  readonly declineReason: string | null;
  readonly assignedAt: string;
  readonly updatedAt: string;
};

export type ApplicationAssignmentResponse = {
  readonly contractVersion: string;
  readonly applicationId: string;
  readonly applicationStatus: string;
  readonly current: ReviewAssignmentItem | null;
  readonly history: readonly ReviewAssignmentItem[];
};

export type StaffAssignmentErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "NETWORK"
  | "UNKNOWN";

export type StaffAssignmentError = {
  readonly code: StaffAssignmentErrorCode;
  readonly messageKey: string;
  readonly normalized: NormalizedApiError;
};

function staffAssignmentBasePath(applicationId: string): string {
  const id = applicationId.trim();
  if (!id) {
    throw new Error("missing_application_id");
  }
  return `/v1/staff/certification/applications/${encodeURIComponent(id)}`;
}

function assertNestAssignmentPath(path: string): void {
  if (!path.startsWith("/v1/staff/certification/applications/")) {
    throw new Error("assignment_routes_are_nest_only");
  }
}

function sanitizeAssignmentResponse(data: ApplicationAssignmentResponse): ApplicationAssignmentResponse {
  return {
    contractVersion: data.contractVersion,
    applicationId: data.applicationId,
    applicationStatus: data.applicationStatus,
    current: data.current,
    history: data.history,
  };
}

/** Map API errors to i18n message keys for assignment UI. */
export function mapStaffAssignmentError(error: unknown): StaffAssignmentError {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();

  const isConflictMessage =
    /coi|conflict of interest|separation|sod|segregation|com_cert-only|applicant/i.test(message);

  if (normalized.status === 0 && normalized.code === "NETWORK_ERROR") {
    return {
      code: "NETWORK",
      messageKey: "assignment.errors.network",
      normalized,
    };
  }

  if (normalized.status === 403 && isConflictMessage) {
    return {
      code: "CONFLICT",
      messageKey: "assignment.errors.conflict",
      normalized,
    };
  }

  if (normalized.status === 403) {
    return {
      code: "FORBIDDEN",
      messageKey: "assignment.errors.forbidden",
      normalized,
    };
  }

  if (
    normalized.status === 409 ||
    (normalized.status === 400 && isConflictMessage)
  ) {
    return {
      code: "CONFLICT",
      messageKey: "assignment.errors.conflict",
      normalized,
    };
  }

  if (normalized.status === 404) {
    return {
      code: "NOT_FOUND",
      messageKey: "assignment.errors.notFound",
      normalized,
    };
  }

  if (normalized.status === 400 || normalized.code === "VALIDATION_ERROR") {
    return {
      code: "VALIDATION",
      messageKey: "assignment.errors.validation",
      normalized,
    };
  }

  return {
    code: "UNKNOWN",
    messageKey: "assignment.errors.generic",
    normalized,
  };
}

export async function fetchApplicationAssignment(
  applicationId: string,
): Promise<ApplicationAssignmentResponse> {
  const path = `${staffAssignmentBasePath(applicationId)}/assignment`;
  assertNestAssignmentPath(path);
  const { data } = await api.get<ApplicationAssignmentResponse>(path);
  return sanitizeAssignmentResponse(data);
}

export async function assignApplicationReviewer(
  applicationId: string,
  reviewerId: string,
  rationale?: string,
): Promise<ApplicationAssignmentResponse> {
  const assigneeId = reviewerId.trim();
  if (!UUID_PATTERN.test(assigneeId)) {
    throw Object.assign(new Error("invalid_reviewer_id"), {
      staffAssignmentCode: "VALIDATION" as const,
      messageKey: "assignment.errors.reviewerIdRequired",
    });
  }

  const path = `${staffAssignmentBasePath(applicationId)}/assign`;
  assertNestAssignmentPath(path);
  const { data } = await api.post<ApplicationAssignmentResponse>(path, {
    assigneeId,
    ...(rationale?.trim() ? { rationale: rationale.trim() } : {}),
  });
  return sanitizeAssignmentResponse(data);
}

export async function acceptApplicationAssignment(
  applicationId: string,
  coiComment?: string,
): Promise<ApplicationAssignmentResponse> {
  const path = `${staffAssignmentBasePath(applicationId)}/assignment/accept`;
  assertNestAssignmentPath(path);
  const { data } = await api.post<ApplicationAssignmentResponse>(path, {
    coiDeclarationAccepted: true,
    ...(coiComment?.trim() ? { coiComment: coiComment.trim() } : {}),
  });
  return sanitizeAssignmentResponse(data);
}

export async function declineApplicationAssignment(
  applicationId: string,
  reason: string,
): Promise<ApplicationAssignmentResponse> {
  const declineReason = reason.trim();
  if (declineReason.length < 3) {
    throw Object.assign(new Error("decline_reason_required"), {
      staffAssignmentCode: "VALIDATION" as const,
      messageKey: "assignment.errors.declineReasonRequired",
    });
  }

  const path = `${staffAssignmentBasePath(applicationId)}/assignment/decline`;
  assertNestAssignmentPath(path);
  const { data } = await api.post<ApplicationAssignmentResponse>(path, { declineReason });
  return sanitizeAssignmentResponse(data);
}

/** Assert assignment payloads never expose forbidden fields in client contract. */
export function assertAssignmentResponseRedacted(value: ApplicationAssignmentResponse): void {
  const json = JSON.stringify(value);
  if (/tenantId|tenant_id|userId|user_id|complianceSignature|compliance_signature/i.test(json)) {
    throw new Error("assignment_response_contains_forbidden_fields");
  }
}
