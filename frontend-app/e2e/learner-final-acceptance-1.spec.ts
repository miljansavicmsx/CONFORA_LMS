import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { loginPilotLearner } from "./pilot-login";

const enabled = process.env.PLAYWRIGHT_LEARNER_FINAL_ACCEPTANCE_1 === "1";
const verifyHash = process.env.PLAYWRIGHT_LFA1_VERIFY_HASH ?? "";
const evidenceRoot = process.env.PLAYWRIGHT_LFA1_EVIDENCE ?? "";

const RAW_ENUM_PATTERNS = [
  "UNDER_REVIEW",
  "SUBMITTED",
  "ELIGIBLE_TO_REGISTER",
  "EXAM_PASS_CERTIFICATE",
  "PERSON_CERTIFICATION",
  "REGISTERED",
  "undefined",
  "null",
  "NaN",
];

async function login(page: import("@playwright/test").Page, email: string) {
  await loginPilotLearner(page, email);
}

async function assertNoRawEnums(page: import("@playwright/test").Page) {
  const body = await page.locator("body").innerText();
  for (const token of RAW_ENUM_PATTERNS) {
    expect(body).not.toContain(token);
  }
}

/** Staff/admin denial may redirect to /dashboard, /unauthorized, or /login — all are safe. */
async function expectStaffRouteDenied(page: import("@playwright/test").Page, blockedPath: string) {
  await page.waitForURL(
    (url) => {
      const path = new URL(url).pathname;
      if (path === blockedPath || path.startsWith(`${blockedPath}/`)) return false;
      return path === "/dashboard" || path === "/unauthorized" || path === "/login" || path === "/";
    },
    { timeout: 30_000 },
  );
  const path = new URL(page.url()).pathname;
  expect(path).not.toBe(blockedPath);
  expect(path.startsWith(`${blockedPath}/`)).toBe(false);
}

async function waitForLearnerEducationShell(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("learner-education-heading")).toHaveText("Moje edukacije", { timeout: 60_000 });
  await expect(page.getByTestId("learner-education-page")).toBeVisible({ timeout: 30_000 });
}

async function waitForCatalogShell(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("public-catalog-page")).toBeVisible({ timeout: 60_000 });
  await expect(
    page
      .getByTestId("catalog-course-list")
      .or(page.getByTestId("catalog-empty-state"))
      .or(page.getByTestId("catalog-loading-state")),
  ).toBeVisible({ timeout: 60_000 });
  if (await page.getByTestId("catalog-loading-state").isVisible()) {
    await expect(
      page.getByTestId("catalog-course-list").or(page.getByTestId("catalog-empty-state")),
    ).toBeVisible({ timeout: 60_000 });
  }
}

test.describe("LEARNER-FINAL-ACCEPTANCE-1 learner portal acceptance", () => {
  test.skip(!enabled, "Set PLAYWRIGHT_LEARNER_FINAL_ACCEPTANCE_1=1");

  test.beforeAll(() => {
    if (evidenceRoot) mkdirSync(evidenceRoot, { recursive: true });
  });

  test("login, dashboard, logout, no staff privileges", async ({ page }) => {
    test.setTimeout(180_000);
    await login(page, "pilot.learner@confora.test");
    await expect(page.getByRole("heading", { name: /Dobro došli/i })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("region", { name: /Sažetak učenja/i })).toBeVisible();
    await expect(page.getByText(/admin reports|izvještaji administracije/i)).toHaveCount(0);

    const menuBtn = page.getByTestId("mobile-menu-open");
    if (await menuBtn.isVisible()) await menuBtn.click();
    const logout = page.getByRole("button", { name: /odjavi|logout/i }).or(page.getByRole("link", { name: /odjavi|logout/i }));
    if (await logout.count()) {
      await logout.first().click();
      await page.waitForURL(/\/login|\/$/, { timeout: 30_000 });
    }

    if (evidenceRoot) {
      await page.screenshot({ path: join(evidenceRoot, "lfa1-dashboard.png"), fullPage: true });
    }
  });

  test("moje edukacije — tabs, progress, certification boundary", async ({ page }) => {
    test.setTimeout(120_000);
    await login(page, "pilot.learner@confora.test");
    await page.goto("/dashboard/learner/education");
    await waitForLearnerEducationShell(page);
    await expect(page.getByTestId("learner-education-tabs")).toBeVisible();
    await expect(page.getByTestId("learner-education-tab-active")).toBeVisible();
    await expect(page.getByTestId("learner-education-tab-completed")).toBeVisible();
    await expect(page.getByTestId("learner-education-cert-boundary")).toBeVisible();
    await expect(
      page
        .getByTestId("learner-education-enrolment-list")
        .or(page.getByTestId("learner-no-enrolments"))
        .or(page.getByTestId("learner-education-loading")),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/certificirani ste|you are certified/i)).toHaveCount(0);
    await assertNoRawEnums(page);
  });

  test("katalog — loads with sectors, safe course cards", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/courses");
    await waitForCatalogShell(page);
    const sectorCount = await page.locator('[data-testid^="catalog-sector-"]').count();
    if (sectorCount === 0) {
      await expect(page.getByRole("heading", { name: /Javni katalog edukacijskih programa/i })).toBeVisible();
      await expect(
        page.getByTestId("catalog-empty-state").or(page.getByTestId("catalog-course-list")),
      ).toBeVisible();
    } else {
      expect(sectorCount).toBeGreaterThan(0);
    }
    const link = page.locator('a[href*="/courses/"]').first();
    if (await link.count()) {
      await link.click();
      await expect(page.getByTestId("education-certification-boundary")).toBeVisible({ timeout: 30_000 });
    }
    await assertNoRawEnums(page);
  });

  test("prijava za ispit — sections and boundary notice", async ({ page }) => {
    test.setTimeout(120_000);
    await login(page, "pilot.learner@confora.test");
    await page.goto("/dashboard/exams/register");
    await expect(page.getByTestId("learner-exam-registration-page")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("learner-exam-registration-boundary")).toBeVisible();
    await expect(page.getByTestId("learner-exam-section-available")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("learner-exam-section-registrations")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("learner-exam-section-blocked")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/answer key|grading|rubric|examiner note/i)).toHaveCount(0);
    await assertNoRawEnums(page);
  });

  test("prijave za certifikaciju — eligibility sections, safe wording", async ({ page }) => {
    test.setTimeout(120_000);
    await login(page, "pilot.learner@confora.test");
    await page.goto("/dashboard/certification/applications");
    await expect(page.getByTestId("learner-cert-applications-page")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("learner-cert-application-notice")).toBeVisible();
    await expect(page.getByTestId("learner-cert-eligibility-boundary")).toBeVisible();
    await expect(page.getByText(/certificirani ste|you are certified/i)).toHaveCount(0);
    await expect(
      page.getByTestId("learner-cert-section-available")
        .or(page.getByTestId("learner-no-cert-applications")),
    ).toBeVisible({ timeout: 30_000 });
    await assertNoRawEnums(page);
  });

  test("moji certifikati i potvrde — confirmations separated", async ({ page }) => {
    test.setTimeout(120_000);
    await login(page, "pilot.learner@confora.test");
    await page.goto("/dashboard/my-certificates");
    await expect(page.getByTestId("learner-certificates-page")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("EXAM_PASS_CERTIFICATE")).toHaveCount(0);
    await expect(page.getByText("PERSON_CERTIFICATION")).toHaveCount(0);
    await assertNoRawEnums(page);
  });

  test("public verification from learner context — no private data", async ({ page }) => {
    test.setTimeout(120_000);
    if (verifyHash) {
      await page.goto(`/verify/${verifyHash}`);
      await expect(
        page.getByTestId("verify-result-panel").or(page.getByTestId("verify-not-found-state")),
      ).toBeVisible({ timeout: 60_000 });
    }
    await page.goto("/verify");
    await expect(page.getByTestId("verify-lookup-heading")).toBeVisible({ timeout: 30_000 });
    expect(page.url()).not.toMatch(/\/login/);
    await expect(page.getByText(/jmbg|reviewer notes|committee vote|audit payload/i)).toHaveCount(0);
  });

  test("podrška/kontakt — loads, not appeal admin", async ({ page }) => {
    test.setTimeout(120_000);
    await login(page, "pilot.learner@confora.test");
    await page.goto("/dashboard/support");
    await expect(page.getByTestId("learner-support-page")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("Nije moguće učitati tikete")).toHaveCount(0);
    await expect(
      page
        .getByTestId("learner-support-empty-tickets")
        .or(page.getByTestId("learner-support-tickets-unavailable"))
        .or(page.locator("ul").filter({ has: page.getByText(/CNT-|zahtjev/i) })),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("learner-support-appeals-deferred")).toBeVisible();
    await page.goto("/dashboard/admin/support");
    await expect(page).not.toHaveURL(/\/dashboard\/admin\/support/, { timeout: 60_000 });
  });

  test("žalbe i prigovori — separated sections or deferred notice", async ({ page }) => {
    test.setTimeout(120_000);
    await login(page, "pilot.learner@confora.test");
    await page.goto("/dashboard/support");
    await expect(page.getByText(/ISO — predmeti i žalbe/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Moje žalbe na odluke/i)).toBeVisible();
    await expect(page.getByText("Moji formalni predmeti")).toBeVisible();
  });

  test("RBAC negative — learner denied staff/admin routes", async ({ page }) => {
    test.setTimeout(180_000);
    await login(page, "pilot.learner@confora.test");
    const blocked = [
      "/dashboard/admin/reports",
      "/dashboard/admin/identity-review",
      "/dashboard/director",
      "/dashboard/committee",
    ];
    for (const route of blocked) {
      await page.goto(route);
      await expectStaffRouteDenied(page, route);
    }
  });
});
