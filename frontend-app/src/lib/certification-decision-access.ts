/**
 * P1-B10 / RBAC-API-1 — RBAC visibility for staff certification decision UI (D-01).
 */
import type {
  CertificationDecisionReviewStatus,
  CertificationDecisionValidationDetail,
} from "@/lib/api-staff-cert-decision";
import { actorHasNestRole } from "@/lib/certification-assignment-access";

export const DECISION_READ_ROLES = ["COM_CERT", "STAFF_DIR", "STAFF_SYSADM", "STAFF_TRAINADM"] as const;
export const DECISION_START_ROLES = ["COM_CERT"] as const;
export const DECISION_OUTCOME_ROLES = ["COM_CERT"] as const;
export const DECISION_VALIDATE_ROLES = ["STAFF_DIR", "STAFF_SYSADM"] as const;

export function canReadDecisionPanel(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, DECISION_READ_ROLES);
}

export function shouldLoadDecisionQuery(roles: readonly string[]): boolean {
  return canReadDecisionPanel(roles);
}

export function canStartDecisionReview(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, DECISION_START_ROLES);
}

export function canRecordDecisionOutcome(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, DECISION_OUTCOME_ROLES);
}

export function canValidateDecision(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, DECISION_VALIDATE_ROLES);
}

export type QuorumFinalizeState = {
  readonly allowed: boolean;
  readonly blockedReason: "quorum_missing" | "quorum_insufficient" | "not_in_review" | null;
};

export function evaluateQuorumFinalizeState(
  reviewStatus: CertificationDecisionReviewStatus | string,
  validation: CertificationDecisionValidationDetail | null | undefined,
): QuorumFinalizeState {
  if (reviewStatus !== "IN_REVIEW") {
    return { allowed: false, blockedReason: "not_in_review" };
  }
  if (!validation) {
    return { allowed: false, blockedReason: "quorum_missing" };
  }
  if (!validation.quorumConfirmed || validation.quorumCount < validation.requiredQuorum) {
    return {
      allowed: false,
      blockedReason: validation.quorumCount > 0 ? "quorum_insufficient" : "quorum_missing",
    };
  }
  return { allowed: true, blockedReason: null };
}

export function canFinalizeDecisionOutcome(
  roles: readonly string[],
  reviewStatus: CertificationDecisionReviewStatus | string,
  validation: CertificationDecisionValidationDetail | null | undefined,
): boolean {
  return canRecordDecisionOutcome(roles) && evaluateQuorumFinalizeState(reviewStatus, validation).allowed;
}

export function isDirectorGovernanceOnlyDecisionView(roles: readonly string[]): boolean {
  return (
    actorHasNestRole(roles, ["STAFF_DIR"]) &&
    !canStartDecisionReview(roles) &&
    !canRecordDecisionOutcome(roles)
  );
}
