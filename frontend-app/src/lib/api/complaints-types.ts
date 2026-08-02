/** B15 complaint types exposed to UI (subset). */

export const COMPLAINT_CASE_TYPES = [
  "PROCESS_COMPLAINT",
  "STAFF_CONDUCT_COMPLAINT",
  "EXAM_ADMINISTRATION_COMPLAINT",
  "CERTIFICATE_HOLDER_CONDUCT_COMPLAINT",
  "CERTIFICATE_MARK_MISUSE_COMPLAINT",
  "PUBLIC_VERIFICATION_COMPLAINT",
  "RECERTIFICATION_PROCESS_COMPLAINT",
  "APPEAL_HANDLING_COMPLAINT",
  "DATA_PROTECTION_COMPLAINT",
  "TECHNICAL_SERVICE_COMPLAINT",
  "OTHER_COMPLAINT",
] as const;

export type ComplaintCaseType = (typeof COMPLAINT_CASE_TYPES)[number];

export type ComplaintTargetType =
  | "CERTIFICATION_BODY"
  | "STAFF_MEMBER"
  | "ASSESSMENT_PROCESS"
  | "CERTIFICATE_HOLDER"
  | "CERTIFICATE_RECORD"
  | "PUBLIC_VERIFICATION_SERVICE"
  | "RECERTIFICATION_PROCESS"
  | "APPEALS_PROCESS"
  | "TECHNICAL_PLATFORM"
  | "OTHER";

/** Legacy UI category (form) — not used for appeals. */
export type CaseCategory =
  | "technical_support"
  | "complaint"
  | "appeal"
  | "improvement_proposal"
  | "training_proposal";

export type ComplaintStatus =
  | "SUBMITTED"
  | "ACKNOWLEDGED"
  | "VOIDED"
  | "UNDER_REVIEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";

/** View model for lists — maps B15 + legacy fields for existing UI. */
export interface ComplaintListItem {
  readonly complaintId: string;
  readonly publicReference: string;
  readonly userId: string;
  readonly category: string;
  readonly subject: string;
  readonly description: string;
  readonly status: ComplaintStatus | string;
  readonly assignedToUserId?: string | null;
  readonly assignedCommitteeId?: string | null;
  readonly resolutionSummary?: string | null;
  readonly certificationDecisionId?: string | null;
  readonly certificationApplicationId?: string | null;
  readonly certificateId?: string | null;
  readonly source?: string | null;
  readonly guestEmail?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly complaintType?: ComplaintCaseType | string;
  readonly complaintTargetType?: ComplaintTargetType | string;
}

export interface GrievanceEventItem {
  readonly eventId: string;
  readonly at: string;
  readonly eventType: string;
  readonly actorUserId?: string | null;
  readonly payload?: Record<string, unknown> | null;
}

export interface ComplaintDetail extends ComplaintListItem {
  readonly events: GrievanceEventItem[];
  readonly intakeChannel?: string | null;
  readonly isAnonymous?: boolean;
}

export type PublicComplaintSubmitResult = {
  readonly publicReference: string;
  readonly status: string;
};

export type PublicComplaintStatusResult = {
  readonly publicReference: string;
  readonly status: string;
  readonly submittedAt: string | null;
  readonly nextStep: string;
};
