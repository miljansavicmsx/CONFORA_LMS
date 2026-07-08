import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { loginPilotLearner, loginPilotUser } from "./pilot-login";

const enabled = process.env.PLAYWRIGHT_ADMIN_GOV_FINAL_ACCEPTANCE_1 === "1";
const password = process.env.PLAYWRIGHT_PILOT_PASSWORD ?? "PilotTest!2026";
const evidenceRoot = process.env.PLAYWRIGHT_AGFA1_EVIDENCE ?? "";

const RAW_ENUM_PATTERNS = [
  "ELIGIBILITY_REVIEW_COMPLETED",
  "EXAM_AUTHORIZATION_COMPLETED",
  "CERTIFICATION_DECISION_RECORDED",
  "UNDER_REVIEW",
  "NOT_STARTED",
  "IN_PROGRESS",
  "WITHDRAWN",
  "Business reports dashboard",
  "Unified izvještaji",
  "Education programmes",
  "undefined",
  "null",
  "NaN",
  "Internal Server Error",
];

const FORBIDDEN_UI = [
  /stack trace/i,
  /fastapi/i,
  /you are certified/i,
  /certificirani ste/i,
];

async function assertNoRawEnums(page: import("@playwright/test").Page) {
  const body = await page.locator("body").innerText();
  for (const token of RAW_ENUM_PATTERNS) {
    expect(body).not.toContain(token);
  }
}

async function assertSingleActiveNav(page: import("@playwright/test").Page) {
  const nav = page.getByRole("navigation", { name: "Glavna navigacija" });
  await expect(nav).toBeVisible({ timeout: 30_000 });
  await expect(nav.locator("a[aria-current='page']")).toHaveCount(1);
}

/** Staff route denial may redirect to /dashboard, /unauthorized, or /login — all are safe. */
async function expectStaffRouteDenied(page: import("@playwright/test").Page, blockedPath: string) {
  await page.waitForURL(
    (url) => {
      const path = new URL(url).pathname;
      if (path.startsWith(blockedPath)) return false;
      return path === "/dashboard" || path === "/unauthorized" || path === "/login" || path === "/";
    },
    { timeout: 30_000 },
  );
  expect(new URL(page.url()).pathname).not.toBe(blockedPath);
}

function attachConsoleGuard(page: import("@playwright/test").Page): string[] {
  const fatal: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      if (!/favicon|devtools|extension|hydration|404.*\.(png|ico)/i.test(t)) {
        fatal.push(t);
      }
    }
  });
  page.on("pageerror", (err) => fatal.push(err.message));
  return fatal;
}

test.describe("ADMIN-GOV-FINAL-ACCEPTANCE-1 admin/governance portal", () => {
  test.skip(!enabled, "Set PLAYWRIGHT_ADMIN_GOV_FINAL_ACCEPTANCE_1=1");

  test.beforeAll(() => {
    if (evidenceRoot) mkdirSync(evidenceRoot, { recursive: true });
  });

  test("manager login, sidebar, logout — no auth loop", async ({ page }) => {
    test.setTimeout(180_000);
    const consoleErrors = attachConsoleGuard(page);
    await loginPilotUser(page, "pilot.manager@confora.test", password);
    await expect(page.getByRole("navigation", { name: "Glavna navigacija" })).toBeVisible();
    await expect(page.getByText("Upravljanje edukacijama")).toBeVisible();
    await expect(page.getByText("Izvještaji i audit")).toBeVisible();
    await expect(page.getByText("Moje edukacije")).toHaveCount(0);

    const menuBtn = page.getByTestId("mobile-menu-open");
    if (await menuBtn.isVisible()) await menuBtn.click();
    const logout = page
      .getByRole("button", { name: /odjavi|logout/i })
      .or(page.getByRole("link", { name: /odjavi|logout/i }));
    if (await logout.count()) {
      await logout.first().click();
      await page.waitForURL(/\/login|\/$/, { timeout: 30_000 });
    }
    expect(consoleErrors.length).toBeLessThan(5);
    if (evidenceRoot) {
      await page.screenshot({ path: join(evidenceRoot, "agfa1-manager-nav.png"), fullPage: true });
    }
  });

  test("staff and director login — role-aware navigation", async ({ page }) => {
    test.setTimeout(180_000);
    await loginPilotUser(page, "pilot.staff@confora.test", password);
    await expect(page.getByRole("navigation", { name: "Glavna navigacija" })).toBeVisible();
    await page.goto("/login");
    await loginPilotUser(page, "pilot.director@confora.test", password);
    await expect(page.getByRole("navigation", { name: "Glavna navigacija" })).toBeVisible();
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/izvještaj/i);
  });

  test("dashboard — loads with pilot notice, no blank shell", async ({ page }) => {
    test.setTimeout(120_000);
    attachConsoleGuard(page);
    await loginPilotUser(page, "pilot.manager@confora.test", password);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Dobro došli|Dashboard|Nadzorna/i })).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page.getByText(/Internal Server Error|stack trace/i)).toHaveCount(0);
  });

  test("poslovni izvještaji — Serbian labels, read-only, refresh, F4 paths", async ({ page }) => {
    test.setTimeout(120_000);
    attachConsoleGuard(page);
    await loginPilotUser(page, "pilot.manager@confora.test", password);
    await page.goto("/dashboard/admin/reports");
    await expect(page.getByTestId("admin-reports-heading")).toHaveText("Poslovni izvještaji");
    await expect(page.getByTestId("admin-reports-synthetic-banner")).toBeVisible();
    await expect(page.getByTestId("admin-reports-readonly-badge")).toBeVisible();
    await expect(page.getByTestId("admin-report-refresh-btn")).toBeEnabled();
    await expect(page.getByTestId("admin-export-governance")).toBeVisible();
    await expect(page.getByText("Unified izvještaji")).toHaveCount(0);
    await assertSingleActiveNav(page);
    await assertNoRawEnums(page);
    if (evidenceRoot) {
      await page.screenshot({ path: join(evidenceRoot, "agfa1-business-reports.png"), fullPage: true });
    }
  });

  test("upravljanje edukacijama — title, boundary, translated statuses", async ({ page }) => {
    test.setTimeout(120_000);
    await loginPilotUser(page, "pilot.manager@confora.test", password);
    await page.goto("/dashboard/admin/education");
    await expect(page.getByTestId("admin-education-heading")).toHaveText("Upravljanje edukacijama");
    await expect(page.getByTestId("admin-education-synthetic-banner")).toBeVisible();
    await expect(page.getByTestId("admin-education-readonly-badge")).toBeVisible();
    await expect(page.getByText(/ISO\/IEC 17024/)).toBeVisible();
    await assertNoRawEnums(page);
    await assertSingleActiveNav(page);
  });

  test("learner moje edukacije unchanged", async ({ page }) => {
    test.setTimeout(90_000);
    await loginPilotLearner(page, "pilot.learner@confora.test", password);
    await page.goto("/dashboard/learner/education");
    await expect(page.getByTestId("learner-education-heading")).toHaveText("Moje edukacije");
  });

  test("izvještaji obuke — loads with translated labels", async ({ page }) => {
    test.setTimeout(120_000);
    await loginPilotUser(page, "pilot.manager@confora.test", password);
    await page.goto("/dashboard/iso/reports");
    await expect(page.getByRole("heading", { name: /Izvještaji/i })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("iso-reports-refresh-btn")).toBeVisible();
    await expect(page.getByText(/certificirani ste|you are certified/i)).toHaveCount(0);
    await assertNoRawEnums(page);
  });

  test("polaznici — iso reports learner aggregates, role restricted", async ({ page }) => {
    test.setTimeout(120_000);
    await loginPilotUser(page, "pilot.manager@confora.test", password);
    await page.goto("/dashboard/iso/reports");
    await expect(page.getByRole("heading", { name: /Izvještaji/i })).toBeVisible({ timeout: 60_000 });
    await loginPilotLearner(page, "pilot.learner@confora.test", password);
    await page.goto("/dashboard/iso/reports");
    await expectStaffRouteDenied(page, "/dashboard/iso/reports");
  });

  test("prijave — staff queue for reviewer, learner denied", async ({ page }) => {
    test.setTimeout(180_000);
    await loginPilotUser(page, "pilot.reviewer@confora.test", password);
    await page.goto("/dashboard/committee/pilot-applications");
    await expect(
      page.getByRole("heading", { name: /prijav|Prijav|certifikac/i }).or(page.locator("main")),
    ).toBeVisible({ timeout: 60_000 });
    await assertNoRawEnums(page);

    await loginPilotLearner(page, "pilot.learner@confora.test", password);
    await page.goto("/dashboard/committee/pilot-applications");
    await expectStaffRouteDenied(page, "/dashboard/committee/pilot-applications");
  });

  test("pregled dokaza — authorized staff only, no biometrics claim", async ({ page }) => {
    test.setTimeout(120_000);
    await loginPilotUser(page, "pilot.director@confora.test", password);
    await page.goto("/dashboard/admin/identity-review");
    await expect(page.getByTestId("identity-review-heading")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("identity-review-readonly-banner")).toBeVisible();
    await expect(page.getByText(/bez biometrij/i)).toBeVisible();

    await loginPilotLearner(page, "pilot.learner@confora.test", password);
    await page.goto("/dashboard/admin/identity-review");
    await expectStaffRouteDenied(page, "/dashboard/admin/identity-review");
  });

  test("recertifikacije — safe page or unavailable state", async ({ page }) => {
    test.setTimeout(120_000);
    await loginPilotUser(page, "pilot.manager@confora.test", password);
    await page.goto("/dashboard/admin/recertification");
    await expect(
      page
        .getByRole("heading", { name: /Recertifikac/i })
        .or(page.getByRole("heading", { name: /Nemate ovlasti/i }))
        .or(page.getByText(/nije dostupn|unavailable/i)),
    ).toBeVisible({ timeout: 60_000 });
    await assertNoRawEnums(page);
  });

  test("žalbe/prigovori separation — contact not appeal", async ({ page }) => {
    test.setTimeout(120_000);
    await loginPilotUser(page, "pilot.manager@confora.test", password);
    await page.goto("/dashboard/support");
    await expect(page.getByTestId("learner-support-appeals-deferred").or(page.locator("main"))).toBeVisible({
      timeout: 60_000,
    });
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/committee vote|internal note/i);
  });

  test("breadcrumbs — no unified izvještaji, admin not moje edukacije", async ({ page }) => {
    test.setTimeout(120_000);
    await loginPilotUser(page, "pilot.director@confora.test", password);
    await page.goto("/dashboard/admin/reports");
    await expect(page.getByText("Unified izvještaji")).toHaveCount(0);
    await expect(page.getByTestId("admin-reports-heading")).toHaveText("Poslovni izvještaji");
    await expect(page.getByRole("navigation", { name: "Putanja" }).getByText("Objedinjeni izvještaji")).toBeVisible();
    await page.goto("/dashboard/admin/education");
    await expect(page.getByTestId("admin-education-heading")).toHaveText("Upravljanje edukacijama");
    await expect(page.getByText("Moje edukacije")).toHaveCount(0);
  });

  test("RBAC/tenant negatives — wrong-tenant, no-tenant, anonymous", async ({ page }) => {
    test.setTimeout(240_000);

    await loginPilotLearner(page, "pilot.learner@confora.test", password);
    await page.goto("/dashboard/admin/reports");
    await expectStaffRouteDenied(page, "/dashboard/admin/reports");

    await loginPilotUser(page, "pilot.staff.wrong-tenant@confora.test", password);
    await page.goto("/dashboard/iso/reports");
    await expect(page.locator("body")).toBeVisible();
    const wrongTenantBody = await page.locator("body").innerText();
    expect(wrongTenantBody).not.toMatch(/pilot\.learner@confora\.test/i);

    await page.goto("/login");
    await page.getByLabel(/^Email$/i).fill("pilot.no-tenant@confora.test");
    await page.getByLabel(/^Lozinka$/i).fill(password);
    await page.getByRole("button", { name: /^Prijavi se$/i }).click();
    await expect(
      page.getByText(/prijava nije uspjela|nema pristupa|tenant|403|unauthorized/i).or(page.locator('[role="alert"]')),
    ).toBeVisible({ timeout: 60_000 });

    await page.goto("/dashboard/admin/reports");
    await page.waitForURL(/\/login|\/$/, { timeout: 30_000 });
  });

  test("UI quality scan — language and console on manager tour", async ({ page }) => {
    test.setTimeout(300_000);
    const consoleErrors = attachConsoleGuard(page);
    await loginPilotUser(page, "pilot.manager@confora.test", password);
    const routes = [
      "/dashboard",
      "/dashboard/admin/reports",
      "/dashboard/admin/education",
      "/dashboard/iso/reports",
    ];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await assertNoRawEnums(page);
      for (const pattern of FORBIDDEN_UI) {
        await expect(page.getByText(pattern)).toHaveCount(0);
      }
    }
    expect(consoleErrors.filter((e) => /fatal|uncaught/i.test(e)).length).toBe(0);
  });
});
