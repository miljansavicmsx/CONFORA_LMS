export type AdminReportsAccessInput = {
  readonly roleFromProfile: string | null | undefined;
  readonly jwtRoles?: readonly string[] | null;
};

/**
 * Exact P08 report-query roles (T026).
 * Canonical lowercase forms plus 1:1 display aliases already used by frontend
 * directors/sysadmins/auditors (iso-navigation-access isDirector / sys_admin / auditor).
 * Bare "admin" is intentionally excluded (widening).
 */
const ALLOWED_ROLE_TOKENS = new Set([
  "staff_dir",
  "staff_sysadm",
  "staff_aud",
  "quality_manager",
  "director",
  "sys_admin",
  "auditor",
]);

export const T026_ALLOWED_ROLES = [
  "STAFF_DIR",
  "STAFF_SYSADM",
  "STAFF_AUD",
  "QUALITY_MANAGER",
] as const;

function normalizeRoleToken(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/** Client navigation / guard visibility only; report APIs enforce authorization. */
export function evaluateAdminReportsAccess(input: AdminReportsAccessInput): boolean {
  const candidates = [input.roleFromProfile, ...(input.jwtRoles ?? [])];
  return candidates.some((value) => ALLOWED_ROLE_TOKENS.has(normalizeRoleToken(value)));
}
