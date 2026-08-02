/**

 * Dekodiranje JWT payloada bez provjere potpisa — samo za UI (grupe, scope).

 * Autoritativna provjera ostaje na backendu.

 */

export function decodeJwtPayload(token: string): Record<string, unknown> | null {

  try {

    const parts = token.split(".");

    const payload = parts[1];

    if (parts.length < 2 || !payload) {

      return null;

    }

    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    const pad = (4 - (b64.length % 4)) % 4;

    const padded = b64 + "=".repeat(pad);

    const json = decodeURIComponent(

      atob(padded)

        .split("")

        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))

        .join(""),

    );

    return JSON.parse(json) as Record<string, unknown>;

  } catch {

    return null;

  }

}



/** Claim `cognito:groups` (ID token ili access token nakon Pre-Token Generation). */

export function extractCognitoGroupsFromPayload(payload: Record<string, unknown> | null): string[] {

  if (!payload) {

    return [];

  }

  const g = payload["cognito:groups"];

  if (Array.isArray(g)) {

    return g.map(String);

  }

  if (typeof g === "string" && g.trim()) {

    return [g.trim()];

  }

  return [];

}



export function extractCognitoGroupsFromToken(accessToken: string | null): string[] {

  if (!accessToken) {

    return [];

  }

  return extractCognitoGroupsFromPayload(decodeJwtPayload(accessToken));

}

/** Keycloak `realm_access.roles` or top-level `roles` claim (Nest JWT). */
export function extractRealmRolesFromPayload(payload: Record<string, unknown> | null): string[] {
  if (!payload) {
    return [];
  }

  const realmAccess = payload.realm_access;
  if (realmAccess && typeof realmAccess === "object") {
    const roles = (realmAccess as { roles?: unknown }).roles;
    if (Array.isArray(roles)) {
      return roles.map(String);
    }
  }

  const topLevel = payload.roles;
  if (Array.isArray(topLevel)) {
    return topLevel.map(String);
  }

  return [];

}

export function extractRealmRolesFromToken(accessToken: string | null): string[] {
  if (!accessToken) {
    return [];
  }
  return extractRealmRolesFromPayload(decodeJwtPayload(accessToken));
}



/** Oznaka organizacije iz JWT-a (samo prikaz u UI). */

export function extractTenantLabelFromToken(accessToken: string | null): string | null {

  if (!accessToken) {

    return null;

  }

  const p = decodeJwtPayload(accessToken);

  if (!p) {

    return null;

  }

  const raw =

    p.tenantId ??

    p.tenant_id ??

    p["custom:tenantId"] ??

    p["custom:tenant_id"] ??

    p.org_name ??

    p.organizationName;

  const s = String(raw ?? "").trim();

  return s.length > 0 ? s : null;

}


