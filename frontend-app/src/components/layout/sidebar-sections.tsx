import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Medal,
  MessageSquareWarning,
  ScrollText,
  ShieldCheck,
  Users2,
} from "lucide-react";

import type { SidebarNavItemDef, SidebarSectionDef } from "@/components/layout/sidebar-nav-types";
import { evaluateAdminEducationAccess } from "@/lib/admin-education-access";
import { evaluateAdminReportsAccess } from "@/lib/admin-reports-access";
import type { AppWorkspaceId } from "@/lib/app-workspace";
import { resolveActorNestRoles } from "@/lib/certification-assignment-access";
import {
  canAccessAppealsDomain,
  canAccessCertificationApplicationsNav,
  canAccessReportsDomain,
  type IsoNavContext,
  isCertificationCandidate,
  isCertificationCommitteeMember,
  isDirector,
  isPlatformAdmin,
  isSysAdmin,
  isTechnicalCommitteeMember,
} from "@/lib/iso-navigation-access";
import { canPerformStaffIdentityReview, canReadStaffIdentityQueue } from "@/lib/staff-identity-review-access";
import { evaluateSysAdminAccess } from "@/lib/sys-admin-access";

export type { SidebarSection, SidebarSectionDef } from "@/components/layout/sidebar-nav-types";

export type TaggedSidebarSection = {
  readonly workspace: AppWorkspaceId;
  readonly section: SidebarSectionDef;
};

function norm(ctx: IsoNavContext): string {
  return String(ctx.role ?? "")
    .trim()
    .toLowerCase();
}

function isLearnerPortalRole(ctx: IsoNavContext): boolean {
  const role = norm(ctx);
  return role === "learner" || role === "candidate";
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
  return canAccessCertificationApplicationsNav(ctx);
}

function showAppealsCommitteeSidebar(ctx: IsoNavContext): boolean {
  if (evaluateSysAdminAccess({ roleFromProfile: ctx.role })) {
    return true;
  }
  const role = norm(ctx);
  return role === "appeals_committee" || role === "admin";
}

function showIdentityReviewNav(ctx: IsoNavContext): boolean {
  const jwtRoles = resolveActorNestRoles({ roleFromProfile: ctx.role });
  return canReadStaffIdentityQueue({ jwtRoles, roleFromProfile: ctx.role });
}

function showIdentityReviewPerformNav(ctx: IsoNavContext): boolean {
  const jwtRoles = resolveActorNestRoles({ roleFromProfile: ctx.role });
  return canPerformStaffIdentityReview({ jwtRoles, roleFromProfile: ctx.role });
}

function showDirectorSidebar(ctx: IsoNavContext): boolean {
  return isSysAdmin(ctx) || isDirector(ctx);
}

function showTrainingOperationsSidebar(ctx: IsoNavContext): boolean {
  const role = norm(ctx);
  return isSysAdmin(ctx) || role === "training_admin" || role === "admin";
}

function addWorkspace(
  output: TaggedSidebarSection[],
  workspace: AppWorkspaceId,
  section: SidebarSectionDef,
): void {
  output.push({ workspace, section });
}

export function collectTaggedSidebarSections(ctx: IsoNavContext): TaggedSidebarSection[] {
  const tagged: TaggedSidebarSection[] = [];

  if (!isLearnerPortalRole(ctx)) {
    addWorkspace(tagged, "governance", {
      titleKey: "overview",
      items: [{ to: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, end: true }],
    });
  }

  if (evaluateSysAdminAccess({ roleFromProfile: ctx.role })) {
    addWorkspace(tagged, "system", {
      titleKey: "overview",
      items: [{ to: "/dashboard", labelKey: "systemOverview", icon: LayoutDashboard, end: true }],
    });
  }

  if (isLearnerPortalRole(ctx)) {
    addWorkspace(tagged, "learning", {
      titleKey: "learner",
      items: [
        { to: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, end: true },
        { to: "/dashboard/learner/education", labelKey: "myEducation", icon: BookOpen, end: true },
        { to: "/courses", labelKey: "catalog", icon: BookOpen, end: true },
      ],
    });
    addWorkspace(tagged, "learning", {
      titleKey: "personCertification",
      items: [
        { to: "/dashboard/certification/applications", labelKey: "certApplications", icon: ClipboardList, end: false },
        { to: "/dashboard/my-certificates", labelKey: "myCertificates", icon: Medal, end: false },
        { to: "/dashboard/my-recertifications", labelKey: "recertification", icon: ClipboardCheck, end: false },
      ],
    });
    addWorkspace(tagged, "learning", {
      titleKey: "service",
      items: [{ to: "/dashboard/support", labelKey: "supportContact", icon: LifeBuoy, end: false }],
    });
  }

  if (showTrainingOperationsSidebar(ctx)) {
    const items: SidebarNavItemDef[] = [];
    const jwtRoles = resolveActorNestRoles({ roleFromProfile: ctx.role });
    if (evaluateAdminEducationAccess({ roleFromProfile: ctx.role, jwtRoles })) {
      items.push({ to: "/dashboard/admin/education", labelKey: "adminEducation", icon: BookOpen, end: true });
    }
    if (evaluateAdminReportsAccess({ roleFromProfile: ctx.role, jwtRoles })) {
      items.push({ to: "/dashboard/admin/reports", labelKey: "reportsAudit", icon: BarChart3, end: true });
    }
    if (!isSysAdmin(ctx) && !isPlatformAdmin(ctx) && canAccessReportsDomain(ctx)) {
      items.push({ to: "/dashboard/iso/reports", labelKey: "learners", icon: Users2, end: false });
    }
    if (canAccessReportsDomain(ctx)) {
      items.push({ to: "/dashboard/iso/reports", labelKey: "trainingReports", icon: BarChart3, end: true });
    }
    if (items.length > 0) {
      addWorkspace(tagged, "learning", { titleKey: "trainingAdmin", items });
    }
  }

  if (showTechnicalCommitteeSidebar(ctx)) {
    addWorkspace(tagged, "learning", {
      titleKey: "technicalValidation",
      items: [{ to: "/dashboard/iso/reports", labelKey: "questionReports", icon: BarChart3, end: false }],
    });
  }

  if (showCertificationOpsSidebar(ctx)) {
    const titleKey = isCertificationCommitteeMember(ctx) ? "certificationCommittee" : "certificationOps";
    const items: SidebarNavItemDef[] = [
      { to: "/dashboard/committee/pilot-applications", labelKey: "applications", icon: ClipboardCheck, end: true },
      { to: "/dashboard/committee/pilot-applications", labelKey: "evidenceReview", icon: FolderKanban, end: false },
      { to: "/dashboard/admin/recertification", labelKey: "recertificationsAdmin", icon: ClipboardCheck, end: true },
    ];
    if (canAccessReportsDomain(ctx)) {
      items.push({ to: "/dashboard/iso/reports", labelKey: "recertificationOverview", icon: ScrollText, end: false });
    }
    addWorkspace(tagged, "governance", { titleKey, items });
  }

  if (showAppealsCommitteeSidebar(ctx)) {
    addWorkspace(tagged, "governance", {
      titleKey: "appealsCommittee",
      items: [
        { to: "/dashboard/admin/appeals-complaints", labelKey: "appealsComplaints", icon: Inbox, end: false },
        { to: "/dashboard/iso/appeals", labelKey: "appealsOversight", icon: Inbox, end: false },
        { to: "/dashboard/iso/complaints", labelKey: "complaints", icon: MessageSquareWarning, end: false },
        { to: "/dashboard/admin/support", labelKey: "responses", icon: ClipboardList, end: false },
      ],
    });
  }

  if (showDirectorSidebar(ctx)) {
    const items: SidebarNavItemDef[] = [
      { to: "/dashboard/admin/reports", labelKey: "unifiedReports", icon: BarChart3, end: true },
      { to: "/dashboard/iso/reports", labelKey: "isoReports", icon: ScrollText, end: false },
    ];
    if (showIdentityReviewNav(ctx)) {
      items.push({
        to: "/dashboard/admin/identity-review",
        labelKey: showIdentityReviewPerformNav(ctx) ? "identityReviewManual" : "identityReviewOversight",
        icon: ShieldCheck,
        end: false,
      });
    }
    if (canAccessAppealsDomain(ctx)) {
      items.push({ to: "/dashboard/iso/appeals", labelKey: "appealsOversight", icon: Inbox, end: false });
    }
    addWorkspace(tagged, "governance", { titleKey: "directorExecutive", items });
  }

  if (showIdentityReviewPerformNav(ctx) && !showDirectorSidebar(ctx)) {
    addWorkspace(tagged, "governance", {
      titleKey: "identityReview",
      items: [{
        to: "/dashboard/admin/identity-review",
        labelKey: "identityReviewManual",
        icon: ShieldCheck,
        end: false,
      }],
    });
  }

  if (evaluateSysAdminAccess({ roleFromProfile: ctx.role })) {
    addWorkspace(tagged, "system", {
      titleKey: "systemAdministration",
      items: [
        { to: "/dashboard/admin/reports", labelKey: "unifiedReports", icon: BarChart3, end: true },
        { to: "/dashboard/admin/education", labelKey: "adminEducation", icon: BookOpen, end: true },
      ],
    });
  }

  if (!evaluateSysAdminAccess({ roleFromProfile: ctx.role }) && showIdentityReviewPerformNav(ctx)) {
    addWorkspace(tagged, "system", {
      titleKey: "tenantOperations",
      items: [{
        to: "/dashboard/admin/identity-review",
        labelKey: "identityReviewManual",
        icon: ShieldCheck,
        end: false,
      }],
    });
  }

  return tagged;
}

export function buildSidebarSectionDefs(ctx: IsoNavContext, workspace: AppWorkspaceId): SidebarSectionDef[] {
  return collectTaggedSidebarSections(ctx)
    .filter((tagged) => tagged.workspace === workspace)
    .map((tagged) => tagged.section);
}

export function buildSidebarSectionDefsAllWorkspacesMerged(ctx: IsoNavContext): SidebarSectionDef[] {
  return collectTaggedSidebarSections(ctx).map((tagged) => tagged.section);
}

/** @deprecated Use buildSidebarSectionDefs + localizeSidebarSections in UI. */
export function buildSidebarSections(ctx: IsoNavContext, workspace: AppWorkspaceId): SidebarSectionDef[] {
  return buildSidebarSectionDefs(ctx, workspace);
}
