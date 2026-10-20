import { expect, test } from "@playwright/test";

/**
 * F4-8g browser smoke for the tracked Vite frontend.
 * Confirms the public cutover surfaces render and that the page does not
 * request the blocked legacy report export.
 */
test.describe("F4-8g cutover smoke", () => {
  test("public verification and login render without a legacy report export", async ({ page }) => {
    const blocked: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/v1/admin/reports/") || url.includes("/api/reports/export")) {
        blocked.push(url);
      }
    });

    await page.goto("/verify");
    await expect(page.getByTestId("verify-lookup-heading")).toHaveText("Javna verifikacija");
    await expect(page.getByTestId("verify-lookup-input")).toBeVisible();

    await page.goto("/login");
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();

    expect(blocked).toEqual([]);
  });
});
