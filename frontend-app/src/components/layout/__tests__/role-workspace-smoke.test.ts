import { describe, expect, it } from "vitest";

import { buildSidebarSections } from "@/components/layout/sidebar-sections";
import type { AppWorkspaceId } from "@/lib/app-workspace";

const ROLES = [
  "learner",
  "candidate",
  "instructor",
  "training_admin",
  "cert_committee",
  "appeals_committee",
  "technical_committee",
  "auditor",
  "quality_manager",
  "director",
  "sys_admin",
] as const;

function defaultWorkspace(role: (typeof ROLES)[number]): AppWorkspaceId {
  if (role === "sys_admin") return "system";
  if (role === "learner" || role === "candidate" || role === "instructor") return "learning";
  return "governance";
}

describe("role workspace sidebar smoke", () => {
  it.each(ROLES)("buildSidebarSections does not throw for %s", (role) => {
    const ws = defaultWorkspace(role);
    const sections = buildSidebarSections({ role, cognitoGroups: [] }, ws);
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThanOrEqual(0);
  });
});
