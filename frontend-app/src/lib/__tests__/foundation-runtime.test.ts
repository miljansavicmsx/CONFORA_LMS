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
    expect(source("src/design-system/index.tsx")).toContain("export function TrustHero");
    expect(source("src/lib/app-workspace.ts")).toContain("export type AppWorkspaceId");
    expect(source("src/lib/inactive-feature-visibility.ts")).toContain("export function filterPilotSidebarSections");
    expect(source("src/lib/workspace-continuity/index.ts")).toContain("export function recordInvestigationJump");
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
