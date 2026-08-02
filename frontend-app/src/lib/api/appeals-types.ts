/** B14 appeal types exposed to UI (subset). */

export const APPEAL_CASE_TYPES = [
  "CERTIFICATION_DECISION_APPEAL",
  "EXAM_RESULT_APPEAL",
  "ELIGIBILITY_APPEAL",
  "RECERTIFICATION_DECISION_APPEAL",
  "LIFECYCLE_ACTION_APPEAL",
  "ADMINISTRATIVE_REJECTION_APPEAL",
] as const;

export type AppealCaseType = (typeof APPEAL_CASE_TYPES)[number];

export type AppealStatus =
  | "SUBMITTED"
  | "ACKNOWLEDGED"
  | "VOIDED"
  | "PENDING_ASSIGNMENT"
  | "UNDER_REVIEW"
  | "DECIDED"
  | "CLOSED"
  | "WITHDRAWN";

/** Legacy UI outcome labels — mapped to B14 on canonical record. */
export type AppealOutcome = "UPHELD" | "DISMISSED";

export type B14DecisionOutcome =
  | "APPEAL_UPHELD"
  | "APPEAL_REJECTED"
  | "APPEAL_PARTIALLY_UPHELD"
  | "APPEAL_REMANDED_FOR_REVIEW"
  | "APPEAL_WITHDRAWN";

/** View model for lists — maps B14 + legacy fields for existing UI. */
export interface AppealListItem {
  readonly appealId: string;
  readonly userId: string;
  readonly certificationDecisionId: string;
  readonly certificationApplicationId?: string | null;
  readonly status: AppealStatus | string;
  readonly summary: string;
  readonly grounds: string;
  readonly outcome?: AppealOutcome | B14DecisionOutcome | string | null;
  readonly outcomeComment?: string | null;
  readonly assignedCommitteeId?: string | null;
  readonly assignedHandlerUserId?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly appealType?: AppealCaseType | string;
  readonly candidateReference?: string;
  readonly appealedObjectType?: string | null;
  readonly appealedObjectId?: string | null;
}

export interface GrievanceEventItem {
  readonly eventId: string;
  readonly at: string;
  readonly eventType: string;
  readonly actorUserId?: string | null;
  readonly payload?: Record<string, unknown> | null;
}

export interface AppealDetail extends AppealListItem {
  readonly events: GrievanceEventItem[];
  readonly requestedRemedy?: string | null;
  readonly certificateNumber?: string | null;
  readonly relatedCertificationDecisionReviewId?: string | null;
}
