import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

vi.mock("@/pages/iso/IsoReportsPage", () => ({
  default: function MockIsoReportsPage(): null {
    return null;
  },
}));

import { IsoReportsPage } from "@/pages/iso/IsoStaticPages";

function source(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("iso-static-pages residual (MD13)", () => {
  it("exports IsoReportsPage named export required by App.tsx", () => {
    expect(typeof IsoReportsPage).toBe("function");
  });

  it("keeps App.tsx import edge on IsoStaticPages", () => {
    const app = source("src/App.tsx");
    expect(app).toContain('import { IsoReportsPage } from "@/pages/iso/IsoStaticPages"');
    expect(app).toContain("<IsoReportsPage />");
  });

  it("does not duplicate reports implementation in IsoStaticPages", () => {
    const barrel = source("src/pages/iso/IsoStaticPages.tsx");
    expect(barrel).toContain('export { default as IsoReportsPage } from "./IsoReportsPage"');
    expect(barrel).not.toMatch(/fetchReportsSummary|exportReport/);
  });
});
