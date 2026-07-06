import { expect, test } from "@playwright/test";

import { loginPilotLearner } from "./pilot-login";

const enabled = process.env.PLAYWRIGHT_ADMIN_GOV_UX_POLISH_1 === "1";
const password = process.env.PLAYWRIGHT_PILOT_PASSWORD ?? "PilotTest!2026";

const RAW_ENUMS = [
  "ELIGIBILITY_REVIEW_COMPLETED",
  "EXAM_AUTHORIZATION_COMPLETED",
  "CERTIFICATION_DECISION_RECORDED",
  "UNDER_REVIEW",
  "BUSINESS REPORTS",
  "Business reports dashboard",
  "Unified izvještaji",
  "Education programmes",
];

async function loginManager(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/^Email$/i).fill("pilot.manager@confora.test");
  await page.getByLabel(/^Lozinka$/i).fill(password);
  await page.getByRole("button", { name: /^Prijavi se$/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 90_000 });
}

async function assertNoRawEnums(page: import("@playwright/test").Page) {
  const body = await page.locator("body").innerText();
  for (const token of RAW_ENUMS) {
    expect(body).not.toContain(token);
  }
}

test.describe("ADMIN-GOV-UX-POLISH-1 governance/admin UX", () => {
  test.skip(!enabled, "Set PLAYWRIGHT_ADMIN_GOV_UX_POLISH_1=1");

  test("business reports dashboard — Serbian labels, synthetic banner, refresh", async ({ page }) => {
    test.setTimeout(120_000);
    await loginManager(page);
    await page.goto("/dashboard/admin/reports");
    await expect(page.getByTestId("admin-reports-heading")).toHaveText("Poslovni izvještaji");
    await expect(page.getByTestId("admin-reports-synthetic-banner")).toBeVisible();
    await expect(page.getByTestId("admin-report-refresh-btn")).toBeEnabled();
    await expect(page.getByTestId("admin-summary-decisions-recorded")).toBeVisible();
    await assertNoRawEnums(page);
  });

  test("education management — Upravljanje edukacijama title", async ({ page }) => {
    test.setTimeout(120_000);
    await loginManager(page);
    await page.goto("/dashboard/admin/education");
    await expect(page.getByTestId("admin-education-heading")).toHaveText("Upravljanje edukacijama");
    await expect(page.getByTestId("admin-education-synthetic-banner")).toBeVisible();
    await assertNoRawEnums(page);
  });

  test("learner education title unchanged — Moje edukacije", async ({ page }) => {
    test.setTimeout(120_000);
    await loginPilotLearner(page, "pilot.learner@confora.test", password);
    await page.goto("/dashboard/learner/education");
    await expect(page.getByTestId("learner-education-heading")).toHaveText("Moje edukacije");
  });

  test("sidebar active state — reports route highlights one item", async ({ page }) => {
    test.setTimeout(120_000);
    await loginManager(page);
    await page.goto("/dashboard/admin/reports");
    const nav = page.getByRole("navigation", { name: "Glavna navigacija" });
    const active = nav.locator("a[aria-current='page']");
    await expect(active).toHaveCount(1);
    await expect(active).toContainText(/izvještaj/i);
  });
});
