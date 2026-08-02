import { resolveActorNestRoles } from "@/lib/certification-assignment-access";

/** Mirrors Nest `CourseAuthoringController` list/detail RBAC. */
export const ADMIN_EDUCATION_READ_ROLES = [
  "STAFF_TRAINADM",
  "STAFF_SYSADM",
  "STAFF_DIR",
  "COM_TECH",
  "STAFF_AUD",
  "SME",
] as const;

export type AdminEducationAccessInput = {
  readonly jwtRoles?: readonly string[];
  readonly roleFromProfile?: string | null;
};

export function evaluateAdminEducationAccess(input: AdminEducationAccessInput): boolean {
  const roles = resolveActorNestRoles(input);
  return roles.some((r) => (ADMIN_EDUCATION_READ_ROLES as readonly string[]).includes(r));
}
