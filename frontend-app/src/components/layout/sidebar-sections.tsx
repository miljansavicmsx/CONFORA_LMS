import {
  AlertOctagon,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Bot,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  FolderKanban,
  Gavel,
  Inbox,
  KeyRound,
  BadgeCheck,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Lock,
  Medal,
  MessageSquareWarning,
  Mic2,
  PenLine,
  PlusCircle,
  Rocket,
  Route,
  Scale,
  ScrollText,
  ShieldCheck,
  Users,
  Users2,
  Wallet,
} from "lucide-react";

import type { SidebarNavItemDef, SidebarSectionDef } from "@/components/layout/sidebar-nav-types";
import type { AppWorkspaceId } from "@/lib/app-workspace";
import { evaluateCourseCreatorAccess } from "@/lib/course-creator-access";
import { evaluateUserRegistryAccess } from "@/lib/user-registry-access";
import {
  canAccessAppealsDomain,
  canAccessCertificationApplicationsNav,
  canAccessCertificationDecisions,
  canAccessCertificatesRegistry,
  canAccessCompetenceManagement,
  canAccessCapaManagement,
  canAccessComplianceWorkspace,
  canAccessGovernanceDomain,
  canAccessKnowledgeWorkspace,
  canAccessRiskManagement,
  canAccessIsoAudit,
  canAccessReportsDomain,
  type IsoNavContext,
  isCertificationCandidate,
  isCertificationCommitteeMember,
  isDirector,
  isPlatformAdmin,
  isSysAdmin,
  isTechnicalCommitteeMember,
  isTrainingAdmin,
  isQualityManager,
} from "@/lib/iso-navigation-access";
import { evaluateSysAdminAccess } from "@/lib/sys-admin-access";
import { evaluateTenantDirectoryAccess } from "@/lib/tenant-directory-access";
import { evaluateAdminEducationAccess } from "@/lib/admin-education-access";
import { evaluateAdminReportsAccess } from "@/lib/admin-reports-access";
import { canPerformStaffIdentityReview, canReadStaffIdentityQueue } from "@/lib/staff-identity-review-access";
import { resolveActorNestRoles } from "@/lib/certification-assignment-access";

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
  const r = norm(ctx);
  return r === "learner" || r === "candidate";
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
  const r = norm(ctx);
  return r === "appeals_committee" || r === "admin";
}

function showIdentityReviewNav(isoCtx: IsoNavContext): boolean {
  const jwtRoles = resolveActorNestRoles({ roleFromProfile: isoCtx.role });
  return canReadStaffIdentityQueue({ jwtRoles, roleFromProfile: isoCtx.role });
}

function showIdentityReviewPerformNav(isoCtx: IsoNavContext): boolean {
  const jwtRoles = resolveActorNestRoles({ roleFromProfile: isoCtx.role });
  return canPerformStaffIdentityReview({ jwtRoles, roleFromProfile: isoCtx.role });
}

function showDirectorSidebar(ctx: IsoNavContext): boolean {
  return isSysAdmin(ctx) || isDirector(ctx);
}

function showTrainingOperationsSidebar(ctx: IsoNavContext): boolean {
  const r = norm(ctx);
  return isSysAdmin(ctx) || r === "training_admin" || r === "admin";
}

function hasCurriculum(ctx: IsoNavContext): boolean {
  return isTrainingAdmin(ctx);
}

function hasCourseCreator(ctx: IsoNavContext): boolean {
  return evaluateCourseCreatorAccess({ roleFromProfile: ctx.role });
}

function addWs(out: TaggedSidebarSection[], workspace: AppWorkspaceId, section: SidebarSectionDef): void {
  out.push({ workspace, section });
}

/**
 * Sve navigacijske grupe oznaÄene workspace-om (IA). Iste rute kao prije â€” samo raspodjela po portalu.
 */
export function collectTaggedSidebarSections(isoCtx: IsoNavContext): TaggedSidebarSection[] {
  const tagged: TaggedSidebarSection[] = [];

  if (!isLearnerPortalRole(isoCtx)) {
    addWs(tagged, "governance", {
      titleKey: "overview",
      items: [{ to: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, end: true }],
    });
  }

  if (evaluateSysAdminAccess({ roleFromProfile: isoCtx.role })) {
    addWs(tagged, "system", {
      titleKey: "overview",
      items: [{ to: "/dashboard", labelKey: "systemOverview", icon: LayoutDashboard, end: true }],
    });
  }

  if (isLearnerPortalRole(isoCtx)) {
    addWs(tagged, "learning", {
      titleKey: "learner",
      items: [
        { to: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, end: true },
        { to: "/dashboard/learner/education", labelKey: "myEducation", icon: BookOpen, end: true },
        { to: "/courses", labelKey: "catalog", icon: BookOpen, end: true },
        { to: "/dashboard/statistics", labelKey: "statistics", icon: BarChart3, end: true },
        { to: "/dashboard/exams", labelKey: "exams", icon: BookOpenCheck, end: false },
      ],
    });
    addWs(tagged, "learning", {
      titleKey: "personCertification",
      items: [
        { to: "/dashboard/certification", labelKey: "certOverview", icon: Route, end: true },
        { to: "/dashboard/certification/applications", labelKey: "certApplications", icon: ClipboardList, end: false },
        { to: "/dashboard/certification/status", labelKey: "certStatus", icon: ListChecks, end: false },
        { to: "/dashboard/my-certificates", labelKey: "myCertificates", icon: Medal, end: false },
        { to: "/dashboard/my-recertifications", labelKey: "recertification", icon: ClipboardCheck, end: false },
      ],
    });
    addWs(tagged, "learning", {
      titleKey: "service",
      items: [
        { to: "/dashboard/finance", labelKey: "finance", icon: Wallet, end: false },
        { to: "/dashboard/support", labelKey: "supportContact", icon: LifeBuoy, end: false },
        { to: "/dashboard/ai-tutor", labelKey: "aiTutor", icon: Bot, end: false, ai: true },
      ],
    });
  }

  if (showTrainingOperationsSidebar(isoCtx)) {
    const ops: SidebarNavItemDef[] = [];
    if (
      evaluateAdminEducationAccess({
        roleFromProfile: isoCtx.role,
        jwtRoles: resolveActorNestRoles({ roleFromProfile: isoCtx.role }),
      })
    ) {
      ops.push({ to: "/dashboard/admin/education", labelKey: "adminEducation", icon: BookOpen, end: true });
    }
    if (
      evaluateAdminReportsAccess({
        roleFromProfile: isoCtx.role,
        jwtRoles: resolveActorNestRoles({ roleFromProfile: isoCtx.role }),
      })
    ) {
      ops.push({ to: "/dashboard/admin/reports", labelKey: "reportsAudit", icon: BarChart3, end: true });
    }
    if (hasCourseCreator(isoCtx)) {
      ops.push({ to: "/dashboard/admin/kreiraj-kurs", labelKey: "createCourse", icon: PlusCircle, end: false });
    }
    if (hasCurriculum(isoCtx)) {
      ops.push(
        { to: "/dashboard/admin/sadrzaj", labelKey: "content", icon: PenLine, end: false },
        { to: "/dashboard/admin/item-bank", labelKey: "itemBank", icon: ListChecks, end: false },
      );
    }
    if (isSysAdmin(isoCtx) || isPlatformAdmin(isoCtx)) {
      ops.push({ to: "/dashboard/admin/analytics", labelKey: "learners", icon: Users, end: false });
    } else if (canAccessReportsDomain(isoCtx)) {
      ops.push({ to: "/dashboard/iso/reports", labelKey: "learners", icon: Users2, end: false });
    }
    if (canAccessReportsDomain(isoCtx)) {
      ops.push({ to: "/dashboard/iso/reports", labelKey: "trainingReports", icon: BarChart3, end: true });
    }
    if (norm(isoCtx) === "training_admin" || isSysAdmin(isoCtx) || norm(isoCtx) === "admin") {
      ops.push({ to: "/dashboard/billing", labelKey: "trainingFinance", icon: Wallet, end: false });
    }
    if (ops.length > 0) {
      addWs(tagged, "learning", { titleKey: "trainingAdmin", items: ops });
    }
  }

  if (showTechnicalCommitteeSidebar(isoCtx)) {
    addWs(tagged, "learning", {
      titleKey: "technicalValidation",
      items: [
        { to: "/dashboard/admin/sadrzaj", labelKey: "validationCourses", icon: FolderKanban, end: false },
        { to: "/dashboard/admin/item-bank", labelKey: "examQuestions", icon: ListChecks, end: false },
        { to: "/dashboard/admin/roleplay", labelKey: "aiSuggestions", icon: Mic2, end: false },
        { to: "/dashboard/iso/reports", labelKey: "questionReports", icon: BarChart3, end: false },
      ],
    });
  }

  if (isQualityManager(isoCtx)) {
    addWs(tagged, "governance", {
      titleKey: "isoReference",
      items: [{ to: "/dashboard/iso/schemes", labelKey: "certSchemes", icon: ScrollText, end: false }],
    });
  }

  if (showCertificationOpsSidebar(isoCtx)) {
    const titleKey = isCertificationCommitteeMember(isoCtx) ? "certificationCommittee" : "certificationOps";
    const certItems: SidebarNavItemDef[] = [
      { to: "/dashboard/committee/pilot-applications", labelKey: "applications", icon: ClipboardCheck, end: true },
      { to: "/dashboard/committee/pilot-applications", labelKey: "evidenceReview", icon: FolderKanban, end: false },
    ];
    if (canAccessCertificationDecisions(isoCtx)) {
      certItems.push(
        { to: "/dashboard/committee/decisions", labelKey: "impartialityCheck", icon: ClipboardList, end: false },
        { to: "/dashboard/iso/decisions", labelKey: "committeeDecisions", icon: Gavel, end: false },
      );
    }
    if (canAccessCertificatesRegistry(isoCtx)) {
      certItems.push({ to: "/dashboard/iso/certificates", labelKey: "issuedCertificates", icon: FileStack, end: false });
    }
    certItems.push({ to: "/dashboard/admin/recertification", labelKey: "recertificationsAdmin", icon: ClipboardCheck, end: true });
    if (canAccessReportsDomain(isoCtx)) {
      certItems.push({ to: "/dashboard/iso/reports", labelKey: "recertificationOverview", icon: ScrollText, end: false });
    }
    addWs(tagged, "governance", { titleKey, items: certItems });
  }

  if (showAppealsCommitteeSidebar(isoCtx)) {
    addWs(tagged, "governance", {
      titleKey: "appealsCommittee",
      items: [
        { to: "/dashboard/admin/appeals-complaints", labelKey: "appealsComplaints", icon: Inbox, end: false },
        { to: "/dashboard/iso/appeals", labelKey: "appealsOversight", icon: Inbox, end: false },
        { to: "/dashboard/iso/complaints", labelKey: "complaints", icon: MessageSquareWarning, end: false },
        { to: "/dashboard/admin/support", labelKey: "responses", icon: ClipboardList, end: false },
        { to: "/dashboard/iso/governance", labelKey: "deadlines", icon: ClipboardCheck, end: false },
      ],
    });
  }

  if (showDirectorSidebar(isoCtx)) {
    const exec: SidebarNavItemDef[] = [
      { to: "/dashboard/admin/reports", labelKey: "unifiedReports", icon: BarChart3, end: true },
      { to: "/dashboard/iso/reports", labelKey: "isoReports", icon: ScrollText, end: false },
      { to: "/dashboard/iso/governance", labelKey: "governance", icon: Scale, end: false },
      { to: "/dashboard/iso/governance", labelKey: "managementReview", icon: Users2, end: false },
      { to: "/dashboard/iso/governance", labelKey: "correctiveActions", icon: ClipboardCheck, end: false },
      { to: "/dashboard/iso/governance", labelKey: "committees", icon: Building2, end: false },
      { to: "/dashboard/billing", labelKey: "finance", icon: Wallet, end: false },
    ];
    if (canAccessCertificationDecisions(isoCtx)) {
      exec.push({ to: "/dashboard/iso/decisions", labelKey: "certDecisions", icon: Gavel, end: false });
    }
    if (canAccessCertificatesRegistry(isoCtx)) {
      exec.push({ to: "/dashboard/iso/certificates", labelKey: "certRegistry", icon: FileStack, end: false });
    }
    if (showIdentityReviewNav(isoCtx)) {
      exec.push({
        to: "/dashboard/admin/identity-review",
        labelKey: showIdentityReviewPerformNav(isoCtx) ? "identityReviewManual" : "identityReviewOversight",
        icon: ShieldCheck,
        end: false,
      });
    }
    if (canAccessAppealsDomain(isoCtx)) {
      exec.push({ to: "/dashboard/iso/appeals", labelKey: "appealsOversight", icon: Inbox, end: false });
    }
    addWs(tagged, "governance", { titleKey: "directorExecutive", items: exec });
  }

  if (showIdentityReviewPerformNav(isoCtx) && !showDirectorSidebar(isoCtx)) {
    addWs(tagged, "governance", {
      titleKey: "identityReview",
      items: [
        {
          to: "/dashboard/admin/identity-review",
          labelKey: "identityReviewManual",
          icon: ShieldCheck,
          end: false,
        },
      ],
    });
  }

  if (canAccessKnowledgeWorkspace(isoCtx)) {
    addWs(tagged, "knowledge", {
      titleKey: "standardsIntelligence",
      items: [{ to: "/dashboard/knowledge", labelKey: "knowledgeCenter", icon: ScrollText, end: false }],
    });
  }

  if (canAccessComplianceWorkspace(isoCtx)) {
    addWs(tagged, "governance", {
      titleKey: "compliance",
      items: [{ to: "/dashboard/iso/compliance", labelKey: "complianceOs", icon: ShieldCheck, end: false }],
    });
  }

  if (canAccessCapaManagement(isoCtx)) {
    addWs(tagged, "governance", {
      titleKey: "capaIso",
      items: [{ to: "/dashboard/iso/capa", labelKey: "capa", icon: ClipboardCheck, end: false }],
    });
  }

  if (canAccessRiskManagement(isoCtx)) {
    const riskItems: SidebarNavItemDef[] = [
      { to: "/dashboard/iso/risks", labelKey: "riskRegister", icon: AlertOctagon, end: false },
      { to: "/dashboard/iso/impartiality", labelKey: "impartiality", icon: Scale, end: false },
    ];
    if (canAccessGovernanceDomain(isoCtx)) {
      riskItems.push({
        to: "/dashboard/iso/management-review",
        labelKey: "managementReviewPage",
        icon: ClipboardList,
        end: false,
      });
    }
    addWs(tagged, "governance", {
      titleKey: "risksIso",
      items: riskItems,
    });
  }

  if (canAccessCompetenceManagement(isoCtx)) {
    addWs(tagged, "governance", {
      titleKey: "competenceIso",
      items: [{ to: "/dashboard/iso/competence", labelKey: "competence", icon: BadgeCheck, end: false }],
    });
  }

  if (canAccessIsoAudit(isoCtx)) {
    addWs(tagged, "governance", {
      titleKey: "auditIso",
      items: [{ to: "/dashboard/iso/audit", labelKey: "auditTrail", icon: ListChecks, end: false }],
    });
  }

  if (evaluateSysAdminAccess({ roleFromProfile: isoCtx.role })) {
    addWs(tagged, "system", {
      titleKey: "systemAdministration",
      items: [
        { to: "/dashboard/admin/reports", labelKey: "unifiedReports", icon: BarChart3, end: true },
        { to: "/dashboard/admin/education", labelKey: "adminEducation", icon: BookOpen, end: true },
        { to: "/dashboard/admin/users", labelKey: "users", icon: Users, end: false },
        { to: "/dashboard/admin/tenants", labelKey: "tenants", icon: FolderKanban, end: false },
        { to: "/dashboard/admin/roles", labelKey: "roles", icon: KeyRound, end: false },
        { to: "/dashboard/admin/audit-logs", labelKey: "securityTrail", icon: ScrollText, end: false },
        { to: "/dashboard/admin/system-health", labelKey: "systemHealth", icon: LayoutGrid, end: false },
        { to: "/dashboard/admin/jobs", labelKey: "jobs", icon: ClipboardCheck, end: false },
        { to: "/dashboard/admin/billing", labelKey: "adminBilling", icon: Wallet, end: false },
        { to: "/dashboard/admin/launch", labelKey: "launchMode", icon: Rocket, end: false },
        { to: "/dashboard/admin/backups", labelKey: "backups", icon: FileStack, end: false },
        { to: "/dashboard/admin/security", labelKey: "security", icon: Lock, end: false },
      ],
    });

    addWs(tagged, "system", {
      titleKey: "platformAdvanced",
      items: [
        { to: "/dashboard/iso/schemes", labelKey: "isoSchemes", icon: ScrollText, end: false },
        { to: "/dashboard/admin/console", labelKey: "sysConsole", icon: LayoutGrid, end: false },
        { to: "/dashboard/admin/committees", labelKey: "committeesCrud", icon: Users2, end: false },
        { to: "/dashboard/admin/analytics", labelKey: "platformAnalytics", icon: BarChart3, end: false },
        { to: "/dashboard/admin/customers", labelKey: "customerSuccess", icon: BriefcaseBusiness, end: false },
        { to: "/dashboard/admin/leads", labelKey: "leads", icon: Inbox, end: false },
        { to: "/dashboard/admin/feedback", labelKey: "feedback", icon: MessageSquareWarning, end: false },
      ],
    });
  }

  if (!evaluateSysAdminAccess({ roleFromProfile: isoCtx.role })) {
    const tenantItems: SidebarNavItemDef[] = [];
    if (evaluateUserRegistryAccess({ roleFromProfile: isoCtx.role })) {
      tenantItems.push({ to: "/dashboard/admin/users", labelKey: "users", icon: Users, end: false });
    }
    if (showIdentityReviewPerformNav(isoCtx)) {
      tenantItems.push({
        to: "/dashboard/admin/identity-review",
        labelKey: "identityReviewManual",
        icon: ShieldCheck,
        end: false,
      });
    }
    if (evaluateTenantDirectoryAccess({ roleFromProfile: isoCtx.role })) {
      tenantItems.push({ to: "/dashboard/admin/tenants", labelKey: "tenants", icon: FolderKanban, end: false });
    }
    if (tenantItems.length > 0) {
      addWs(tagged, "system", { titleKey: "tenantOperations", items: tenantItems });
    }
  }

  return tagged;
}

export function buildSidebarSectionDefs(isoCtx: IsoNavContext, workspace: AppWorkspaceId): SidebarSectionDef[] {
  return collectTaggedSidebarSections(isoCtx)
    .filter((t) => t.workspace === workspace)
    .map((t) => t.section);
}

/** Kompatibilnost: svi blokovi kao prije konsolidacije (za migracijske ili privremene alate). */
export function buildSidebarSectionDefsAllWorkspacesMerged(isoCtx: IsoNavContext): SidebarSectionDef[] {
  return collectTaggedSidebarSections(isoCtx).map((t) => t.section);
}


/** @deprecated Use buildSidebarSectionDefs + localizeSidebarSections in UI. */
export function buildSidebarSections(
  isoCtx: IsoNavContext,
  workspace: AppWorkspaceId,
): SidebarSectionDef[] {
  return buildSidebarSectionDefs(isoCtx, workspace);
}
