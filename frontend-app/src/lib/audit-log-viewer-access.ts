/** Pregled audit logova — `require_audit_log_viewer` na backendu. */

export type AuditLogViewerAccessInput = {
  readonly roleFromProfile: string | null | undefined;
};

export function evaluateAuditLogViewerAccess(input: AuditLogViewerAccessInput): boolean {
  const r = String(input.roleFromProfile ?? "")
    .trim()
    .toLowerCase();
  return r === "sys_admin" || r === "director";
}
