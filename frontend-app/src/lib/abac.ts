/**
 * Klijentski ABAC sloj iznad RBAC snapshota (GET /api/auth/me/permissions).
 * Heuristički pregled UX-a (sidebar akcije, read-only način, tooltip kodovi).
 * Kanonsko pravilo ostaje na backend guardovima i na POST /api/auth/evaluate-resource-access.
 */

import type { AxiosInstance } from "axios";

import { hasAnyPermission, hasPermission } from "@/lib/authorization";
import type { MePermissionsPayload } from "@/lib/permissions";
import {
  PERM_AUDIT_READ,
  PERM_AUDIT_STRUCTURE_MANAGE,
  PERM_CERTIFICATE_ISSUE,
  PERM_CERTIFICATION_APPLICATION_APPROVE,
  PERM_CERTIFICATION_APPLICATION_READ,
  PERM_CERTIFICATION_APPLICATION_REVIEW,
  PERM_CERTIFICATION_APPLICATION_ASSIGN,
  PERM_CERTIFICATION_DECISION_VOTE,
  PERM_GOVERNANCE_HUB_ACCESS,
  PERM_IMPARTIALITY_ACCEPT,
  PERM_IMPARTIALITY_READ,
  PERM_RISK_ACCEPT,
  PERM_RISK_REGISTER_READ,
} from "@/lib/permissions";

export const CERTIFICATION_APPLICATION = "CERTIFICATION_APPLICATION";
export const CERTIFICATION_DECISION = "CERTIFICATION_DECISION";
export const RISK_REGISTER_ENTRY = "RISK_REGISTER_ENTRY";
export const IMPARTIALITY_THREAT = "IMPARTIALITY_THREAT";
export const AUDIT_ARTIFACT = "AUDIT_ARTIFACT";
/** Strukturirani ISO zapisi u ``audit_events`` tablici — paritet s backend ``AUDIT_EVENT``. */
export const AUDIT_EVENT = "AUDIT_EVENT";
export const PERSON_CERTIFICATION = "PERSON_CERTIFICATION";
export const MANAGEMENT_REVIEW_RECORD = "MANAGEMENT_REVIEW_RECORD";

export type ResourceAbacMeta = {
  viewerUserId: string | null | undefined;
  resourceTenantId?: string | null;
  ownerUserId?: string | null;
  assignedUserIds?: readonly string[];
  reviewerUserIds?: readonly string[];
  committeeIds?: readonly string[];
  /** Kad UI poznaje Dynamo ``certificationCommitteeIds``. */
  actorCommitteeIds?: readonly string[];
  confidentialityLevel?: string | null;
  sodBlocked?: boolean;
};

/** Odgovarajući odgovoru ``POST /api/auth/evaluate-resource-access``. */
export type AuthorizationDecisionLite = {
  readonly allowed: boolean;
  readonly reasonCode?: string | null;
  readonly reasonMessage?: string | null;
  readonly blockedBySod?: boolean;
  readonly blockedByCompetence?: boolean;
  readonly blockedByTenant?: boolean;
};

export type EvaluateResourceAccessRequest = {
  resourceType: string;
  resourceId: string;
  action: string;
  sodBlocked?: boolean;
  /** Slanje samo kad je izvršavanje na Vite dev serveru (`import.meta.env.DEV`). */
  useDebugResourceContext?: boolean;
  debugResourceContext?: Record<string, unknown>;
};

/** Payload za POST /api/auth/evaluate-resource-access (bez punog ResourceAccessContext iz klijenta). */
export function buildEvaluateResourceAccessPayload(req: EvaluateResourceAccessRequest): Record<string, unknown> {
  const body: Record<string, unknown> = {
    resourceType: req.resourceType,
    resourceId: req.resourceId,
    action: req.action,
  };
  if (req.sodBlocked) body.sodBlocked = true;
  const dbg = typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);
  if (dbg && req.useDebugResourceContext && req.debugResourceContext && Object.keys(req.debugResourceContext).length > 0) {
    body.useDebugResourceContext = true;
    body.debugResourceContext = req.debugResourceContext;
  }
  return body;
}

export async function evaluateResourceAccess(
  client: AxiosInstance,
  req: EvaluateResourceAccessRequest,
): Promise<AuthorizationDecisionLite> {
  const { data } = await client.post<AuthorizationDecisionLite>("/api/auth/evaluate-resource-access", buildEvaluateResourceAccessPayload(req));
  return data;
}

export type AbacActionHint = {
  allowed: boolean;
  reasonCode?: string;
  reasonMessage?: string;
};

/** read-only ako korisnik vidi resurs, ali nema mutate granule. */
export type ResourceInteractionMode = "hidden" | "readonly" | "full";

function normSet(xs: readonly string[] | undefined): Set<string> {
  return new Set((xs ?? []).map((x) => String(x).trim()).filter(Boolean));
}

export function canonicalRoleSet(snapshot: MePermissionsPayload | null | undefined, isoRolesExtra?: readonly string[] | null): Set<string> {
  const out = normSet(isoRolesExtra ?? []);
  const pr = snapshot?.primaryRole?.trim();
  if (pr) out.add(pr);
  return out;
}

function tenantOk(
  actorTenant: string | null | undefined,
  resourceTenant: string | null | undefined,
  roles: ReadonlySet<string>,
): boolean {
  if (roles.has("sys_admin")) return true;
  const rt = (resourceTenant ?? "").trim();
  if (!rt) return true;
  const at = (actorTenant ?? "").trim();
  if (!at) return false;
  return at === rt;
}

/** Paritet s ``backend/core/resource_access.can_access_governance_domain``. */
export function canAccessGovernanceDomain(snapshot: MePermissionsPayload | null | undefined, roles: ReadonlySet<string>): boolean {
  if (
    roles.has("quality_manager") ||
    roles.has("auditor") ||
    roles.has("impartiality_committee") ||
    roles.has("director") ||
    roles.has("admin") ||
    roles.has("sys_admin")
  ) {
    return true;
  }
  if (hasPermission(snapshot, PERM_GOVERNANCE_HUB_ACCESS, false)) return true;
  if (
    roles.has("cert_committee") ||
    roles.has("appeals_committee") ||
    roles.has("tech_committee") ||
    roles.has("training_admin")
  ) {
    return true;
  }
  return false;
}

function isStrictCommitteeProfile(roles: ReadonlySet<string>, actorCommitteeIds: readonly string[] | undefined): boolean {
  if (!roles.has("cert_committee")) return false;
  if (roles.has("admin") || roles.has("director") || roles.has("sys_admin")) return false;
  return !!(actorCommitteeIds && actorCommitteeIds.length > 0);
}

function committeeScopeOk(meta: ResourceAbacMeta, roles: ReadonlySet<string>): boolean {
  const resC = [...normSet(meta.committeeIds as string[] | undefined)];
  const actC = [...normSet(meta.actorCommitteeIds as string[] | undefined)];
  const strict = isStrictCommitteeProfile(roles, meta.actorCommitteeIds);
  if (!resC.length) return true;
  if (!strict) return true;
  if (!actC.length) return false;
  const rs = new Set(resC);
  return actC.some((id) => rs.has(id));
}

function isAssigned(meta: ResourceAbacMeta): boolean {
  const uid = String(meta.viewerUserId ?? "").trim();
  if (!uid) return false;
  const pool = normSet([...(meta.assignedUserIds ?? []), ...(meta.reviewerUserIds ?? [])]);
  return pool.has(uid);
}

function isOwner(meta: ResourceAbacMeta): boolean {
  const o = String(meta.ownerUserId ?? "").trim();
  const u = String(meta.viewerUserId ?? "").trim();
  if (!o || !u) return false;
  return o === u;
}

function permissionGranted(snapshot: MePermissionsPayload | null | undefined, perm: string, rbacFallback: boolean): boolean {
  if (snapshot?.blockedPermissions?.includes(perm)) return false;
  return hasPermission(snapshot, perm, rbacFallback);
}

function businessSurface(rt: string): boolean {
  return (
    rt === CERTIFICATION_APPLICATION ||
    rt === CERTIFICATION_DECISION ||
    rt === PERSON_CERTIFICATION ||
    rt === RISK_REGISTER_ENTRY ||
    rt === IMPARTIALITY_THREAT
  );
}

function deny(code: string, message: string): AbacActionHint {
  return { allowed: false, reasonCode: code, reasonMessage: message };
}

/**
 * Tooltip za onemogućene kontrole — izbjegava generičko „nemate pristup”.
 */
export function denialTooltipForReason(code: string | null | undefined): string {
  switch (code) {
    case "COMPETENCE_REQUIRED":
      return "Nedostaje aktivna kompetencija.";
    case "RESOURCE_ASSIGNMENT_REQUIRED":
      return "Prijava nije dodijeljena vašem odboru.";
    case "COMMITTEE_SCOPE_REQUIRED":
      return "Prijava nije u dosegu vašeg odbora ili scheme konteksta.";
    case "TENANT_ISOLATION":
      return "Pristup ograničen na vaš tenant.";
    case "GOVERNANCE_SCOPE_REQUIRED":
      return "Potreban je governance skup ovlasti.";
    case "BLOCKED_BY_SOD":
      return "Akcija je blokirana pravilima razdvajanja funkcija.";
    case "SYS_ADMIN_BUSINESS_MUTATION":
      return "Sistemski administrator ne smije ovu poslovnu odluku izvršiti u aplikaciji.";
    case "ABAC_POLICY_BLOCK":
      return "Nedostaje osnovna ovlast za ovu radnju.";
    default:
      return "Radnja trenutačno nije dozvoljena.";
  }
}

export function hintFromEvaluateResponse(body: AuthorizationDecisionLite | null | undefined): AbacActionHint {
  if (!body) return { allowed: false, reasonCode: "NO_RESPONSE", reasonMessage: "Nema odluke sa servera." };
  const hint: AbacActionHint = { allowed: Boolean(body.allowed) };
  const c = body.reasonCode;
  if (c !== null && c !== undefined && String(c).trim() !== "") {
    hint.reasonCode = String(c);
  }
  const m = body.reasonMessage;
  if (m !== null && m !== undefined && String(m).trim() !== "") {
    hint.reasonMessage = String(m);
  }
  return hint;
}

/** Pregled (read/view). */
export function canViewResource(
  snapshot: MePermissionsPayload | null | undefined,
  meta: ResourceAbacMeta,
  resourceType: string,
  rbacFallback: boolean,
  isoRolesExtra?: readonly string[] | null,
): AbacActionHint {
  if (meta.sodBlocked) {
    return deny("BLOCKED_BY_SOD", denialTooltipForReason("BLOCKED_BY_SOD"));
  }
  const roles = canonicalRoleSet(snapshot, isoRolesExtra);
  const rt = resourceType.trim().toUpperCase();
  if (!tenantOk(snapshot?.tenantId, meta.resourceTenantId, roles)) {
    return deny("TENANT_ISOLATION", denialTooltipForReason("TENANT_ISOLATION"));
  }
  if (
    roles.has("sys_admin") &&
    rt === CERTIFICATION_DECISION &&
    !permissionGranted(snapshot, PERM_GOVERNANCE_HUB_ACCESS, rbacFallback)
  ) {
    return deny("COMMITTEE_SCOPE_REQUIRED", denialTooltipForReason("COMMITTEE_SCOPE_REQUIRED"));
  }
  if (!committeeScopeOk(meta, roles)) {
    return deny("COMMITTEE_SCOPE_REQUIRED", denialTooltipForReason("COMMITTEE_SCOPE_REQUIRED"));
  }

  if (rt === CERTIFICATION_APPLICATION && isOwner(meta)) {
    return { allowed: true, reasonCode: "OWN_RESOURCE_ACCESS" };
  }
  if (rt === CERTIFICATION_APPLICATION) {
    if (!permissionGranted(snapshot, PERM_CERTIFICATION_APPLICATION_READ, rbacFallback)) {
      return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    }
    return { allowed: true };
  }
  if (rt === CERTIFICATION_DECISION) {
    if (!permissionGranted(snapshot, PERM_CERTIFICATION_APPLICATION_READ, rbacFallback)) {
      return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    }
    return { allowed: true };
  }
  if (rt === PERSON_CERTIFICATION && isOwner(meta)) {
    return { allowed: true, reasonCode: "OWN_RESOURCE_ACCESS" };
  }
  if (rt === PERSON_CERTIFICATION) {
    if (!permissionGranted(snapshot, PERM_CERTIFICATION_APPLICATION_READ, rbacFallback)) {
      return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    }
    return { allowed: true };
  }
  if (rt === MANAGEMENT_REVIEW_RECORD) {
    if (!permissionGranted(snapshot, PERM_GOVERNANCE_HUB_ACCESS, rbacFallback)) {
      return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    }
    if (!canAccessGovernanceDomain(snapshot, roles)) {
      return deny("GOVERNANCE_SCOPE_REQUIRED", denialTooltipForReason("GOVERNANCE_SCOPE_REQUIRED"));
    }
    return { allowed: true };
  }
  if (rt === RISK_REGISTER_ENTRY) {
    if (!permissionGranted(snapshot, PERM_RISK_REGISTER_READ, rbacFallback)) {
      return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    }
    if (!canAccessGovernanceDomain(snapshot, roles)) {
      return deny("GOVERNANCE_SCOPE_REQUIRED", denialTooltipForReason("GOVERNANCE_SCOPE_REQUIRED"));
    }
    return { allowed: true };
  }
  if (rt === IMPARTIALITY_THREAT) {
    const ok = permissionGranted(snapshot, PERM_IMPARTIALITY_READ, rbacFallback) || permissionGranted(snapshot, PERM_AUDIT_READ, rbacFallback);
    if (!ok) return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    if (!canAccessGovernanceDomain(snapshot, roles)) {
      return deny("GOVERNANCE_SCOPE_REQUIRED", denialTooltipForReason("GOVERNANCE_SCOPE_REQUIRED"));
    }
    return { allowed: true };
  }
  if (rt === AUDIT_ARTIFACT || rt === AUDIT_EVENT) {
    if (!permissionGranted(snapshot, PERM_AUDIT_READ, rbacFallback)) {
      return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    }
    if (!canAccessGovernanceDomain(snapshot, roles)) {
      return deny("GOVERNANCE_SCOPE_REQUIRED", denialTooltipForReason("GOVERNANCE_SCOPE_REQUIRED"));
    }
    return { allowed: true };
  }
  /* nepoznat tip — bar tenant + barem jedan oversight perm */
  const any = hasAnyPermission(
    snapshot,
    [
      PERM_CERTIFICATION_APPLICATION_READ,
      PERM_AUDIT_READ,
      PERM_RISK_REGISTER_READ,
      PERM_GOVERNANCE_HUB_ACCESS,
    ],
    rbacFallback,
  );
  if (!any) return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
  return { allowed: true };
}

function sysAdminBlockedMutation(resourceType: string, roles: ReadonlySet<string>): AbacActionHint | null {
  const rt = resourceType.trim().toUpperCase();
  if (!roles.has("sys_admin") || !businessSurface(rt)) return null;
  return deny("SYS_ADMIN_BUSINESS_MUTATION", denialTooltipForReason("SYS_ADMIN_BUSINESS_MUTATION"));
}

/** Izmjena sadržaja / radni tok koji nije finalna odluka (review, assign, dokumentacija). */
export function canEditResource(
  snapshot: MePermissionsPayload | null | undefined,
  meta: ResourceAbacMeta,
  resourceType: string,
  rbacFallback: boolean,
  isoRolesExtra?: readonly string[] | null,
): AbacActionHint {
  const view = canViewResource(snapshot, meta, resourceType, rbacFallback, isoRolesExtra);
  if (!view.allowed) return view;
  const roles = canonicalRoleSet(snapshot, isoRolesExtra);
  const bm = sysAdminBlockedMutation(resourceType, roles);
  if (bm) return bm;

  const rt = resourceType.trim().toUpperCase();
  if (rt === CERTIFICATION_APPLICATION || rt === PERSON_CERTIFICATION) {
    const okReview = permissionGranted(snapshot, PERM_CERTIFICATION_APPLICATION_REVIEW, rbacFallback);
    const okAssign = permissionGranted(snapshot, PERM_CERTIFICATION_APPLICATION_ASSIGN, rbacFallback);
    if (!(okReview || okAssign)) {
      return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    }
    if (isStrictCommitteeProfile(roles, meta.actorCommitteeIds) && !isAssigned(meta) && roles.has("cert_committee")) {
      return deny("RESOURCE_ASSIGNMENT_REQUIRED", denialTooltipForReason("RESOURCE_ASSIGNMENT_REQUIRED"));
    }
    return { allowed: true };
  }
  if (rt === CERTIFICATION_DECISION) {
    const ok =
      permissionGranted(snapshot, PERM_CERTIFICATION_APPLICATION_REVIEW, rbacFallback) ||
      permissionGranted(snapshot, PERM_CERTIFICATION_DECISION_VOTE, rbacFallback) ||
      permissionGranted(snapshot, PERM_CERTIFICATION_APPLICATION_APPROVE, rbacFallback);
    if (!ok) return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    return { allowed: true };
  }
  if (rt === AUDIT_ARTIFACT || rt === AUDIT_EVENT) {
    if (!permissionGranted(snapshot, PERM_AUDIT_STRUCTURE_MANAGE, rbacFallback)) {
      return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    }
    return { allowed: true };
  }
  return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
}

/** Finalna odluka / approve / reject / vote. */
export function canApproveResource(
  snapshot: MePermissionsPayload | null | undefined,
  meta: ResourceAbacMeta,
  resourceType: string,
  rbacFallback: boolean,
  isoRolesExtra?: readonly string[] | null,
): AbacActionHint {
  const view = canViewResource(snapshot, meta, resourceType, rbacFallback, isoRolesExtra);
  if (!view.allowed) return view;
  const roles = canonicalRoleSet(snapshot, isoRolesExtra);
  const bm = sysAdminBlockedMutation(resourceType, roles);
  if (bm) return bm;

  const rt = resourceType.trim().toUpperCase();
  if (rt === CERTIFICATION_APPLICATION || rt === CERTIFICATION_DECISION || rt === PERSON_CERTIFICATION) {
    const ok =
      permissionGranted(snapshot, PERM_CERTIFICATION_APPLICATION_APPROVE, rbacFallback) ||
      permissionGranted(snapshot, PERM_CERTIFICATION_DECISION_VOTE, rbacFallback);
    if (!ok) return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    if (isStrictCommitteeProfile(roles, meta.actorCommitteeIds) && !isAssigned(meta) && roles.has("cert_committee")) {
      return deny("RESOURCE_ASSIGNMENT_REQUIRED", denialTooltipForReason("RESOURCE_ASSIGNMENT_REQUIRED"));
    }
    return { allowed: true };
  }
  if (rt === IMPARTIALITY_THREAT) {
    if (!permissionGranted(snapshot, PERM_IMPARTIALITY_ACCEPT, rbacFallback)) {
      return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    }
    return { allowed: true };
  }
  if (rt === RISK_REGISTER_ENTRY) {
    if (!permissionGranted(snapshot, PERM_RISK_ACCEPT, rbacFallback)) {
      return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
    }
    return { allowed: true };
  }
  return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
}

/** Zatvaranje lifecycle-a (risk accept / cert issue / aplikacija zatvaranje). */
export function canCloseResource(
  snapshot: MePermissionsPayload | null | undefined,
  meta: ResourceAbacMeta,
  resourceType: string,
  rbacFallback: boolean,
  isoRolesExtra?: readonly string[] | null,
): AbacActionHint {
  const rt = resourceType.trim().toUpperCase();
  if (rt === RISK_REGISTER_ENTRY) {
    return canApproveResource(snapshot, meta, resourceType, rbacFallback, isoRolesExtra);
  }
  const roles = canonicalRoleSet(snapshot, isoRolesExtra);
  const bm = sysAdminBlockedMutation(resourceType, roles);
  if (bm) return bm;
  const approve = permissionGranted(snapshot, PERM_CERTIFICATION_APPLICATION_APPROVE, rbacFallback);
  const issue = permissionGranted(snapshot, PERM_CERTIFICATE_ISSUE, rbacFallback);
  if (!(approve || issue)) {
    return deny("ABAC_POLICY_BLOCK", denialTooltipForReason("ABAC_POLICY_BLOCK"));
  }
  const view = canViewResource(snapshot, meta, resourceType, rbacFallback, isoRolesExtra);
  if (!view.allowed) return view;
  return { allowed: true };
}

export function getResourceInteractionMode(
  snapshot: MePermissionsPayload | null | undefined,
  meta: ResourceAbacMeta,
  resourceType: string,
  rbacFallback: boolean,
  isoRolesExtra?: readonly string[] | null,
): ResourceInteractionMode {
  const view = canViewResource(snapshot, meta, resourceType, rbacFallback, isoRolesExtra);
  if (!view.allowed) return "hidden";
  const edit = canEditResource(snapshot, meta, resourceType, rbacFallback, isoRolesExtra);
  const appr = canApproveResource(snapshot, meta, resourceType, rbacFallback, isoRolesExtra);
  const clo = canCloseResource(snapshot, meta, resourceType, rbacFallback, isoRolesExtra);
  if (edit.allowed || appr.allowed || clo.allowed) return "full";
  return "readonly";
}
