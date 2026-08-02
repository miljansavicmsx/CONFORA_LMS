/**
 * P1-B12 — RBAC visibility for staff certificate lifecycle UI.
 */

import { actorHasNestRole } from "@/lib/certification-assignment-access";

export const LIFECYCLE_READ_ROLES = [
  "STAFF_DIR",
  "STAFF_SYSADM",
  "LIFECYCLE_OFFICER",
  "STAFF_TRAINADM",
  "COM_CERT",
] as const;

export const LIFECYCLE_ACTIVATE_ROLES = ["STAFF_DIR", "STAFF_SYSADM", "LIFECYCLE_OFFICER"] as const;

export function canReadLifecyclePanel(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, LIFECYCLE_READ_ROLES);
}

export function shouldLoadLifecycleQuery(roles: readonly string[]): boolean {
  return canReadLifecyclePanel(roles);
}

export function canActivateCertificate(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, LIFECYCLE_ACTIVATE_ROLES);
}
