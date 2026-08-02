import type { SidebarNavItemDef, SidebarSectionDef } from "@/components/layout/sidebar-nav-types";

/**
 * UI-SHELL-1C — paths hidden from active pilot navigation (PRODUCT-GAP-1 + RBAC matrix §13).
 * BLOCKED_BY_BACKEND | SKELETON | PLACEHOLDER | REMOVE_OR_HIDE
 */
export const INACTIVE_PILOT_NAV_PATH_PREFIXES: readonly string[] = [
  "/dashboard/me/accommodations",
  "/dashboard/admin/accommodations",
  "/dashboard/finance",
  "/dashboard/billing",
  "/dashboard/admin/billing",
  "/dashboard/ai-tutor",
  "/dashboard/iso/governance",
  "/dashboard/iso/capa",
  "/dashboard/iso/risks",
  "/dashboard/iso/management-review",
  "/dashboard/iso/impartiality",
  "/dashboard/iso/compliance",
  "/dashboard/iso/competence",
  "/dashboard/knowledge",
  "/dashboard/admin/item-bank",
  "/dashboard/exams",
  "/dashboard/statistics",
  "/dashboard/admin/jobs",
  "/dashboard/admin/launch",
  "/dashboard/admin/leads",
  "/dashboard/admin/console",
  "/dashboard/admin/backups",
  "/dashboard/admin/security",
  "/dashboard/admin/customers",
  "/dashboard/admin/feedback",
  "/dashboard/admin/roleplay",
  "/dashboard/admin/kreiraj-kurs",
  "/dashboard/admin/sadrzaj",
  "/learn",
] as const;

/** Normalize dashboard path for prefix checks. */
export function normalizePilotPath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  return trimmed === "/dashboard/" ? "/dashboard" : trimmed;
}

/** Whether a route must not appear as active pilot navigation (sidebar/mobile). */
export function isInactivePilotNavPath(pathname: string): boolean {
  const normalized = normalizePilotPath(pathname);
  return INACTIVE_PILOT_NAV_PATH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/** EXAM-REG-1 — active learner exam registration (exempt from legacy /dashboard/exams inactive guard). */
export const EXAM_REGISTRATION_ACTIVE_PILOT_PATH = "/dashboard/exams/register";

/** Whether direct navigation to this dashboard path should show inactive-demo guard. */
export function isInactivePilotDashboardPath(pathname: string): boolean {
  const normalized = normalizePilotPath(pathname);
  if (
    normalized === EXAM_REGISTRATION_ACTIVE_PILOT_PATH ||
    normalized.startsWith(`${EXAM_REGISTRATION_ACTIVE_PILOT_PATH}/`)
  ) {
    return false;
  }
  return isInactivePilotNavPath(pathname);
}

function filterNavItems(items: readonly SidebarNavItemDef[]): SidebarNavItemDef[] {
  return items.filter((item) => !isInactivePilotNavPath(item.to));
}

/** Remove inactive/unwired items from pilot sidebar sections. */
export function filterPilotSidebarSections(sections: readonly SidebarSectionDef[]): SidebarSectionDef[] {
  return sections
    .map((section) => ({
      ...section,
      items: filterNavItems(section.items),
    }))
    .filter((section) => section.items.length > 0);
}

/** Count hidden nav links (for evidence metrics). */
export function countHiddenInactiveNavLinks(sections: readonly SidebarSectionDef[]): number {
  let hidden = 0;
  for (const section of sections) {
    for (const item of section.items) {
      if (isInactivePilotNavPath(item.to)) {
        hidden += 1;
      }
    }
  }
  return hidden;
}
