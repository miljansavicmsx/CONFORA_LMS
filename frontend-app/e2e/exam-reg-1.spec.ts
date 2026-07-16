import { expect, test } from "@playwright/test";

import { loginPilotLearner } from "./pilot-login";

const enabled = process.env.PLAYWRIGHT_EXAM_REG_1 === "1";

test.use({ viewport: { width: 390, height: 844 } });

test.describe("EXAM-REG-1 learner exam registration", () => {
  test.skip(!enabled, "Set PLAYWRIGHT_EXAM_REG_1=1");

  test("page sections, boundary notice and registration flow", async ({ page, request }) => {
    test.setTimeout(180_000);
    await loginPilotLearner(page);
    await page.goto("/dashboard/exams/register");
    await expect(page.getByTestId("learner-exam-registration-page")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("heading", { name: /^Prijava za ispit$/i })).toBeVisible();
    await expect(page.getByTestId("learner-exam-registration-boundary")).toBeVisible();
    await expect(page.getByTestId("learner-exam-registration-results-notice")).toBeVisible();
    await expect(page.getByTestId("learner-exam-section-available")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("learner-exam-section-registrations")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("learner-exam-section-blocked")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("ELIGIBLE_TO_REGISTER")).toHaveCount(0);
    await expect(page.getByText("BLOCKED_EDUCATION_NOT_COMPLETED")).toHaveCount(0);
    await expect(page.getByText("questionText")).toHaveCount(0);
    await expect(page.getByText("answerKey")).toHaveCount(0);

    const registerBtn = page.locator('[data-testid^="learner-exam-register-btn-"]').first();
    if ((await registerBtn.count()) > 0) {
      await registerBtn.click();
      await expect(page.getByText(/evidentirana/i)).toBeVisible({ timeout: 15_000 });
      await expect(page.locator('[data-testid^="learner-exam-reg-status-"]').first()).toBeVisible({
        timeout: 15_000,
      });
    }

    const apiRes = await request.get("http://127.0.0.1:4000/v1/me/exams/registration-options", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    expect(apiRes.status()).toBe(401);
  });

  test("learner cannot access staff exam queue", async ({ page }) => {
    test.setTimeout(120_000);
    await loginPilotLearner(page);
    await page.goto("/dashboard/iso/applications");
    await page.waitForLoadState("domcontentloaded");
    const unauthorized = page.getByText(/niste ovlašteni|unauthorized|403|pristup/i);
    const noStaffCards = page.locator('[data-testid^="cert-app-card-"]');
    expect(
      (await unauthorized.isVisible().catch(() => false)) || (await noStaffCards.count()) === 0,
    ).toBeTruthy();
  });
});
