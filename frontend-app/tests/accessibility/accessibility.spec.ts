import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

import { WCAG_22_AA_AUTOMATED_SUBSET_TAGS } from "./wcag-tags";

/**
 * R0-7D2 minimal browser accessibility baseline.
 *
 * Claims (only when green):
 * - ACCESSIBILITY_WORKFLOW_EXECUTES
 * - BROWSER_AXE_CHECKS_PASS (named WCAG_2_2_AA_AUTOMATED_SUBSET tags)
 * - ACCESSIBILITY_REPORT_PUBLISHED (artifact JSON)
 *
 * Non-claims:
 * - full WCAG 2.2 AA conformity
 * - legal compliance / manual review / AT compatibility
 * - authenticated routes / design-token contrast / production readiness
 */

const PUBLIC_UNAUTHENTICATED_ROUTES = [
  "/",
  "/login",
  "/verify",
  "/contact",
  "/pricing",
  "/faq",
] as const;

const REPORT_DIR =
  process.env.A11Y_REPORT_DIR ??
  path.join(process.cwd(), "test-results", "accessibility");

function routeSlug(route: string): string {
  return route === "/" ? "root" : route.replace(/^\//, "").replace(/\//g, "_");
}

async function analyzePublicRoute(page: Page, route: string) {
  await page.goto(route, { waitUntil: "networkidle" });

  const builder = new AxeBuilder({ page }).withTags([
    ...WCAG_22_AA_AUTOMATED_SUBSET_TAGS,
  ]);

  const results = await builder.analyze();

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(
    REPORT_DIR,
    `axe-${routeSlug(route)}.json`,
  );
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        route,
        ruleset: "WCAG_2_2_AA_AUTOMATED_SUBSET",
        tags: [...WCAG_22_AA_AUTOMATED_SUBSET_TAGS],
        url: results.url,
        timestamp: new Date().toISOString(),
        violations: results.violations,
        passesCount: results.passes.length,
        incompleteCount: results.incomplete.length,
        nonClaims: [
          "full_wcag_22_aa_conformity",
          "legal_accessibility_compliance",
          "manual_review",
          "assistive_technology_compatibility",
          "authenticated_route_coverage",
          "design_token_contrast_validation",
          "production_accessibility_readiness",
        ],
      },
      null,
      2,
    ),
  );

  expect(
    results.violations,
    `WCAG_2_2_AA_AUTOMATED_SUBSET violations on ${route}`,
  ).toEqual([]);
}

test.describe("R0-7D2 frontend-app public axe baseline", () => {
  for (const route of PUBLIC_UNAUTHENTICATED_ROUTES) {
    test(`axe WCAG_2_2_AA_AUTOMATED_SUBSET: ${route}`, async ({ page }) => {
      await analyzePublicRoute(page, route);
    });
  }
});
