import { describe, expect, it } from "vitest";

import { buildSidebarSections } from "@/components/layout/sidebar-sections";
import type { SidebarSectionDef } from "@/components/layout/sidebar-nav-types";

function paths(sections: readonly SidebarSectionDef[]): string[] {
  return sections.flatMap((s) => s.items.map((i) => i.to));
}

describe("buildSidebarSections", () => {
  it("learner ne vidi sys admin ili users rute u learning workspace", () => {
    const p = paths(buildSidebarSections({ role: "learner", cognitoGroups: [] }, "learning"));
    expect(p.some((to) => to.includes("/dashboard/admin/users"))).toBe(false);
    expect(p.some((to) => to.includes("/dashboard/admin/system-health"))).toBe(false);
  });

  it("tech_committee ne vidi cert operativa / iso decisions u learning workspace", () => {
    const sections = buildSidebarSections({ role: "tech_committee", cognitoGroups: [] }, "learning");
    const personaTitleKeys = new Set(["certificationOps", "certificationCommittee"]);
    expect(sections.some((s) => personaTitleKeys.has(s.titleKey))).toBe(false);
    const flat = sections.flatMap((s) => s.items);
    expect(flat.some((i) => i.to === "/dashboard/iso/decisions")).toBe(false);
    expect(paths(sections)).toContain("/dashboard/admin/item-bank");
  });

  it("cert_committee vidi odluke u governance workspace; ne dobiva tehnički blok", () => {
    const sections = buildSidebarSections({ role: "cert_committee", cognitoGroups: [] }, "governance");
    const flat = sections.flatMap((s) => s.items);
    expect(flat.some((i) => i.to === "/dashboard/iso/decisions")).toBe(true);
    expect(sections.some((s) => s.titleKey === "technicalValidation")).toBe(false);
  });

  it("sys_admin vidi users i system-health u system workspace", () => {
    const p = paths(buildSidebarSections({ role: "sys_admin", cognitoGroups: [] }, "system"));
    expect(p.some((to) => to.includes("/dashboard/admin/users"))).toBe(true);
    expect(p.some((to) => to.includes("/dashboard/admin/system-health"))).toBe(true);
  });

  it("quality_manager vidi Knowledge centar u knowledge workspace", () => {
    const p = paths(buildSidebarSections({ role: "quality_manager", cognitoGroups: [] }, "knowledge"));
    expect(p).toContain("/dashboard/knowledge");
  });

  it("quality_manager vidi ISO governance module u governance workspace, ne vidi sys admin", () => {
    const ctx = { role: "quality_manager", cognitoGroups: [] } as const;
    const p = paths(buildSidebarSections(ctx, "governance"));
    expect(p.some((to) => to.includes("/dashboard/iso/capa"))).toBe(true);
    expect(p.some((to) => to.includes("/dashboard/iso/schemes"))).toBe(true);
    expect(p.some((to) => to.includes("/dashboard/admin/system-health"))).toBe(false);
  });

  it("director vidi unified reports u governance workspace", () => {
    const p = paths(buildSidebarSections({ role: "director", cognitoGroups: [] }, "governance"));
    expect(p).toContain("/dashboard/admin/reports");
  });

  it("training_admin vidi admin education link", () => {
    const p = paths(
      buildSidebarSections({ role: "training_admin", cognitoGroups: [] }, "learning"),
    );
    expect(p).toContain("/dashboard/admin/education");
  });

  it("learner vidi learner education link", () => {
    const p = paths(buildSidebarSections({ role: "learner", cognitoGroups: [] }, "learning"));
    expect(p).toContain("/dashboard/learner/education");
  });

  it("learner ne vidi /verify u learning sidebaru", () => {
    const p = paths(buildSidebarSections({ role: "learner", cognitoGroups: [] }, "learning"));
    expect(p).not.toContain("/verify");
    expect(p).toContain("/dashboard/my-certificates");
  });
});
