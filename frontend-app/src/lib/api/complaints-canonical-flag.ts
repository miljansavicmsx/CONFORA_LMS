/**
 * F4-8c — when true (default), complaints use canonical B15 Nest routes.
 * Set VITE_COMPLAINTS_CANONICAL_ENABLED=false for legacy /v1/me|admin/complaints aliases only.
 */
export function parseComplaintsCanonicalEnabled(raw: string | undefined): boolean {
  const v = (raw ?? "true").trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") {
    return false;
  }
  return true;
}

export function isComplaintsCanonicalEnabled(): boolean {
  return parseComplaintsCanonicalEnabled(import.meta.env.VITE_COMPLAINTS_CANONICAL_ENABLED);
}
