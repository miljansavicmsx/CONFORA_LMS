import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportsDir = path.join(repoRoot, "tests", "e2e", "reports");

test("public Vite routes have no axe violations", async ({ page }) => {
  const violations: unknown[] = [];
  for (const route of ["/login", "/verify"]) {
    await page.goto(route);
    await expect(page.locator("#main-content")).toBeVisible();
    const result = await new AxeBuilder({ page }).analyze();
    violations.push(...result.violations);
  }

  mkdirSync(reportsDir, { recursive: true });
  writeFileSync(
    path.join(reportsDir, "axe-public.json"),
    JSON.stringify({ violations }, null, 2),
  );

  expect(violations).toEqual([]);
});
