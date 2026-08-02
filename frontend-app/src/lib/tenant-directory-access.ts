/**
 * Pregled tenant zapisa (usklađeno s backend ``require_tenant_directory_read``).
 */

export type TenantDirectoryAccessInput = {
  readonly roleFromProfile: string | null | undefined;
};

export function evaluateTenantDirectoryAccess(input: TenantDirectoryAccessInput): boolean {
  const r = String(input.roleFromProfile ?? "")
    .trim()
    .toLowerCase();
  return r === "sys_admin" || r === "admin";
}
