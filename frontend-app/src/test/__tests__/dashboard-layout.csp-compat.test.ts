import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const layoutSource = readFileSync(path.join(frontendRoot, "src/layouts/DashboardLayout.tsx"), "utf8");

describe("dashboard-layout CSP compatibility", () => {
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

  it("uses class-based 72/280 desktop spacing semantics", () => {
    expect(layoutSource).toContain("lg:ml-[72px]");
    expect(layoutSource).toContain("lg:ml-[280px]");
    expect(layoutSource).toContain("w-[72px]");
    expect(layoutSource).toContain("w-[280px]");
    expect(layoutSource).toContain("DESKTOP_CONTENT_MARGIN_CLASS");
    expect(layoutSource).toContain("DESKTOP_SIDEBAR_WIDTH_CLASS");
    expect(layoutSource).toContain("contentMarginClass");
    expect(layoutSource).toContain("desktopAsideWidthClass");
  });

  it("maps collapsed/expanded Sidebar widths to matching Tailwind classes", () => {
    expect(layoutSource).toMatch(/\[SIDEBAR_WIDTH_COLLAPSED\]:\s*"w-\[72px\]"/);
    expect(layoutSource).toMatch(/\[SIDEBAR_WIDTH_EXPANDED\]:\s*"w-\[280px\]"/);
    expect(layoutSource).toMatch(/\[SIDEBAR_WIDTH_COLLAPSED\]:\s*"lg:ml-\[72px\]"/);
    expect(layoutSource).toMatch(/\[SIDEBAR_WIDTH_EXPANDED\]:\s*"lg:ml-\[280px\]"/);
  });

  it("keeps mobile drawer as static class width without framer transforms", () => {
    expect(layoutSource).toContain('className="fixed left-0 top-0 z-50 h-full w-[280px]');
    expect(layoutSource).not.toMatch(/initial=\{\{\s*x:/);
    expect(layoutSource).not.toMatch(/animate=\{\{\s*x:/);
    expect(layoutSource).toContain('aria-label="Mobilna navigacija"');
  });

  it("does not reintroduce production CSP style-src unsafe-inline", () => {
    expect(layoutSource).not.toContain("unsafe-inline");
  });
});
