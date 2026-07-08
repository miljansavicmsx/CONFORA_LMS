import { expect, type Page } from "@playwright/test";

const defaultPassword = process.env.PLAYWRIGHT_PILOT_PASSWORD ?? "PilotTest!2026";

/**
 * Local pilot login via Nest `/auth/login` (Login.tsx nest auth path).
 * Fails fast when the login form shows a visible error.
 */
export async function loginPilotLearner(
  page: Page,
  email = "pilot.learner@confora.test",
  password = defaultPassword,
): Promise<void> {
  await loginPilotUser(page, email, password);
}

/** Local pilot login for any nest-auth pilot account. */
export async function loginPilotUser(
  page: Page,
  email: string,
  password = defaultPassword,
): Promise<void> {
  await page.goto("/login");
  await expect(page.getByLabel(/^Email$/i)).toBeVisible({ timeout: 30_000 });
  await page.getByLabel(/^Email$/i).fill(email);
  await page.getByLabel(/^Lozinka$/i).fill(password);

  const submit = page.getByRole("button", { name: /^Prijavi se$/i });
  await expect(submit).toBeEnabled();
  await submit.click();

  await Promise.race([
    page.waitForURL(/\/dashboard/, { timeout: 90_000 }),
    page
      .getByText(/prijava nije uspjela|nema veze s nest auth|nema veze s api-jem/i)
      .waitFor({ state: "visible", timeout: 90_000 })
      .then(async () => {
        const msg = await page.locator("form").locator("p.text-destructive, [role=alert]").first().textContent();
        throw new Error(`Pilot login failed: ${msg?.trim() || "unknown login error"}`);
      }),
  ]);

  await page.waitForLoadState("domcontentloaded");
}
