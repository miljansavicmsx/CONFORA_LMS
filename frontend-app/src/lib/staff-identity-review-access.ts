import { resolveActorNestRoles } from "@/lib/certification-assignment-access";

/** RBAC-API-1 — manual identity review queue (D-04). */
export const IDENTITY_QUEUE_READ_ROLES = ["STAFF_ID_VERIFIER", "STAFF_DIR"] as const;
export const IDENTITY_QUEUE_WRITE_ROLES = ["STAFF_ID_VERIFIER"] as const;

export type IdentityQueueAccessInput = {
  readonly jwtRoles: readonly string[];
  readonly roleFromProfile: string | null | undefined;
};

function nestRoles(input: IdentityQueueAccessInput): readonly string[] {
  return resolveActorNestRoles({
    jwtRoles: input.jwtRoles,
    roleFromProfile: input.roleFromProfile,
  });
}

export function canReadStaffIdentityQueue(input: IdentityQueueAccessInput): boolean {
  const roles = nestRoles(input);
  return IDENTITY_QUEUE_READ_ROLES.some((r) => roles.includes(r));
}

export function canPerformStaffIdentityReview(input: IdentityQueueAccessInput): boolean {
  const roles = nestRoles(input);
  return IDENTITY_QUEUE_WRITE_ROLES.some((r) => roles.includes(r));
}

export function shouldLoadStaffIdentityQueue(input: IdentityQueueAccessInput): boolean {
  return canReadStaffIdentityQueue(input);
}
