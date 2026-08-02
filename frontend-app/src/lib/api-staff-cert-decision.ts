/**
 * P1-B10 — Nest staff certification decision API client.
 */

import { api } from "@/lib/api";
import { normalizeApiError, type NormalizedApiError } from "@/lib/api/api-error";

export type CertificationDecisionReviewStatus = "NOT_STARTED" | "IN_REVIEW" | "DECIDED" | "VOIDED";

export type CertificationDecisionOutcome =
  | "CERTIFICATION_APPROVED"
  | "CERTIFICATION_DENIED"
  | "CERTIFICATION_DEFERRED"
  | "CERTIFICATION_RETURNED_FOR_REVIEW";

export type CertificationDecisionValidationStatus =
  | "PENDING_VALIDATION"
  | "VALIDATED"
  | "REJECTED";

export type CertificationDecisionValidationDetail = {
  readonly id: string;
  readonly certificationDecisionReviewId: string;
  readonly validationStatus: CertificationDecisionValidationStatus;
  readonly quorumConfirmed: boolean;
  readonly quorumCount: number;
  readonly requiredQuorum: number;
  readonly validatedByReference: string | null;
  readonly validatedAt: string | null;
  readonly validationNotes: string | null;
  readonly rejectionReason: string | null;
  readonly memberAttestations: readonly {
    readonly id: string;
    readonly memberReference: string;
    readonly attestation: string;
    readonly notes: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
  }[];
};
export type CertificationDecisionReview = {
  readonly id: string;
  readonly applicationId: string;
  readonly status: CertificationDecisionReviewStatus;
  readonly outcome: CertificationDecisionOutcome | null;
  readonly reason: string | null;
  readonly startedAt: string | null;
  readonly decidedAt: string | null;
};

export type CertificationDecisionResponse = {
  readonly contractVersion: string;
  readonly applicationId: string;
  readonly reviewStarted: boolean;
  readonly certificationDecisionReview: CertificationDecisionReview | null;
  readonly eligibilityRecommendationSnapshot?: string | null;
};

export type CertificationDecisionValidationResponse = {
  readonly contractVersion: string;
  readonly validationAvailable: boolean;
  readonly certificationDecisionValidation: CertificationDecisionValidationDetail | null;
};

function decisionBasePath(applicationId: string): string {
  return `/v1/staff/certification-decisions/${encodeURIComponent(applicationId.trim())}`;
}

export function mapStaffDecisionError(error: unknown): {
  code: string;
  messageKey: string;
  normalized: NormalizedApiError;
} {
  const normalized = normalizeApiError(error);
  const message = normalized.message ?? "";
  if (normalized.status === 403) {
    return { code: "FORBIDDEN", messageKey: "decision.errors.forbidden", normalized };
  }
  if (normalized.status === 404) {
    return { code: "NOT_FOUND", messageKey: "decision.errors.notFound", normalized };
  }
  if (normalized.status === 409) {
    return { code: "CONFLICT", messageKey: "decision.errors.conflict", normalized };
  }
  if (normalized.status === 400 && /quorum|precondition|validated|eligibility/i.test(message)) {
    return { code: "PRECONDITION", messageKey: "decision.errors.precondition", normalized };
  }
  return { code: "UNKNOWN", messageKey: "decision.errors.generic", normalized };
}

export async function fetchCertificationDecision(
  applicationId: string,
): Promise<CertificationDecisionResponse> {
  const { data } = await api.get<CertificationDecisionResponse>(decisionBasePath(applicationId));
  return data;
}

export async function fetchCertificationDecisionValidation(
  applicationId: string,
): Promise<CertificationDecisionValidationResponse> {
  const { data } = await api.get<CertificationDecisionValidationResponse>(
    `${decisionBasePath(applicationId)}/validation`,
  );
  return data;
}

export async function startCertificationDecisionReview(
  applicationId: string,
  body?: { notes?: string; examResultId?: string },
): Promise<CertificationDecisionResponse> {
  const { data } = await api.post<CertificationDecisionResponse>(
    `${decisionBasePath(applicationId)}/start`,
    body ?? {},
  );
  return data;
}

export async function recordCertificationDecisionOutcome(
  applicationId: string,
  body: { outcome: CertificationDecisionOutcome; reason?: string; nextReviewAction?: string },
): Promise<CertificationDecisionResponse> {
  const { data } = await api.post<CertificationDecisionResponse>(
    `${decisionBasePath(applicationId)}/outcome`,
    body,
  );
  return data;
}
