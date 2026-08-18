export type AdminReportsAccessInput = {
  readonly roleFromProfile: string | null | undefined;
  readonly jwtRoles?: readonly string[] | null;
};

const ALLOWED_ROLES = new Set(["admin", "sys_admin", "staff_sysadm", "director", "staff_dir", "quality_manager", "auditor", "staff_aud"]);

/** Client navigation visibility only; report APIs enforce actual authorization. */
export function evaluateAdminReportsAccess(input: AdminReportsAccessInput): boolean {
  return [input.roleFromProfile, ...(input.jwtRoles ?? [])].some((value) =>
    ALLOWED_ROLES.has(String(value ?? "").trim().toLowerCase()),
  );
}
