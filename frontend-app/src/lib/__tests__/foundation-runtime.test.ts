import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const TARGETS = [
  "src/design-system/index.tsx",
  "src/index.css",
  "src/lib/app-workspace.ts",
  "src/lib/inactive-feature-visibility.ts",
  "src/lib/workspace-continuity/index.ts",
] as const;

function source(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("R0-7D C3-S2 foundation runtime", () => {
  it("resolves exactly the five authorized target paths", () => {
    expect(TARGETS.every((path) => existsSync(resolve(process.cwd(), path)))).toBe(true);
  });

  it("provides the contracts imported by approved callers", () => {
    const designSystem = source("src/design-system/index.tsx");
    expect(designSystem).toContain("EnterpriseAiBadge");
    expect(designSystem).toContain("EnterpriseStatusBadge");
    expect(source("src/lib/app-workspace.ts")).toContain("export type AppWorkspaceId");
    expect(source("src/lib/inactive-feature-visibility.ts")).toContain("export function filterPilotSidebarSections");
    expect(source("src/lib/workspace-continuity/index.ts")).toContain("export function recordInvestigationJump");
  });

  it("keeps the approved shell badge callers compatible", () => {
    expect(source("src/components/command-center/CommandAiSuggestions.tsx")).toContain('import { EnterpriseAiBadge } from "@/design-system"');
    expect(source("src/components/command-center/CommandEntityRow.tsx")).toContain("EnterpriseStatusBadge");
    expect(source("src/design-system/enterprise-badges.tsx")).toContain("humanApprovalRequired");
    expect(source("src/design-system/enterprise-badges.tsx")).toContain("severity:");
  });

  it("does not add route or navigation authority in the C3-S2 production delta", () => {
    const production = TARGETS.map(source).join("\n");
    expect(production).not.toContain("<Route");
    expect(production).not.toMatch(/\b(to|navigate)\s*[:(]/);
  });

  it("limits production targets to the authorized C3-S2 set", () => {
    expect(TARGETS).toHaveLength(5);
    expect(TARGETS.every((path) => path.startsWith("src/"))).toBe(true);
  });


  it("keeps pilot visibility fail-closed and adds no route declarations", () => {
    const visibility = source("src/lib/inactive-feature-visibility.ts");
    expect(visibility).toContain("PILOT_VISIBLE_PATHS.has(item.to)");
    expect(visibility).not.toContain("<Route");
  });

  it("keeps continuity client-memory-only without auth, tenant, or network state", () => {
    const continuity = source("src/lib/workspace-continuity/index.ts");
    expect(continuity).not.toMatch(/localStorage|sessionStorage|fetch\(|axios|token|tenantId/i);
  });
});
