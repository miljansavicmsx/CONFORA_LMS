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

import type { SidebarNavItem } from "@/components/layout/sidebar-nav-types";
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

export type SidebarSection = {
  readonly title: string;
  readonly items: readonly SidebarNavItem[];
};

export type TaggedSidebarSection = {
  readonly workspace: AppWorkspaceId;
  readonly section: SidebarSection;
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

function addWs(out: TaggedSidebarSection[], workspace: AppWorkspaceId, section: SidebarSection): void {
  out.push({ workspace, section });
}

/**
 * Sve navigacijske grupe označene workspace-om (IA). Iste rute kao prije — samo raspodjela po portalu.
 */
export function collectTaggedSidebarSections(isoCtx: IsoNavContext): TaggedSidebarSection[] {
  const tagged: TaggedSidebarSection[] = [];

  if (!isLearnerPortalRole(isoCtx)) {
    addWs(tagged, "governance", {
      title: "Pregled",
      items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true }],
    });
  }

  if (evaluateSysAdminAccess({ roleFromProfile: isoCtx.role })) {
    addWs(tagged, "system", {
      title: "Pregled",
      items: [{ to: "/dashboard", label: "Sistemski pregled", icon: LayoutDashboard, end: true }],
    });
  }

  if (isLearnerPortalRole(isoCtx)) {
    addWs(tagged, "learning", {
      title: "Polaznik",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/dashboard/learner/education", label: "Moje edukacije", icon: BookOpen, end: true },
        { to: "/courses", label: "Katalog", icon: BookOpen, end: true },
        { to: "/dashboard/statistics", label: "Statistika", icon: BarChart3, end: true },
        { to: "/dashboard/exams", label: "Ispiti", icon: BookOpenCheck, end: false },
      ],
    });
    addWs(tagged, "learning", {
      title: "Certifikacija osobe",
      items: [
        { to: "/dashboard/certification", label: "Pregled", icon: Route, end: true },
        { to: "/dashboard/certification/applications", label: "Prijave za certifikaciju", icon: ClipboardList, end: false },
        { to: "/dashboard/certification/status", label: "Status certifikacije", icon: ListChecks, end: false },
        { to: "/dashboard/my-certificates", label: "Moji certifikati i potvrde", icon: Medal, end: false },
        { to: "/dashboard/my-recertifications", label: "Recertifikacija", icon: ClipboardCheck, end: false },
      ],
    });
    addWs(tagged, "learning", {
      title: "Servis",
      items: [
        { to: "/dashboard/finance", label: "Finansije", icon: Wallet, end: false },
        { to: "/dashboard/support", label: "Podrška / kontakt", icon: LifeBuoy, end: false },
        { to: "/dashboard/ai-tutor", label: "AI Tutor", icon: Bot, end: false, ai: true },
      ],
    });
  }

  if (showTrainingOperationsSidebar(isoCtx)) {
    const ops: SidebarNavItem[] = [];
    if (
      evaluateAdminEducationAccess({
        roleFromProfile: isoCtx.role,
        jwtRoles: resolveActorNestRoles({ roleFromProfile: isoCtx.role }),
      })
    ) {
      ops.push({ to: "/dashboard/admin/education", label: "Upravljanje edukacijama", icon: BookOpen, end: true });
    }
    if (
      evaluateAdminReportsAccess({
        roleFromProfile: isoCtx.role,
        jwtRoles: resolveActorNestRoles({ roleFromProfile: isoCtx.role }),
      })
    ) {
      ops.push({ to: "/dashboard/admin/reports", label: "Izvještaji i audit", icon: BarChart3, end: true });
    }
    if (hasCourseCreator(isoCtx)) {
      ops.push({ to: "/dashboard/admin/kreiraj-kurs", label: "Kreiranje obuke", icon: PlusCircle, end: false });
    }
    if (hasCurriculum(isoCtx)) {
      ops.push(
        { to: "/dashboard/admin/sadrzaj", label: "Sadržaj", icon: PenLine, end: false },
        { to: "/dashboard/admin/item-bank", label: "Baza pitanja", icon: ListChecks, end: false },
      );
    }
    if (isSysAdmin(isoCtx) || isPlatformAdmin(isoCtx)) {
      ops.push({ to: "/dashboard/admin/analytics", label: "Polaznici", icon: Users, end: false });
    } else if (canAccessReportsDomain(isoCtx)) {
      ops.push({ to: "/dashboard/iso/reports", label: "Polaznici", icon: Users2, end: false });
    }
    if (canAccessReportsDomain(isoCtx)) {
      ops.push({ to: "/dashboard/iso/reports", label: "Izvještaji obuke", icon: BarChart3, end: true });
    }
    if (norm(isoCtx) === "training_admin" || isSysAdmin(isoCtx) || norm(isoCtx) === "admin") {
      ops.push({ to: "/dashboard/billing", label: "Finansije (obuka)", icon: Wallet, end: false });
    }
    if (ops.length > 0) {
      addWs(tagged, "learning", { title: "Administracija obuke", items: ops });
    }
  }

  if (showTechnicalCommitteeSidebar(isoCtx)) {
    addWs(tagged, "learning", {
      title: "Tehnička validacija",
      items: [
        { to: "/dashboard/admin/sadrzaj", label: "Obuke za validaciju", icon: FolderKanban, end: false },
        { to: "/dashboard/admin/item-bank", label: "Ispitna pitanja", icon: ListChecks, end: false },
        { to: "/dashboard/admin/roleplay", label: "AI prijedlozi", icon: Mic2, end: false },
        { to: "/dashboard/iso/reports", label: "Izvještaji pitanja", icon: BarChart3, end: false },
      ],
    });
  }

  if (isQualityManager(isoCtx)) {
    addWs(tagged, "governance", {
      title: "ISO referenca",
      items: [{ to: "/dashboard/iso/schemes", label: "Certifikacijske sheme", icon: ScrollText, end: false }],
    });
  }

  if (showCertificationOpsSidebar(isoCtx)) {
    const title = isCertificationCommitteeMember(isoCtx) ? "Certifikacijski odbor" : "Certifikacija (operativa)";
    const certItems: SidebarNavItem[] = [
      { to: "/dashboard/committee/pilot-applications", label: "Prijave", icon: ClipboardCheck, end: true },
      { to: "/dashboard/committee/pilot-applications", label: "Pregled dokaza", icon: FolderKanban, end: false },
    ];
    if (canAccessCertificationDecisions(isoCtx)) {
      certItems.push(
        { to: "/dashboard/committee/decisions", label: "Provjera nepristranosti", icon: ClipboardList, end: false },
        { to: "/dashboard/iso/decisions", label: "Odluke odbora", icon: Gavel, end: false },
      );
    }
    if (canAccessCertificatesRegistry(isoCtx)) {
      certItems.push({ to: "/dashboard/iso/certificates", label: "Izdati certifikati", icon: FileStack, end: false });
    }
    certItems.push({ to: "/dashboard/admin/recertification", label: "Recertifikacije", icon: ClipboardCheck, end: true });
    if (canAccessReportsDomain(isoCtx)) {
      certItems.push({ to: "/dashboard/iso/reports", label: "Recertifikacija (pregled)", icon: ScrollText, end: false });
    }
    addWs(tagged, "governance", { title, items: certItems });
  }

  if (showAppealsCommitteeSidebar(isoCtx)) {
    addWs(tagged, "governance", {
      title: "Žalbena komisija",
      items: [
        { to: "/dashboard/iso/appeals", label: "Žalbe", icon: Inbox, end: false },
        { to: "/dashboard/iso/complaints", label: "Prigovori", icon: MessageSquareWarning, end: false },
        { to: "/dashboard/admin/support", label: "Odgovori", icon: ClipboardList, end: false },
        { to: "/dashboard/iso/governance", label: "Rokovi", icon: ClipboardCheck, end: false },
      ],
    });
  }

  if (showDirectorSidebar(isoCtx)) {
    const exec: SidebarNavItem[] = [
      { to: "/dashboard/admin/reports", label: "Objedinjeni izvještaji", icon: BarChart3, end: true },
      { to: "/dashboard/iso/reports", label: "ISO izvještaji", icon: ScrollText, end: false },
      { to: "/dashboard/iso/governance", label: "Governance", icon: Scale, end: false },
      { to: "/dashboard/iso/governance", label: "Management review", icon: Users2, end: false },
      { to: "/dashboard/iso/governance", label: "Korektivne mjere", icon: ClipboardCheck, end: false },
      { to: "/dashboard/iso/governance", label: "Komiteti", icon: Building2, end: false },
      { to: "/dashboard/billing", label: "Finansije", icon: Wallet, end: false },
    ];
    if (canAccessCertificationDecisions(isoCtx)) {
      exec.push({ to: "/dashboard/iso/decisions", label: "Odluke o certifikaciji", icon: Gavel, end: false });
    }
    if (canAccessCertificatesRegistry(isoCtx)) {
      exec.push({ to: "/dashboard/iso/certificates", label: "Registar certifikata", icon: FileStack, end: false });
    }
    if (showIdentityReviewNav(isoCtx)) {
      exec.push({
        to: "/dashboard/admin/identity-review",
        label: showIdentityReviewPerformNav(isoCtx) ? "Ručna provjera identiteta" : "Pregled ID (nadzor)",
        icon: ShieldCheck,
        end: false,
      });
    }
    if (canAccessAppealsDomain(isoCtx)) {
      exec.push({ to: "/dashboard/iso/appeals", label: "Žalbe (nadzor)", icon: Inbox, end: false });
    }
    addWs(tagged, "governance", { title: "Uprava", items: exec });
  }

  if (showIdentityReviewPerformNav(isoCtx) && !showDirectorSidebar(isoCtx)) {
    addWs(tagged, "governance", {
      title: "Provjera identiteta",
      items: [
        {
          to: "/dashboard/admin/identity-review",
          label: "Ručna provjera identiteta",
          icon: ShieldCheck,
          end: false,
        },
      ],
    });
  }

  if (canAccessKnowledgeWorkspace(isoCtx)) {
    addWs(tagged, "knowledge", {
      title: "Standards Intelligence",
      items: [{ to: "/dashboard/knowledge", label: "Knowledge centar", icon: ScrollText, end: false }],
    });
  }

  if (canAccessComplianceWorkspace(isoCtx)) {
    addWs(tagged, "governance", {
      title: "Compliance",
      items: [{ to: "/dashboard/iso/compliance", label: "Compliance OS", icon: ShieldCheck, end: false }],
    });
  }

  if (canAccessCapaManagement(isoCtx)) {
    addWs(tagged, "governance", {
      title: "CAPA (ISO 17024)",
      items: [{ to: "/dashboard/iso/capa", label: "Neusaglašenosti i CAPA", icon: ClipboardCheck, end: false }],
    });
  }

  if (canAccessRiskManagement(isoCtx)) {
    const riskItems: SidebarNavItem[] = [
      { to: "/dashboard/iso/risks", label: "Registar rizika", icon: AlertOctagon, end: false },
      { to: "/dashboard/iso/impartiality", label: "Nepristranost", icon: Scale, end: false },
    ];
    if (canAccessGovernanceDomain(isoCtx)) {
      riskItems.push({
        to: "/dashboard/iso/management-review",
        label: "Pregled rukovodstva",
        icon: ClipboardList,
        end: false,
      });
    }
    addWs(tagged, "governance", {
      title: "Rizici (ISO 17024)",
      items: riskItems,
    });
  }

  if (canAccessCompetenceManagement(isoCtx)) {
    addWs(tagged, "governance", {
      title: "Kompetencija (ISO 17024)",
      items: [{ to: "/dashboard/iso/competence", label: "Upravljanje kompetencijama", icon: BadgeCheck, end: false }],
    });
  }

  if (canAccessIsoAudit(isoCtx)) {
    addWs(tagged, "governance", {
      title: "Audit (ISO 17024)",
      items: [{ to: "/dashboard/iso/audit", label: "Strukturirani audit trail", icon: ListChecks, end: false }],
    });
  }

  if (evaluateSysAdminAccess({ roleFromProfile: isoCtx.role })) {
    addWs(tagged, "system", {
      title: "Sistem administracija",
      items: [
        { to: "/dashboard/admin/reports", label: "Objedinjeni izvještaji", icon: BarChart3, end: true },
        { to: "/dashboard/admin/education", label: "Upravljanje edukacijama", icon: BookOpen, end: true },
        { to: "/dashboard/admin/users", label: "Korisnici", icon: Users, end: false },
        { to: "/dashboard/admin/tenants", label: "Organizacije", icon: FolderKanban, end: false },
        { to: "/dashboard/admin/roles", label: "Uloge i ovlasti", icon: KeyRound, end: false },
        { to: "/dashboard/admin/audit-logs", label: "Sigurnosni trag", icon: ScrollText, end: false },
        { to: "/dashboard/admin/system-health", label: "Status sustava", icon: LayoutGrid, end: false },
        { to: "/dashboard/admin/jobs", label: "Pozadinski poslovi", icon: ClipboardCheck, end: false },
        { to: "/dashboard/admin/billing", label: "Naplata (admin)", icon: Wallet, end: false },
        { to: "/dashboard/admin/launch", label: "Launch mode", icon: Rocket, end: false },
        { to: "/dashboard/admin/backups", label: "Rezerve", icon: FileStack, end: false },
        { to: "/dashboard/admin/security", label: "Sigurnost", icon: Lock, end: false },
      ],
    });

    addWs(tagged, "system", {
      title: "Platforma (napredno)",
      items: [
        { to: "/dashboard/iso/schemes", label: "ISO sheme", icon: ScrollText, end: false },
        { to: "/dashboard/admin/console", label: "Sys admin konzola", icon: LayoutGrid, end: false },
        { to: "/dashboard/admin/committees", label: "Komiteti (CRUD)", icon: Users2, end: false },
        { to: "/dashboard/admin/analytics", label: "Platform analytics", icon: BarChart3, end: false },
        { to: "/dashboard/admin/customers", label: "Customer success", icon: BriefcaseBusiness, end: false },
        { to: "/dashboard/admin/leads", label: "Leads", icon: Inbox, end: false },
        { to: "/dashboard/admin/feedback", label: "Feedback", icon: MessageSquareWarning, end: false },
      ],
    });
  }

  if (!evaluateSysAdminAccess({ roleFromProfile: isoCtx.role })) {
    const tenantItems: SidebarNavItem[] = [];
    if (evaluateUserRegistryAccess({ roleFromProfile: isoCtx.role })) {
      tenantItems.push({ to: "/dashboard/admin/users", label: "Korisnici", icon: Users, end: false });
    }
    if (showIdentityReviewPerformNav(isoCtx)) {
      tenantItems.push({
        to: "/dashboard/admin/identity-review",
        label: "Ručna provjera identiteta",
        icon: ShieldCheck,
        end: false,
      });
    }
    if (evaluateTenantDirectoryAccess({ roleFromProfile: isoCtx.role })) {
      tenantItems.push({ to: "/dashboard/admin/tenants", label: "Organizacije", icon: FolderKanban, end: false });
    }
    if (tenantItems.length > 0) {
      addWs(tagged, "system", { title: "Operativa tenanta", items: tenantItems });
    }
  }

  return tagged;
}

export function buildSidebarSections(isoCtx: IsoNavContext, workspace: AppWorkspaceId): SidebarSection[] {
  return collectTaggedSidebarSections(isoCtx)
    .filter((t) => t.workspace === workspace)
    .map((t) => t.section);
}

/** Kompatibilnost: svi blokovi kao prije konsolidacije (za migracijske ili privremene alate). */
export function buildSidebarSectionsAllWorkspacesMerged(isoCtx: IsoNavContext): SidebarSection[] {
  return collectTaggedSidebarSections(isoCtx).map((t) => t.section);
}
