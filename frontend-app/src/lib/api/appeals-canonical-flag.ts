/**
 * Controls the route family used for appeal reads. This is a client routing
 * choice only; it neither grants authority nor evaluates an appeal outcome.
 */
export function parseAppealsCanonicalEnabled(raw: string | undefined): boolean {
  const value = (raw ?? "true").trim().toLowerCase();
  return value !== "false" && value !== "0" && value !== "no";
}

export function isAppealsCanonicalEnabled(): boolean {
  return parseAppealsCanonicalEnabled(import.meta.env.VITE_APPEALS_CANONICAL_ENABLED);
}
