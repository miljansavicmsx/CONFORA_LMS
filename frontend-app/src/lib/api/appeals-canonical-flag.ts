/**
 * F4-8d — when true (default), appeals use canonical B14 Nest routes.
 * Set VITE_APPEALS_CANONICAL_ENABLED=false for legacy /v1/me|admin/appeals read aliases only.
 */
export function parseAppealsCanonicalEnabled(raw: string | undefined): boolean {
  const v = (raw ?? "true").trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") {
    return false;
  }
  return true;
}

export function isAppealsCanonicalEnabled(): boolean {
  return parseAppealsCanonicalEnabled(import.meta.env.VITE_APPEALS_CANONICAL_ENABLED);
}
