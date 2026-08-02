import { describe, expect, it } from "vitest";

import { buildSidebarSectionsAllWorkspacesMerged } from "@/components/layout/sidebar-sections";
import {
  buildNestAuthPilotLearnerSidebarSections,
  buildRoleAwarePilotSidebarSections,
} from "@/lib/nest-auth-pilot";
import {
  INACTIVE_PILOT_NAV_PATH_PREFIXES,
  filterPilotSidebarSections,
  isInactivePilotNavPath,
} from "@/lib/inactive-feature-visibility";

function paths(sections: { items: { to: string }[] }[]): string[] {
  return sections.flatMap((s) => s.items.map((i) => i.to));
}

describe("inactive-feature-visibility", () => {
  it("marks blocked backend routes inactive", () => {
    expect(isInactivePilotNavPath("/dashboard/me/accommodations")).toBe(true);
    expect(isInactivePilotNavPath("/dashboard/iso/governance")).toBe(true);
    expect(isInactivePilotNavPath("/dashboard/admin/item-bank")).toBe(true);
    expect(isInactivePilotNavPath("/dashboard/ai-tutor")).toBe(true);
    expect(isInactivePilotNavPath("/dashboard/finance")).toBe(true);
    expect(isInactivePilotNavPath("/learn/abc")).toBe(true);
  });

  it("allows active demo routes", () => {
    expect(isInactivePilotNavPath("/dashboard/learner/education")).toBe(false);
    expect(isInactivePilotNavPath("/dashboard/admin/reports")).toBe(false);
    expect(isInactivePilotNavPath("/dashboard/iso/applications")).toBe(false);
    expect(isInactivePilotNavPath("/courses")).toBe(false);
  });

  it("filterPilotSidebarSections removes inactive links", () => {
    const raw = buildSidebarSectionsAllWorkspacesMerged({ role: "director", cognitoGroups: [] });
    const filtered = filterPilotSidebarSections(raw);
    const all = paths(filtered);
    for (const prefix of INACTIVE_PILOT_NAV_PATH_PREFIXES) {
      expect(all.some((p) => p === prefix || p.startsWith(`${prefix}/`))).toBe(false);
    }
    expect(all).toContain("/dashboard/admin/reports");
  });
});

describe("pilot sidebar inactive hiding (UI-SHELL-1C)", () => {
  it("learner pilot nav excludes accommodations, finance and AI tutor", () => {
    const p = paths(buildNestAuthPilotLearnerSidebarSections());
    expect(p).not.toContain("/dashboard/me/accommodations");
    expect(p).not.toContain("/dashboard/finance");
    expect(p).not.toContain("/dashboard/ai-tutor");
    expect(p).toContain("/dashboard/learner/education");
    expect(p).toContain("/dashboard/support");
  });

  it("director pilot sidebar hides unwired governance placeholders", () => {
    const sections = buildRoleAwarePilotSidebarSections(
      { role: "director", cognitoGroups: [] },
      "governance",
      { jwtRoles: ["STAFF_DIR"], roleFromProfile: "director" },
    );
    const p = paths(sections);
    expect(p.some((x) => x.includes("/dashboard/iso/governance"))).toBe(false);
    expect(p.some((x) => x.includes("/dashboard/knowledge"))).toBe(false);
    expect(p.some((x) => x.includes("/dashboard/admin/item-bank"))).toBe(false);
    expect(p).toContain("/dashboard/admin/reports");
  });

  it("sysadmin pilot sidebar hides placeholder platform pages", () => {
    const sections = buildRoleAwarePilotSidebarSections(
      { role: "sys_admin", cognitoGroups: [] },
      "system",
      { jwtRoles: ["STAFF_SYSADM"], roleFromProfile: "sys_admin" },
    );
    const p = paths(sections);
    expect(p.some((x) => x.includes("/dashboard/admin/jobs"))).toBe(false);
    expect(p.some((x) => x.includes("/dashboard/admin/launch"))).toBe(false);
    expect(p.some((x) => x.includes("/dashboard/admin/leads"))).toBe(false);
  });
});
