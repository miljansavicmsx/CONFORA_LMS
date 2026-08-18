export type AdminEducationAccessInput = {
  readonly roleFromProfile: string | null | undefined;
  readonly jwtRoles?: readonly string[] | null;
};

const ALLOWED_ROLES = new Set(["admin", "sys_admin", "staff_sysadm", "training_admin", "staff_trainadm"]);

/** Client navigation visibility only; server-side authorization remains authoritative. */
export function evaluateAdminEducationAccess(input: AdminEducationAccessInput): boolean {
  return [input.roleFromProfile, ...(input.jwtRoles ?? [])].some((value) =>
    ALLOWED_ROLES.has(String(value ?? "").trim().toLowerCase()),
  );
}
