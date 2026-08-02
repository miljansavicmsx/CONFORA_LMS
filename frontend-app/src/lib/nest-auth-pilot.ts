import {
  BookOpen,
  BookOpenCheck,
  ClipboardList,
  Gavel,
  LayoutDashboard,
  LifeBuoy,
  Medal,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { SidebarSectionDef } from "@/components/layout/sidebar-nav-types";
import type { AppWorkspaceId } from "@/lib/app-workspace";
import { getConforaApiConfig } from "@/lib/api/api-config";
import type { IsoNavContext } from "@/lib/iso-navigation-access";

/** Parse `VITE_NEST_AUTH_PILOT_ENABLED` (default false). */
export function parseNestAuthPilotEnabled(raw: string | undefined): boolean {
  const v = (raw ?? "false").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/** Pilot flag set in env (may still be inactive without `VITE_AUTH_PROVIDER=nest`). */
export function isNestAuthPilotConfigured(): boolean {
  return parseNestAuthPilotEnabled(import.meta.env.VITE_NEST_AUTH_PILOT_ENABLED);
}

/**
 * Nest auth pilot is active only when both flags align (P0-E-2a).
 * Legacy auth remains default when false or when auth provider is not nest.
 */
export function isNestAuthPilotActive(): boolean {
  if (!isNestAuthPilotConfigured()) {
    return false;
  }
  return getConforaApiConfig().authProvider === "nest";
}

/** Dev/staging warning when pilot flag is set without nest auth provider. */
export function warnNestAuthPilotMisconfiguration(): void {
  if (!isNestAuthPilotConfigured()) {
    return;
  }
  if (getConforaApiConfig().authProvider === "nest") {
    return;
  }
  console.warn(
    "[CONFORA] VITE_NEST_AUTH_PILOT_ENABLED=true but VITE_AUTH_PROVIDER is not nest — Nest auth pilot is inactive.",
  );
}

/** Dashboard paths allowed during wave-1 learner pilot (exact match). */
export const NEST_AUTH_PILOT_DASHBOARD_PATHS: readonly string[] = [
  "/dashboard",
  "/dashboard/profil",
  "/dashboard/postavke",
  "/dashboard/me/accommodations",
] as const;

/** Learner dashboard prefixes allowed during Nest auth pilot (learner final acceptance). */
export const NEST_AUTH_PILOT_LEARNER_DASHBOARD_PREFIXES: readonly string[] = [
  "/dashboard/learner",
  "/dashboard/exams",
  "/dashboard/certification/applications",
  "/dashboard/my-certificates",
  "/dashboard/my-recertifications",
  "/dashboard/support",
  "/dashboard/appeals-complaints",
] as const;

/** Staff/governance dashboard prefixes allowed during Nest auth pilot. */
export const NEST_AUTH_PILOT_STAFF_DASHBOARD_PREFIXES: readonly string[] = [
  "/dashboard/admin/reports",
  "/dashboard/admin/education",
  "/dashboard/admin/identity-review",
  "/dashboard/admin/appeals-complaints",
  "/dashboard/admin/support",
  "/dashboard/iso/reports",
  "/dashboard/iso/applications",
  "/dashboard/iso/decisions",
  "/dashboard/iso/certificates",
  "/dashboard/iso/appeals",
  "/dashboard/iso/complaints",
  "/dashboard/admin/recertification",
  "/dashboard/committee/pilot-applications",
  "/dashboard/committee/decisions",
] as const;

function normalizeDashboardPath(pathname: string): string {
  if (pathname === "/dashboard/") {
    return "/dashboard";
  }
  return pathname.replace(/\/+$/, "") || "/dashboard";
}

/** Whether a dashboard pathname is in the pilot whitelist. */
export function isPilotDashboardPathAllowed(pathname: string): boolean {
  const normalized = normalizeDashboardPath(pathname);
  if ((NEST_AUTH_PILOT_DASHBOARD_PATHS as readonly string[]).includes(normalized)) {
    return true;
  }
  if (
    NEST_AUTH_PILOT_LEARNER_DASHBOARD_PREFIXES.some(
      (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
    )
  ) {
    return true;
  }
  return NEST_AUTH_PILOT_STAFF_DASHBOARD_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/** Prefixes blocked during pilot (staff/governance surfaces — direct navigation redirects to /dashboard). */
export const NEST_AUTH_PILOT_BLOCKED_DASHBOARD_PREFIXES: readonly string[] = [
  "/dashboard/committee",
  "/dashboard/iso",
  "/dashboard/finance",
  "/dashboard/billing",
  "/dashboard/admin",
  "/dashboard/sys-admin",
  "/dashboard/knowledge",
  "/dashboard/ai-tutor",
  "/dashboard/statistics",
  "/dashboard/courses",
  "/dashboard/certification",
  "/dashboard/director",
] as const;

export function shouldRedirectPilotDashboardPath(pathname: string): boolean {
  const normalized = normalizeDashboardPath(pathname);
  if (!normalized.startsWith("/dashboard")) {
    return false;
  }
  return !isPilotDashboardPathAllowed(normalized);
}

/** Legacy API paths that must not fire during Nest auth pilot dashboard tour (GNG-C07). */
export const NEST_AUTH_PILOT_FORBIDDEN_LEGACY_API_PATHS: readonly string[] = [
  "/api/exams/my-attempts",
  "/api/certification/my-applications",
] as const;

export type NestAuthPilotMobileNavItem = {
  readonly to: string;
  readonly label: string;
  readonly short: string;
  readonly icon: LucideIcon;
  readonly end: boolean;
};

export type PilotNavPersona = "learner" | "training_admin" | "director" | "sysadmin" | "cert_staff" | "unknown";

export type PilotNavContext = {
  readonly roleFromProfile?: string;
  readonly jwtRoles?: readonly string[];
};

/** Resolve pilot navigation persona from profile/JWT hints. */
export function resolvePilotNavPersona(ctx: PilotNavContext = {}): PilotNavPersona {
  const role = String(ctx.roleFromProfile ?? "learner").trim().toLowerCase();
  const jwt = (ctx.jwtRoles ?? []).map((r) => String(r).trim().toLowerCase());
  const all = [role, ...jwt];

  if (all.some((r) => r === "staff_dir" || r.includes("director"))) return "director";
  if (all.some((r) => r === "staff_sysadm" || (r.includes("sys") && r.includes("admin")))) return "sysadmin";
  if (
    all.some(
      (r) =>
        r === "staff_trainadm" ||
        r.includes("training_admin") ||
        r.includes("trainadm") ||
        r.includes("trainer"),
    )
  ) {
    return "training_admin";
  }
  if (
    all.some(
      (r) =>
        r.includes("staff_com") ||
        r.includes("cert_committee") ||
        r.includes("id_verifier") ||
        (r.includes("cert") && r.includes("staff")) ||
        r.includes("reviewer"),
    )
  ) {
    return "cert_staff";
  }
  if (all.some((r) => r.includes("learner") || r === "candidate")) return "learner";
  return role === "learner" ? "learner" : "unknown";
}

function buildLearnerPilotMobileNav(): readonly NestAuthPilotMobileNavItem[] {
  return [
    { to: "/dashboard", label: "Dashboard", short: "Dom", icon: LayoutDashboard, end: true },
    { to: "/dashboard/learner/education", label: "Moje edukacije", short: "Eduk.", icon: BookOpen, end: true },
    { to: "/courses", label: "Katalog", short: "Kat.", icon: BookOpen, end: true },
    {
      to: "/dashboard/certification/applications",
      label: "Prijave",
      short: "Prij.",
      icon: ClipboardList,
      end: false,
    },
    { to: "/dashboard/appeals-complaints", label: "Žalbe", short: "Žal.", icon: Gavel, end: false },
    { to: "/dashboard/support", label: "Podrška", short: "Pod.", icon: LifeBuoy, end: false },
  ];
}

function buildDirectorPilotMobileNav(): readonly NestAuthPilotMobileNavItem[] {
  return [
    { to: "/dashboard", label: "Dashboard", short: "Dom", icon: LayoutDashboard, end: true },
    {
      to: "/dashboard/admin/reports",
      label: "Objedinjeni izvještaji",
      short: "Izv.",
      icon: ClipboardList,
      end: true,
    },
    { to: "/dashboard/iso/reports", label: "ISO izvještaji", short: "ISO", icon: Medal, end: true },
    { to: "/dashboard/support", label: "Podrška", short: "Pod.", icon: LifeBuoy, end: false },
  ];
}

function buildTrainingAdminPilotMobileNav(): readonly NestAuthPilotMobileNavItem[] {
  return [
    { to: "/dashboard", label: "Dashboard", short: "Dom", icon: LayoutDashboard, end: true },
    {
      to: "/dashboard/admin/education",
      label: "Upravljanje edukacijama",
      short: "Eduk.",
      icon: BookOpen,
      end: true,
    },
    {
      to: "/dashboard/admin/reports",
      label: "Izvještaji i audit",
      short: "Izv.",
      icon: ClipboardList,
      end: true,
    },
    { to: "/dashboard/iso/reports", label: "Izvještaji obuke", short: "Obuka", icon: Medal, end: true },
    { to: "/dashboard/support", label: "Podrška", short: "Pod.", icon: LifeBuoy, end: false },
  ];
}

function buildSysadminPilotMobileNav(): readonly NestAuthPilotMobileNavItem[] {
  return [
    { to: "/dashboard", label: "Dashboard", short: "Dom", icon: LayoutDashboard, end: true },
    { to: "/dashboard/admin/users", label: "Korisnici", short: "Kor.", icon: Users, end: true },
    {
      to: "/dashboard/admin/reports",
      label: "Izvještaji i audit",
      short: "Izv.",
      icon: ClipboardList,
      end: true,
    },
    { to: "/dashboard/support", label: "Podrška", short: "Pod.", icon: LifeBuoy, end: false },
  ];
}

function buildCertStaffPilotMobileNav(): readonly NestAuthPilotMobileNavItem[] {
  return [
    { to: "/dashboard", label: "Dashboard", short: "Dom", icon: LayoutDashboard, end: true },
    {
      to: "/dashboard/iso/applications",
      label: "Prijave",
      short: "Prij.",
      icon: ClipboardList,
      end: true,
    },
    {
      to: "/dashboard/admin/identity-review",
      label: "Pregled dokaza",
      short: "Dok.",
      icon: BookOpenCheck,
      end: true,
    },
    { to: "/dashboard/support", label: "Podrška", short: "Pod.", icon: LifeBuoy, end: false },
  ];
}

/** Role-aware mobile bottom nav for Nest auth pilot. */
export function buildRoleAwarePilotMobileNav(ctx: PilotNavContext = {}): readonly NestAuthPilotMobileNavItem[] {
  const persona = resolvePilotNavPersona(ctx);
  switch (persona) {
    case "director":
      return buildDirectorPilotMobileNav();
    case "training_admin":
      return buildTrainingAdminPilotMobileNav();
    case "sysadmin":
      return buildSysadminPilotMobileNav();
    case "cert_staff":
      return buildCertStaffPilotMobileNav();
    case "learner":
      return buildLearnerPilotMobileNav();
    default:
      return buildLearnerPilotMobileNav();
  }
}

/** Mobile bottom nav for pilot — learner acceptance surfaces (legacy alias). */
export function buildNestAuthPilotMobileNav(): readonly NestAuthPilotMobileNavItem[] {
  return buildRoleAwarePilotMobileNav({ roleFromProfile: "learner" });
}

/** Minimal learner sidebar for Nest auth pilot (learner acceptance surfaces). */
export function buildNestAuthPilotLearnerSidebarSections(): readonly SidebarSectionDef[] {
  return [
    {
      titleKey: "learner",
      items: [
        { to: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, end: true },
        { to: "/dashboard/learner/education", labelKey: "myEducation", icon: BookOpen, end: true },
        { to: "/courses", labelKey: "catalog", icon: BookOpen, end: true },
        { to: "/dashboard/exams/register", labelKey: "exams", icon: BookOpenCheck, end: true },
        {
          to: "/dashboard/certification/applications",
          labelKey: "certApplications",
          icon: ClipboardList,
          end: false,
        },
        { to: "/dashboard/my-certificates", labelKey: "myCertificates", icon: Medal, end: false },
        { to: "/dashboard/appeals-complaints", labelKey: "appeals", icon: Gavel, end: false },
        { to: "/dashboard/support", labelKey: "supportContact", icon: LifeBuoy, end: false },
      ],
    },
  ];
}

/**
 * Role-aware pilot sidebar (UI-SHELL-1B).
 *
 * R0-7D2S2: intentionally decoupled from `sidebar-sections` so the a11y
 * typecheck graph stays within the manifest-locked public closure. Staff
 * pilot personas temporarily receive the learner section set; full
 * role-aware sections are restored when sidebar-sections enters an
 * authorized closure.
 */
export function buildRoleAwarePilotSidebarSections(
  _isoCtx: IsoNavContext,
  _workspace: AppWorkspaceId,
  _navCtx: PilotNavContext = {},
): readonly SidebarSectionDef[] {
  return buildNestAuthPilotLearnerSidebarSections();
}

/** Minimal learner sidebar for Nest auth pilot (wave 1 legacy alias). */
export function buildNestAuthPilotSidebarSections(): readonly SidebarSectionDef[] {
  return buildNestAuthPilotLearnerSidebarSections();
}
