/**
 * Radni prostori authenticated aplikacije (IA — odvojeni mentalni modeli, iste backend rute).
 * Ne mijenja RBAC; samo grupacija navigacije i UX konteksta.
 */

import { evaluateCertificationApplicationsQueueAccess } from "@/lib/certification-staff-queue-access";
import {
  hasAnyIsoNavVisibility,
  isCertificationCandidate,
  isDirector,
  isQualityManager,
  isSysAdmin,
  isTechnicalCommitteeMember,
  canAccessKnowledgeWorkspace,
  type IsoNavContext,
} from "@/lib/iso-navigation-access";
import { evaluateSysAdminAccess } from "@/lib/sys-admin-access";
import { evaluateTenantDirectoryAccess } from "@/lib/tenant-directory-access";
import { evaluateUserRegistryAccess } from "@/lib/user-registry-access";

function isLearnerPortalRole(ctx: IsoNavContext): boolean {
  const r = String(ctx.role ?? "")
    .trim()
    .toLowerCase();
  return r === "learner" || r === "candidate";
}

/** Četiri interna porta unutar `frontend-app` (javni portal je zaseban Next projekat). */
export type AppWorkspaceId = "learning" | "governance" | "knowledge" | "system";

export const APP_WORKSPACE_LABELS: Record<AppWorkspaceId, string> = {
  learning: "Learning Portal",
  governance: "Governance Portal",
  knowledge: "Standards Intelligence",
  system: "System Administration",
};

const STORAGE_KEY = "confora.workspace.v1";

export function persistWorkspacePreference(id: AppWorkspaceId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* private mode */
  }
}

export function readWorkspacePreference(): AppWorkspaceId | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "learning" || raw === "governance" || raw === "knowledge" || raw === "system") {
      return raw;
    }
  } catch {
    return null;
  }
  return null;
}

function showTrainingOperationsSidebar(ctx: IsoNavContext): boolean {
  const r = String(ctx.role ?? "")
    .trim()
    .toLowerCase();
  return isSysAdmin(ctx) || r === "training_admin" || r === "admin";
}

function showTechnicalCommitteeSidebar(ctx: IsoNavContext): boolean {
  return isSysAdmin(ctx) || isTechnicalCommitteeMember(ctx);
}

function showCertificationOpsSidebar(ctx: IsoNavContext): boolean {
  if (isCertificationCandidate(ctx) || isTechnicalCommitteeMember(ctx)) {
    return false;
  }
  if (isDirector(ctx) && !isSysAdmin(ctx)) {
    return false;
  }
  return evaluateCertificationApplicationsQueueAccess({ roleFromProfile: ctx.role });
}

function showAppealsCommitteeSidebar(ctx: IsoNavContext): boolean {
  if (evaluateSysAdminAccess({ roleFromProfile: ctx.role })) {
    return true;
  }
  const r = String(ctx.role ?? "").trim().toLowerCase();
  return r === "appeals_committee" || r === "admin";
}

function showDirectorSidebar(ctx: IsoNavContext): boolean {
  return isSysAdmin(ctx) || isDirector(ctx);
}

/** Koji workspace-i imaju smisla za korisnika. */
export function workspacesAvailableForIsoContext(ctx: IsoNavContext): readonly AppWorkspaceId[] {
  const available = new Set<AppWorkspaceId>();

  if (isLearnerPortalRole(ctx) || showTrainingOperationsSidebar(ctx) || showTechnicalCommitteeSidebar(ctx)) {
    available.add("learning");
  }
  const isSys = evaluateSysAdminAccess({ roleFromProfile: ctx.role });
  if (isSys) {
    available.add("system");
  }

  const hasGovernanceSurface =
    !isLearnerPortalRole(ctx) &&
    (hasAnyIsoNavVisibility(ctx) ||
      showCertificationOpsSidebar(ctx) ||
      showAppealsCommitteeSidebar(ctx) ||
      showDirectorSidebar(ctx) ||
      isQualityManager(ctx) ||
      isSys);

  if (hasGovernanceSurface) {
    available.add("governance");
  }

  if (canAccessKnowledgeWorkspace(ctx)) {
    available.add("knowledge");
  }

  const tenantScopedOps =
    !isSys &&
    (evaluateUserRegistryAccess({ roleFromProfile: ctx.role }) || evaluateTenantDirectoryAccess({ roleFromProfile: ctx.role }));
  if (tenantScopedOps) {
    available.add("system");
  }

  return Array.from(available);
}

/** Početni workspace ako nema sačuvanog izbora. */
export function defaultWorkspaceForContext(available: readonly AppWorkspaceId[], role: string): AppWorkspaceId {
  if (available.length === 1) {
    return available[0]!;
  }
  const r = role.trim().toLowerCase();
  if (r === "learner" || r === "candidate") {
    return available.includes("learning") ? "learning" : available[0]!;
  }
  if (evaluateSysAdminAccess({ roleFromProfile: role }) || r === "sys_admin") {
    return available.includes("system") ? "system" : available[0]!;
  }
  if (available.includes("governance")) {
    return "governance";
  }
  return available[0]!;
}

export function clampWorkspace(
  workspace: AppWorkspaceId,
  available: readonly AppWorkspaceId[],
): AppWorkspaceId {
  if (available.includes(workspace)) {
    return workspace;
  }
  return available[0] ?? workspace;
}
