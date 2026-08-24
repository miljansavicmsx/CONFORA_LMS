export function resolveActorNestRoles({ roleFromProfile }: { readonly roleFromProfile?: string | null }): readonly string[] {
  const role = typeof roleFromProfile === "string" ? roleFromProfile.trim().toLowerCase() : "";
  return role ? [role] : [];
}
