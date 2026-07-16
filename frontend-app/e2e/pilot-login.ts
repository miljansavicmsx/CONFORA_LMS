import { expect, type Page } from "@playwright/test";

function requirePilotPassword(): string {
  const value = process.env.PLAYWRIGHT_PILOT_PASSWORD;
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  throw new Error("Missing required environment variable: PLAYWRIGHT_PILOT_PASSWORD");
}

/**
 * Local pilot login via Nest `/auth/login` (Login.tsx nest auth path).
 * Fails fast when the login form shows a visible error.
 * Password must come from PLAYWRIGHT_PILOT_PASSWORD (no hardcoded fallback).
 */
export async function loginPilotLearner(
  page: Page,
  email = "pilot.learner@confora.test",
  password = requirePilotPassword(),
): Promise<void> {
  await loginPilotUser(page, email, password);
}

/** Local pilot login for any nest-auth pilot account. */
export async function loginPilotUser(
  page: Page,
  email: string,
  password = requirePilotPassword(),
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
        const msg = await page
          .locator("form")
          .locator("p.text-destructive, [role=alert]")
          .first()
          .textContent();
        throw new Error(`Pilot login failed: ${msg?.trim() || "unknown login error"}`);
      }),
  ]);

  await page.waitForLoadState("domcontentloaded");
}
