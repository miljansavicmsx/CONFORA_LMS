import type { MePermissionsPayload } from "@/lib/permissions";

/** Ako API snapshot sadrži explicitno permission, koristi ga; inače RBAC fallback (non-breaking). */
export function hasPermission(snapshot: MePermissionsPayload | null | undefined, permission: string, fallback: boolean): boolean {
  const perms = snapshot?.permissions;
  if (perms?.length && perms.includes(permission)) {
    return true;
  }
  return fallback;
}

export function hasAnyPermission(
  snapshot: MePermissionsPayload | null | undefined,
  alternatives: readonly string[],
  fallback: boolean,
): boolean {
  const perms = snapshot?.permissions;
  if (perms?.length) {
    const hit = alternatives.some((p) => perms.includes(p));
    if (hit) {
      return true;
    }
  }
  return fallback;
}
