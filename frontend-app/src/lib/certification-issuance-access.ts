/**
 * P1-B11 — RBAC visibility for staff certificate issuance UI.
 */

import { actorHasNestRole } from "@/lib/certification-assignment-access";

export const ISSUANCE_READ_ROLES = [
  "STAFF_DIR",
  "STAFF_SYSADM",
  "STAFF_TRAINADM",
  "ISSUANCE_OFFICER",
] as const;

export const ISSUANCE_START_ROLES = [
  "STAFF_DIR",
  "STAFF_SYSADM",
  "ISSUANCE_OFFICER",
  "STAFF_TRAINADM",
] as const;

export const ISSUANCE_ISSUE_ROLES = ISSUANCE_START_ROLES;
export const ISSUANCE_DOCUMENT_ROLES = ISSUANCE_ISSUE_ROLES;

export function canReadIssuancePanel(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, ISSUANCE_READ_ROLES);
}

export function shouldLoadIssuanceQuery(roles: readonly string[]): boolean {
  return canReadIssuancePanel(roles);
}

export function canStartIssuance(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, ISSUANCE_START_ROLES);
}

export function canIssueCertificate(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, ISSUANCE_ISSUE_ROLES);
}

export function canGenerateCertificateDocument(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, ISSUANCE_DOCUMENT_ROLES);
}
