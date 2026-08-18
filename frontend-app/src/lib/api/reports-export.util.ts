/** Sensitive/detail report exports require an existing caller-provided business reason. */
export function requiresExportReason(reportKey: string, includeDetails = false): boolean {
  return includeDetails || reportKey === "audit";
}
