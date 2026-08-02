/**
 * P1-B6 — Nest-only staff certification eligibility review API client.
 */

import { api } from "@/lib/api";
import { normalizeApiError, type NormalizedApiError } from "@/lib/api/api-error";

export type EligibilityReviewStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type EligibilityCriterionStatus = "PENDING" | "MET" | "NOT_MET" | "NOT_APPLICABLE";

export type EligibilityRecommendationValue =
  | "ELIGIBLE"
  | "CONDITIONALLY_ELIGIBLE"
  | "INSUFFICIENT_EVIDENCE"
  | "NOT_ELIGIBLE";

export type EligibilityCriterionItem = {
  readonly criterionCode: string;
  readonly criterionName: string;
  readonly status: EligibilityCriterionStatus;
  readonly reviewerNotes: string | null;
  readonly evidenceRefs: readonly string[];
};

export type EligibilityRecommendation = {
  readonly value: EligibilityRecommendationValue;
  readonly reviewerNotes: string | null;
  readonly conditionText: string | null;
  readonly recommendedAt: string;
};

export type EligibilityReviewResponse = {
  readonly contractVersion: string;
  readonly applicationId: string;
  readonly applicationStatus: string;
  readonly eligibilityReviewId: string | null;
  readonly eligibilityStatus: EligibilityReviewStatus;
  readonly reviewerReference: string | null;
  readonly reviewStartedAt: string | null;
  readonly reviewCompletedAt: string | null;
  readonly notes: string | null;
  readonly recommendation: EligibilityRecommendation | null;
  readonly criteria: readonly EligibilityCriterionItem[];
};

export type StaffEligibilityErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PRECONDITION"
  | "VALIDATION"
  | "NETWORK"
  | "UNKNOWN";

export type StaffEligibilityError = {
  readonly code: StaffEligibilityErrorCode;
  readonly messageKey: string;
  readonly normalized: NormalizedApiError;
};

function staffEligibilityBasePath(applicationId: string): string {
  const id = applicationId.trim();
  if (!id) {
    throw new Error("missing_application_id");
  }
  return `/v1/staff/certification/applications/${encodeURIComponent(id)}/eligibility`;
}

function assertNestEligibilityPath(path: string): void {
  if (!path.startsWith("/v1/staff/certification/applications/")) {
    throw new Error("eligibility_routes_are_nest_only");
  }
}

function sanitizeEligibilityResponse(data: EligibilityReviewResponse): EligibilityReviewResponse {
  return {
    contractVersion: data.contractVersion,
    applicationId: data.applicationId,
    applicationStatus: data.applicationStatus,
    eligibilityReviewId: data.eligibilityReviewId,
    eligibilityStatus: data.eligibilityStatus,
    reviewerReference: data.reviewerReference,
    reviewStartedAt: data.reviewStartedAt,
    reviewCompletedAt: data.reviewCompletedAt,
    notes: data.notes,
    recommendation: data.recommendation,
    criteria: data.criteria,
  };
}

export function mapStaffEligibilityError(error: unknown): StaffEligibilityError {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();

  if (normalized.status === 0 && normalized.code === "NETWORK_ERROR") {
    return { code: "NETWORK", messageKey: "eligibility.errors.network", normalized };
  }
  if (normalized.status === 403) {
    return { code: "FORBIDDEN", messageKey: "eligibility.errors.forbidden", normalized };
  }
  if (normalized.status === 404) {
    return { code: "NOT_FOUND", messageKey: "eligibility.errors.notFound", normalized };
  }
  if (normalized.status === 409) {
    return { code: "CONFLICT", messageKey: "eligibility.errors.conflict", normalized };
  }
  if (normalized.status === 400) {
    if (/under_review|in_review|precondition|assignment|status/i.test(message)) {
      return { code: "PRECONDITION", messageKey: "eligibility.errors.precondition", normalized };
    }
    return { code: "VALIDATION", messageKey: "eligibility.errors.validation", normalized };
  }
  return { code: "UNKNOWN", messageKey: "eligibility.errors.generic", normalized };
}

export async function fetchApplicationEligibility(
  applicationId: string,
): Promise<EligibilityReviewResponse> {
  const path = staffEligibilityBasePath(applicationId);
  assertNestEligibilityPath(path);
  const { data } = await api.get<EligibilityReviewResponse>(path);
  return sanitizeEligibilityResponse(data);
}

export async function startEligibilityReview(
  applicationId: string,
  notes?: string,
): Promise<EligibilityReviewResponse> {
  const path = `${staffEligibilityBasePath(applicationId)}/start`;
  assertNestEligibilityPath(path);
  const { data } = await api.post<EligibilityReviewResponse>(path, {
    ...(notes?.trim() ? { notes: notes.trim() } : {}),
  });
  return sanitizeEligibilityResponse(data);
}

export async function updateEligibilityCriterion(
  applicationId: string,
  criterionCode: string,
  body: {
    status: EligibilityCriterionStatus;
    reviewerNotes?: string | null;
    evidenceRefs?: readonly string[];
  },
): Promise<EligibilityReviewResponse> {
  const path = `${staffEligibilityBasePath(applicationId)}/criteria/${encodeURIComponent(criterionCode)}`;
  assertNestEligibilityPath(path);
  const { data } = await api.patch<EligibilityReviewResponse>(path, body);
  return sanitizeEligibilityResponse(data);
}
