import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import IsoReportsPageDefault from "@/pages/iso/IsoReportsPage";
import { IsoReportsPage } from "@/pages/iso/IsoStaticPages";

function source(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("iso-static-pages residual (MD13)", () => {
  it("exports the real IsoReportsPage through IsoStaticPages", () => {
    expect(typeof IsoReportsPage).toBe("function");
    expect(IsoReportsPage).toBe(IsoReportsPageDefault);
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
