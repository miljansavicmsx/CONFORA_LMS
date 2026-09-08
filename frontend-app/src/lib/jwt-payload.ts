/** Extract realm roles from a JWT access token (best-effort; empty when absent). */
export function extractRealmRolesFromToken(accessToken: string | null | undefined): string[] {
  if (!accessToken) {
    return [];
  }
  const parts = accessToken.split(".");
  if (parts.length < 2 || !parts[1]) {
    return [];
  }
  try {
    const json = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as {
      realm_access?: { roles?: string[] };
    };
    return json.realm_access?.roles ?? [];
  } catch {
    return [];
  }
}
