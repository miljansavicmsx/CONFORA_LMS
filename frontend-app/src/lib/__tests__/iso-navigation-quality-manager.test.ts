import { describe, expect, it } from "vitest";

import { buildSidebarSections } from "@/components/layout/sidebar-sections";
import {
  canAccessGovernanceDomain,
  canAccessIsoAudit,
  canAccessRiskManagement,
  type IsoNavContext,
} from "@/lib/iso-navigation-access";

const qmCtx: IsoNavContext = { role: "quality_manager", cognitoGroups: [] };

function allPaths(ctx: IsoNavContext): string[] {
  return buildSidebarSections(ctx, "governance").flatMap((s) => s.items.map((i) => i.to));
}

describe("quality_manager ISO navigation", () => {
  it("quality_manager sees governance risk and audit domains", () => {
    expect(canAccessGovernanceDomain(qmCtx)).toBe(true);
    expect(canAccessRiskManagement(qmCtx)).toBe(true);
    expect(canAccessIsoAudit(qmCtx)).toBe(true);
  });

  it("quality_manager_sidebar_shows_governance", () => {
    const paths = allPaths(qmCtx);
    expect(paths.some((to) => to.includes("/dashboard/iso/capa"))).toBe(true);
    expect(paths.some((to) => to.includes("/dashboard/iso/risks"))).toBe(true);
    expect(paths.some((to) => to.includes("/dashboard/iso/competence"))).toBe(true);
    expect(paths.some((to) => to.includes("/dashboard/iso/schemes"))).toBe(true);
  });

  it("quality_manager_no_sys_admin_items", () => {
    const paths = allPaths(qmCtx);
    expect(paths.some((to) => to.includes("/dashboard/admin/system-health"))).toBe(false);
    expect(paths.some((to) => to.includes("/dashboard/admin/roles"))).toBe(false);
    expect(paths.some((to) => to.includes("/dashboard/admin/billing"))).toBe(false);
  });
});
