import { expect, test } from "@playwright/test";

import { loginPilotUser } from "./pilot-login";

const CERTIFICANT = "pilot.learner2@confora.test";

test.describe("TD-082 live certificant CPD selector", () => {
  test("recertifications page loads selector without certificateId fallback", async ({ page }) => {
    await loginPilotUser(page, CERTIFICANT);

    await page.goto("/dashboard/my-recertifications");
    await expect(page.getByTestId("certificate-selector")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("certificate-selector-empty")).toHaveCount(0);
    await expect(page.getByTestId("certificate-selector-fallback-hint")).toHaveCount(0);

    const select = page.getByTestId("certificate-selector-select");
    await expect(select).toBeVisible();
    await expect(select.locator("option")).toContainText(["CON-PILOT-000082"]);

    const optionValues = await select.locator("option").evaluateAll((opts) =>
      opts.map((o) => (o as HTMLOptionElement).value).filter(Boolean),
    );
    const selected = await select.inputValue();
    if (optionValues.length === 1) {
      expect(selected.length).toBeGreaterThan(0);
    } else {
      expect(selected).toBe("");
      await select.selectOption("CON-PILOT-000082");
    }

    await expect(page.getByTestId("certificate-selector-summary")).toBeVisible();
    await expect(page.getByTestId("cpd-recert-panel")).toBeVisible();
    await expect(page.getByTestId("cpd-hours-input")).toBeVisible();
  });

  test("fallback hint only when certificateId query param is used", async ({ page }) => {
    await loginPilotUser(page, CERTIFICANT);

    await page.goto(
      `/dashboard/my-recertifications?certificateId=${encodeURIComponent("CON-PILOT-000082")}`,
    );
    await expect(page.getByTestId("certificate-selector")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("certificate-selector-fallback-hint")).toBeVisible();
  });
});
