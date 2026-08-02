/**
 * Pristup rutama rezerviranim za ulogu `sys_admin` (usklađeno s backend `require_sys_admin`).
 */

export type SysAdminAccessInput = {
  readonly roleFromProfile: string | null | undefined;
};

export function evaluateSysAdminAccess(input: SysAdminAccessInput): boolean {
  const r = String(input.roleFromProfile ?? "")
    .trim()
    .toLowerCase();
  return r === "sys_admin";
}
