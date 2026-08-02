/**
 * P1-B6 — RBAC visibility for staff eligibility review UI.
 */

import {
  canPerformReviewerAcceptDecline,
  canReadAssignmentPanel,
  isComCertOnlyAssigner,
  isCurrentUserAssignee,
} from "@/lib/certification-assignment-access";

export function canReadEligibilityPanel(roles: readonly string[]): boolean {
  return canReadAssignmentPanel(roles);
}

export function shouldLoadEligibilityQuery(roles: readonly string[]): boolean {
  return canReadEligibilityPanel(roles) || canPerformReviewerAcceptDecline(roles);
}

export type EligibilityActionVisibilityInput = {
  readonly applicationStatus: string;
  readonly assignmentStatus: string | null | undefined;
  readonly assigneeReference: string | null | undefined;
  readonly eligibilityStatus: string;
  readonly nestRoles: readonly string[];
  readonly currentUserId: string | null;
};

export function canShowStartEligibilityAction(input: EligibilityActionVisibilityInput): boolean {
  if (isComCertOnlyAssigner(input.nestRoles)) return false;
  if (!canPerformReviewerAcceptDecline(input.nestRoles)) return false;
  if (input.applicationStatus.toUpperCase() !== "UNDER_REVIEW") return false;
  if (input.assignmentStatus?.toUpperCase() !== "IN_REVIEW") return false;
  if (input.eligibilityStatus !== "NOT_STARTED") return false;
  return isCurrentUserAssignee(input.currentUserId, input.assigneeReference ?? null);
}

export function canUpdateEligibilityCriteria(input: EligibilityActionVisibilityInput): boolean {
  if (isComCertOnlyAssigner(input.nestRoles)) return false;
  if (!canPerformReviewerAcceptDecline(input.nestRoles)) return false;
  if (input.applicationStatus.toUpperCase() !== "UNDER_REVIEW") return false;
  if (input.assignmentStatus?.toUpperCase() !== "IN_REVIEW") return false;
  if (input.eligibilityStatus !== "IN_PROGRESS") return false;
  return isCurrentUserAssignee(input.currentUserId, input.assigneeReference ?? null);
}
