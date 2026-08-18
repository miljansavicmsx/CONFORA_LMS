export type SysAdminAccessInput = { readonly roleFromProfile: string | null | undefined };
const SYS_ADMIN_ROLES = new Set(["sys_admin", "staff_sysadm"]);

/** Client visibility predicate only; it never grants server-side administrator privileges. */
export function evaluateSysAdminAccess(input: SysAdminAccessInput): boolean {
  return SYS_ADMIN_ROLES.has(String(input.roleFromProfile ?? "").trim().toLowerCase());
}
