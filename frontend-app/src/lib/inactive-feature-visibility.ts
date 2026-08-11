import type { SidebarSectionDef } from "@/components/layout/sidebar-nav-types";

const PILOT_VISIBLE_PATHS = new Set<string>([
  "/dashboard",
  "/dashboard/profil",
  "/dashboard/postavke",
  "/dashboard/me/accommodations",
  "/dashboard/learner",
  "/dashboard/exams/register",
  "/dashboard/certification/applications",
  "/dashboard/my-certificates",
  "/dashboard/my-recertifications",
  "/dashboard/support",
  "/dashboard/appeals-complaints",
  "/courses",
]);

/**
 * Hide unavailable pilot entries. This is deliberately a visibility-only
 * allow-list: route guards and authorization remain the authority for access.
 */
export function filterPilotSidebarSections(sections: readonly SidebarSectionDef[]): readonly SidebarSectionDef[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => PILOT_VISIBLE_PATHS.has(item.to)),
    }))
    .filter((section) => section.items.length > 0);
}
