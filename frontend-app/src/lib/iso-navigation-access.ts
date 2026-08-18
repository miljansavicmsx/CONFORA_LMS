export type IsoNavContext = {
  readonly role: string | null | undefined;
  readonly cognitoGroups: readonly string[] | null | undefined;
  readonly permissionsSnapshot?: unknown;
};

function roles(ctx: IsoNavContext): ReadonlySet<string> {
  return new Set([ctx.role, ...(ctx.cognitoGroups ?? [])].map((value) => String(value ?? "").trim().toLowerCase()).filter(Boolean));
}
function hasAny(ctx: IsoNavContext, allowed: readonly string[]): boolean {
  const current = roles(ctx);
  return allowed.some((role) => current.has(role));
}

export function isSysAdmin(ctx: IsoNavContext): boolean { return hasAny(ctx, ["sys_admin", "staff_sysadm"]); }
export function isPlatformAdmin(ctx: IsoNavContext): boolean { return hasAny(ctx, ["admin"]); }
export function isDirector(ctx: IsoNavContext): boolean { return hasAny(ctx, ["director", "staff_dir"]); }
export function isTechnicalCommitteeMember(ctx: IsoNavContext): boolean { return hasAny(ctx, ["technical_committee", "com_tech"]); }
export function isCertificationCommitteeMember(ctx: IsoNavContext): boolean { return hasAny(ctx, ["certification_committee", "com_cert"]); }
export function isCertificationCandidate(ctx: IsoNavContext): boolean { return hasAny(ctx, ["candidate", "learner", "usr_cand", "usr_cert", "certified"]); }
/** Navigation filters only; protected APIs retain the actual authorization boundary. */
export function canAccessReportsDomain(ctx: IsoNavContext): boolean { return hasAny(ctx, ["admin", "sys_admin", "staff_sysadm", "director", "staff_dir", "quality_manager", "auditor", "staff_aud", "technical_committee", "com_tech"]); }
export function canAccessComplaintsDomain(ctx: IsoNavContext): boolean { return hasAny(ctx, ["admin", "sys_admin", "staff_sysadm", "director", "staff_dir", "quality_manager", "auditor", "staff_aud", "appeals_committee", "com_app", "com_imp"]); }
export function canAccessCertificationApplicationsNav(ctx: IsoNavContext): boolean { return hasAny(ctx, ["admin", "sys_admin", "staff_sysadm", "certification_committee", "com_cert", "training_admin", "staff_trainadm"]); }
export function canAccessKnowledgeWorkspace(ctx: IsoNavContext): boolean { return !isCertificationCandidate(ctx) && roles(ctx).size > 0; }
