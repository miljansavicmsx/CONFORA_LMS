import { expect, test, type Page } from "@playwright/test";

import { loginPilotLearner, loginPilotUser } from "./pilot-login";

const enabled = process.env.PLAYWRIGHT_APPEALS_COMPLAINTS_2R === "1";

/** Staff email from env only — default is local pilot sysadmin (Nest login without MFA). */
function staffEmail(): string {
  const fromEnv = process.env.PLAYWRIGHT_STAFF_EMAIL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : "pilot.sysadmin@confora.test";
}

/** Detect Latin-1/UTF-8 mojibake without embedding those byte sequences in source. */
const MOJIBAKE = new RegExp(
  ["\u00C5\u00BE", "\u00C5\u00A1", "\u00C4\u0087", "\u00C4\u008D", "\u00C4\u0091", "\u00C3\u00A9", "\u00C3\u00BC", "\u00C3\u00B6"].join("|"),
  "i",
);

const FORBIDDEN_ENUMS = [
  "CERTIFICATION_DECISION_APPEAL",
  "PROCESS_COMPLAINT",
  "APPEAL_SUBMITTED",
  "COMPLAINT_SUBMITTED",
];

const STAFF_ROUTE = "/dashboard/admin/appeals-complaints";
const ISO_APPEALS = "/dashboard/iso/appeals";
const ISO_COMPLAINTS = "/dashboard/iso/complaints";
const SUPPORT_ROUTE = "/dashboard/admin/support";

test.use({ viewport: { width: 1280, height: 900 } });

async function assertNoMojibake(page: Page, label: string): Promise<void> {
  const text = await page.locator("main, [data-testid='staff-appeals-complaints-page']").first().innerText();
  expect(text, `${label} must not contain mojibake`).not.toMatch(MOJIBAKE);
  expect(text, `${label} must contain Latin ž/Ž for appeals UI`).toMatch(/Žalb|žalb|Prigovor|prigovor/);
}

async function assertNoRawEnums(page: Page): Promise<void> {
  const root = page.getByTestId("staff-appeals-complaints-page");
  for (const raw of FORBIDDEN_ENUMS) {
    // SUBMITTED/ACKNOWLEDGED/VOIDED may appear in API-only contexts; forbid exact UI text nodes.
    await expect(root.getByText(raw, { exact: true })).toHaveCount(0);
  }
}

async function expectStaffRouteDenied(page: Page, blockedPath: string): Promise<void> {
  await page.waitForURL(
    (url) => {
      const path = new URL(url).pathname;
      if (path === blockedPath || path.startsWith(`${blockedPath}/`)) return false;
      return path === "/dashboard" || path === "/unauthorized" || path === "/login" || path === "/";
    },
    { timeout: 30_000 },
  );
  const path = new URL(page.url()).pathname;
  expect(path === blockedPath || path.startsWith(`${blockedPath}/`)).toBe(false);
  await expect(page.getByTestId("staff-appeals-complaints-page")).toHaveCount(0);
}

test.describe("APPEALS-COMPLAINTS-2R staff browser confirmation", () => {
  test.skip(!enabled, "Set PLAYWRIGHT_APPEALS_COMPLAINTS_2R=1");

  test("staff routes: Žalbe/Prigovori tabs, iso complaints tab, deferred pipeline, support separate", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await loginPilotUser(page, staffEmail());

    // Primary staff route
    await page.goto(STAFF_ROUTE);
    await expect(page.getByTestId("staff-appeals-complaints-page")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("heading", { name: /Žalbe i prigovori — osoblje/i })).toBeVisible();
    await expect(page.getByTestId("staff-appeals-tab")).toHaveText(/^Žalbe$/);
    await expect(page.getByTestId("staff-complaints-tab")).toHaveText(/^Prigovori$/);
    await expect(page.getByTestId("staff-appeals-section")).toBeVisible();
    await expect(page.getByTestId("staff-resolution-deferred-notice")).toBeVisible();
    await expect(page.getByTestId("staff-resolution-deferred-notice")).toContainText(/B14\/B15/i);
    await expect(page.getByTestId("staff-to-support-link")).toBeVisible();
    await assertNoRawEnums(page);
    await assertNoMojibake(page, "staff primary route");

    // Complaints tab
    await page.getByTestId("staff-complaints-tab").click();
    await expect(page.getByTestId("staff-complaints-section")).toBeVisible();
    await expect(page.getByTestId("staff-complaints-section")).toContainText(/prigovor/i);

    // Acknowledge/void controls when queue has rows
    const complaintCard = page.locator("[data-testid^='staff-complaint-card-']").first();
    if ((await complaintCard.count()) > 0) {
      await complaintCard.click();
      await expect(page.getByTestId("staff-complaint-detail-dialog")).toBeVisible();
      await expect(page.getByTestId("staff-complaint-pipeline-deferred")).toBeVisible();
      const ack = page.getByTestId("staff-complaint-acknowledge");
      const voidBtn = page.getByTestId("staff-complaint-void");
      if ((await ack.count()) > 0) {
        await expect(ack).toBeVisible();
      }
      if ((await voidBtn.count()) > 0) {
        await expect(voidBtn).toBeVisible();
      }
      await page.keyboard.press("Escape");
    }

    await page.getByTestId("staff-appeals-tab").click();
    const appealCard = page.locator("[data-testid^='staff-appeal-card-']").first();
    if ((await appealCard.count()) > 0) {
      await appealCard.click();
      await expect(page.getByTestId("staff-appeal-detail-dialog")).toBeVisible();
      await expect(page.getByTestId("staff-appeal-pipeline-deferred")).toBeVisible();
      const ack = page.getByTestId("staff-appeal-acknowledge");
      const voidBtn = page.getByTestId("staff-appeal-void");
      if ((await ack.count()) > 0) {
        await expect(ack).toBeVisible();
      }
      if ((await voidBtn.count()) > 0) {
        await expect(voidBtn).toBeVisible();
      }
      await page.keyboard.press("Escape");
    }

    // ISO appeals → staff page (Žalbe default)
    await page.goto(ISO_APPEALS);
    await expect(page.getByTestId("staff-appeals-complaints-page")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("staff-appeals-tab")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("staff-appeals-section")).toBeVisible();

    // ISO complaints → Prigovori tab
    await page.goto(ISO_COMPLAINTS);
    await expect(page.getByTestId("staff-appeals-complaints-page")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("staff-complaints-tab")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("staff-complaints-section")).toBeVisible();
    await assertNoMojibake(page, "iso complaints");

    // Contact/support remains separate (link present; do not require full support RBAC for sysadmin)
    await expect(page.getByTestId("staff-to-support-link")).toHaveAttribute("href", SUPPORT_ROUTE);
  });

  test("learner is denied staff appeals-complaints route", async ({ page }) => {
    test.setTimeout(180_000);
    await loginPilotLearner(page);
    await page.goto(STAFF_ROUTE);
    await expectStaffRouteDenied(page, STAFF_ROUTE);
    // StaffAppealsComplaintsGuard → /unauthorized (pilot allowlist may briefly admit path; RBAC denies).
    expect(new URL(page.url()).pathname).toBe("/unauthorized");
  });
});
