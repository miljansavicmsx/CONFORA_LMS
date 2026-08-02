/** Korisnički registar — backend `require_user_registry_manager`. */

export type UserRegistryAccessInput = {
  readonly roleFromProfile: string | null | undefined;
  readonly jwtRoles?: readonly string[];
};

export function evaluateUserRegistryAccess(input: UserRegistryAccessInput): boolean {
  const r = String(input.roleFromProfile ?? "")
    .trim()
    .toLowerCase();
  if (r === "sys_admin" || r === "admin" || r === "director" || r === "staff_sysadm") {
    return true;
  }
  const jwt = input.jwtRoles ?? [];
  return jwt.some((role) => {
    const u = role.trim().toUpperCase();
    return u === "STAFF_SYSADM" || u === "STAFF_DIR";
  });
}
