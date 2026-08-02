/**
 * P1-B5-3b — RBAC visibility for begin-review UI.
 */

import {
  canPerformReviewerAcceptDecline,
  canReadAssignmentPanel,
  isComCertOnlyAssigner,
  isCurrentUserAssignee,
} from "@/lib/certification-assignment-access";

export function canReadReviewStatusPanel(roles: readonly string[]): boolean {
  return canReadAssignmentPanel(roles);
}

export type StartReviewVisibilityInput = {
  readonly applicationStatus: string;
  readonly assignmentStatus: string | null | undefined;
  readonly assigneeReference: string | null | undefined;
  readonly nestRoles: readonly string[];
  readonly currentUserId: string | null;
};

/** Start review only when SUBMITTED + ACCEPTED + assignee reviewer (not COM_CERT-only). */
export function canShowStartReviewAction(input: StartReviewVisibilityInput): boolean {
  if (isComCertOnlyAssigner(input.nestRoles)) return false;
  if (!canPerformReviewerAcceptDecline(input.nestRoles)) return false;
  if (input.applicationStatus.toUpperCase() !== "SUBMITTED") return false;
  if (input.assignmentStatus?.toUpperCase() !== "ACCEPTED") return false;
  return isCurrentUserAssignee(input.currentUserId, input.assigneeReference ?? null);
}

export function shouldLoadReviewStatusQuery(roles: readonly string[]): boolean {
  return canReadReviewStatusPanel(roles) || canPerformReviewerAcceptDecline(roles);
}
