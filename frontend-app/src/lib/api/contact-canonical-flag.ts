/**
 * F4-8b — when true (default), public contact uses POST /v1/public/contact-requests.
 * Set VITE_CONTACT_CANONICAL_ENABLED=false to use legacy multipart alias only.
 */
export function parseContactCanonicalEnabled(raw: string | undefined): boolean {
  const v = (raw ?? "true").trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") {
    return false;
  }
  return true;
}

export function isContactCanonicalEnabled(): boolean {
  return parseContactCanonicalEnabled(import.meta.env.VITE_CONTACT_CANONICAL_ENABLED);
}
