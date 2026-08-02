/**
 * P1-B5-2b — RBAC visibility for staff certification application assignment UI.
 * Mirrors backend `staff-cert-applications-assign.roles.ts` with legacy profile aliases.
 */

export const ASSIGNMENT_CREATOR_ROLES = ["STAFF_DIR", "STAFF_TRAINADM", "STAFF_SYSADM"] as const;

export const REVIEWER_ACCEPT_ROLES = ["STAFF_TRAINADM", "SME"] as const;

export const ASSIGNMENT_READ_ROLES = [
  "STAFF_DIR",
  "STAFF_TRAINADM",
  "STAFF_SYSADM",
  "SME",
] as const;

const LEGACY_PROFILE_TO_NEST: Readonly<Record<string, string>> = {
  director: "STAFF_DIR",
  sys_admin: "STAFF_SYSADM",
  training_admin: "STAFF_TRAINADM",
  cert_committee: "COM_CERT",
  staff_dir: "STAFF_DIR",
  staff_sysadm: "STAFF_SYSADM",
  staff_trainadm: "STAFF_TRAINADM",
  com_cert: "COM_CERT",
  sme: "SME",
  instructor: "SME",
  learner: "USR_CAND",
  candidate: "USR_CERT",
};

export type CertificationAssignmentRoleInput = {
  readonly jwtRoles?: readonly string[];
  readonly roleFromProfile?: string | null;
};

function normalizeNestRole(role: string): string {
  return role.trim().toUpperCase().replace(/-/g, "_");
}

/** Derive Nest RBAC role codes from JWT roles and optional primary profile role. */
export function resolveActorNestRoles(input: CertificationAssignmentRoleInput): readonly string[] {
  const out = new Set<string>();
  for (const raw of input.jwtRoles ?? []) {
    const normalized = normalizeNestRole(raw);
    if (normalized) out.add(normalized);
  }
  const profile = String(input.roleFromProfile ?? "")
    .trim()
    .toLowerCase();
  if (profile) {
    const mapped = LEGACY_PROFILE_TO_NEST[profile] ?? normalizeNestRole(profile);
    if (mapped) out.add(mapped);
  }
  return [...out];
}

export function actorHasNestRole(roles: readonly string[], allowed: readonly string[]): boolean {
  return roles.some((r) => (allowed as readonly string[]).includes(r));
}

/** COM_CERT without assignment-creator role cannot assign at application stage. */
export function isComCertOnlyAssigner(roles: readonly string[]): boolean {
  return roles.includes("COM_CERT") && !actorHasNestRole(roles, ASSIGNMENT_CREATOR_ROLES);
}

export function canShowAssignmentCreatorActions(roles: readonly string[]): boolean {
  if (isComCertOnlyAssigner(roles)) return false;
  return actorHasNestRole(roles, ASSIGNMENT_CREATOR_ROLES);
}

export function canReadAssignmentPanel(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, ASSIGNMENT_READ_ROLES);
}

export function canPerformReviewerAcceptDecline(roles: readonly string[]): boolean {
  return actorHasNestRole(roles, REVIEWER_ACCEPT_ROLES);
}

/** Matches backend `toAssigneeReference` — pseudonym for assignee identity in UI. */
export function toAssigneeReference(userId: string): string {
  const normalized = userId.replace(/-/g, "").toLowerCase();
  return `rev-${normalized.slice(0, 8)}`;
}

export function isCurrentUserAssignee(
  currentUserId: string | null | undefined,
  assigneeReference: string | null | undefined,
): boolean {
  if (!currentUserId?.trim() || !assigneeReference?.trim()) return false;
  return toAssigneeReference(currentUserId.trim()) === assigneeReference.trim();
}

export function canViewDeclineReason(roles: readonly string[]): boolean {
  return (
    actorHasNestRole(roles, ASSIGNMENT_CREATOR_ROLES) ||
    actorHasNestRole(roles, REVIEWER_ACCEPT_ROLES)
  );
}

export type PublicAssignmentState =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "DECLINED"
  | "REASSIGNED"
  | "IN_REVIEW";

export function resolvePublicAssignmentState(
  current: { readonly status: string } | null | undefined,
): PublicAssignmentState {
  if (!current) return "UNASSIGNED";
  const status = current.status.toUpperCase();
  if (status === "IN_REVIEW") return "IN_REVIEW";
  if (status === "ACCEPTED") return "ACCEPTED";
  if (status === "ASSIGNED") return "ASSIGNED";
  if (status === "DECLINED") return "DECLINED";
  if (status === "REASSIGNED") return "REASSIGNED";
  return "UNASSIGNED";
}
