import { resolveActorNestRoles } from "@/lib/certification-assignment-access";

/** Mirrors Nest `ADMIN_REPORTS_READ_ROLES`. */
export const ADMIN_REPORTS_READ_NEST_ROLES = [
  "STAFF_DIR",
  "STAFF_SYSADM",
  "STAFF_AUD",
  "STAFF_TRAINADM",
] as const;

export type AdminReportsAccessInput = {
  readonly jwtRoles?: readonly string[];
  readonly roleFromProfile?: string | null;
};

export function evaluateAdminReportsAccess(input: AdminReportsAccessInput): boolean {
  const roles = resolveActorNestRoles(input);
  return roles.some((r) => (ADMIN_REPORTS_READ_NEST_ROLES as readonly string[]).includes(r));
}
