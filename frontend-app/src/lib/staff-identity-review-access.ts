export type StaffIdentityReviewAccessInput = {
  readonly roleFromProfile: string | null | undefined;
  readonly jwtRoles?: readonly string[] | null;
};

const READ_ROLES = new Set(["admin", "sys_admin", "staff_sysadm", "director", "staff_dir"]);
const PERFORM_ROLES = new Set(["admin", "sys_admin", "staff_sysadm"]);

function hasRole(input: StaffIdentityReviewAccessInput, allowed: ReadonlySet<string>): boolean {
  return [input.roleFromProfile, ...(input.jwtRoles ?? [])].some((value) =>
    allowed.has(String(value ?? "").trim().toLowerCase()),
  );
}

/** UI visibility only; privileged identity operations require server authorization. */
export function canReadStaffIdentityQueue(input: StaffIdentityReviewAccessInput): boolean { return hasRole(input, READ_ROLES); }
export function canPerformStaffIdentityReview(input: StaffIdentityReviewAccessInput): boolean { return hasRole(input, PERFORM_ROLES); }
