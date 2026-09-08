import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Static source guards only. Functional Dashboard claims are proven by:
 * - dashboard-layout.runtime.test.ts (component runtime)
 * - e2e/csp-preview-enforce-smoke.spec.ts (browser CSP runtime)
 */
const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const layoutSource = readFileSync(path.join(frontendRoot, "src/layouts/DashboardLayout.tsx"), "utf8");

describe("dashboard-layout CSP static guards", () => {
  it("does not declare React style attribute dependencies", () => {
    expect(layoutSource).not.toMatch(/style=\{\{\s*marginLeft/);
    expect(layoutSource).not.toMatch(/marginLeft:\s*isLg/);
    expect(layoutSource).not.toMatch(/\bstyle=\{\{/);
  });

  it("does not use framer-motion or CSSOM width animation", () => {
    expect(layoutSource).not.toMatch(/from ["']framer-motion["']/);
    expect(layoutSource).not.toMatch(/animate=\{\{\s*width:\s*sidebarWidth/);
    expect(layoutSource).not.toMatch(/\bmotion\./);
    expect(layoutSource).not.toMatch(/AnimatePresence/);
  });

  it("keeps class-based 72/280 desktop spacing markers", () => {
    expect(layoutSource).toContain("lg:ml-[72px]");
    expect(layoutSource).toContain("lg:ml-[280px]");
    expect(layoutSource).toContain("w-[72px]");
    expect(layoutSource).toContain("w-[280px]");
  });

  it("does not reintroduce production CSP style-src unsafe-inline", () => {
    expect(layoutSource).not.toContain("unsafe-inline");
  });
});
