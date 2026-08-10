import { describe, expect, it } from "vitest";

import { buildSidebarSections } from "@/components/layout/sidebar-sections";
import type { SidebarSectionDef } from "@/components/layout/sidebar-nav-types";

function paths(sections: readonly SidebarSectionDef[]): string[] {
  return sections.flatMap((section) => section.items.map((item) => item.to));
}

describe("buildSidebarSections minimum bridge", () => {
  it("keeps learner navigation within the approved bridge", () => {
    const learner = paths(buildSidebarSections({ role: "learner", cognitoGroups: [] }, "learning"));
    expect(learner).toEqual([
      "/dashboard",
      "/dashboard/learner/education",
      "/courses",
      "/dashboard/certification/applications",
      "/dashboard/my-certificates",
      "/dashboard/my-recertifications",
      "/dashboard/support",
    ]);
  });

  it("keeps technical committee navigation on the approved reporting route", () => {
    const technical = paths(
      buildSidebarSections({ role: "tech_committee", cognitoGroups: [] }, "learning"),
    );
    expect(technical).toContain("/dashboard/iso/reports");
    expect(technical).not.toContain("/dashboard/admin/item-bank");
    expect(technical).not.toContain("/dashboard/iso/decisions");
  });

  it("keeps certification committee navigation on approved operations", () => {
    const certification = paths(
      buildSidebarSections({ role: "cert_committee", cognitoGroups: [] }, "governance"),
    );
    expect(certification).toContain("/dashboard/committee/pilot-applications");
    expect(certification).toContain("/dashboard/admin/recertification");
    expect(certification).not.toContain("/dashboard/committee/decisions");
    expect(certification).not.toContain("/dashboard/iso/decisions");
  });

  it("keeps sysadmin navigation within approved education and reporting surfaces", () => {
    const system = paths(buildSidebarSections({ role: "sys_admin", cognitoGroups: [] }, "system"));
    expect(system).toContain("/dashboard/admin/education");
    expect(system).toContain("/dashboard/admin/reports");
    expect(system).not.toContain("/dashboard/admin/users");
    expect(system).not.toContain("/dashboard/admin/system-health");
  });

  it("does not expose excluded knowledge or ISO governance surfaces", () => {
    const context = { role: "quality_manager", cognitoGroups: [] } as const;
    expect(paths(buildSidebarSections(context, "knowledge"))).not.toContain("/dashboard/knowledge");
    const governance = paths(buildSidebarSections(context, "governance"));
    expect(governance).not.toContain("/dashboard/iso/capa");
    expect(governance).not.toContain("/dashboard/iso/schemes");
  });

  it("preserves approved role-gated education, reports, and identity review links", () => {
    expect(
      paths(buildSidebarSections({ role: "director", cognitoGroups: [] }, "governance")),
    ).toContain("/dashboard/admin/reports");
    expect(
      paths(buildSidebarSections({ role: "training_admin", cognitoGroups: [] }, "learning")),
    ).toContain("/dashboard/admin/education");
    expect(
      paths(buildSidebarSections({ role: "learner", cognitoGroups: [] }, "learning")),
    ).toContain("/dashboard/learner/education");
  });
});
