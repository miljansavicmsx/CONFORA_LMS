import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const enabled = process.env.PLAYWRIGHT_S17_BROWSER === "1";
const verifyHash = process.env.PLAYWRIGHT_S17_VERIFY_HASH ?? "";
const invalidHash = process.env.PLAYWRIGHT_S17_INVALID_HASH ?? "0".repeat(64);
const evidenceRoot = process.env.PLAYWRIGHT_S17_EVIDENCE ?? "";

test.describe("S17 public verification browser sign-off", () => {
  test.skip(!enabled, "Set PLAYWRIGHT_S17_BROWSER=1");

  test.beforeAll(() => {
    if (evidenceRoot) {
      mkdirSync(evidenceRoot, { recursive: true });
    }
  });

  test("valid verification page loads without auth and shows public fields only", async ({ page }) => {
    test.skip(!verifyHash, "No live verify hash");
    test.setTimeout(120_000);

    const mutations: string[] = [];
    page.on("request", (req) => {
      const method = req.method().toUpperCase();
      const url = req.url();
      if (method !== "GET" && method !== "HEAD" && /\/api\/|\/v1\//.test(url)) {
        mutations.push(`${method} ${url}`);
      }
    });

    await page.goto(`/verify/${verifyHash}`);
    await expect(
      page.getByTestId("verify-result-panel").or(page.getByTestId("verify-not-found-state")),
    ).toBeVisible({ timeout: 90_000 });

    if (await page.getByTestId("verify-result-panel").isVisible()) {
      await expect(page.getByTestId("verify-status-label")).toBeVisible();
      const panel = page.getByTestId("verify-result-panel");
      await expect(
        panel.getByText(/reviewer notes|committee deliberation|audit payload|identity document|jmbg|date of birth|@/i),
      ).toHaveCount(0);
    }

    if (evidenceRoot) {
      await page.screenshot({ path: join(evidenceRoot, "s17-valid-verify.png"), fullPage: true });
    }

    expect(mutations.filter((m) => !/verify|public/.test(m))).toHaveLength(0);
  });

  test("invalid verification shows safe not-found state", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(`/verify/${invalidHash}`);
    await expect(
      page.getByTestId("verify-not-found-state").or(page.getByTestId("verify-invalid-link")),
    ).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/stack trace|internal server|prisma|tenantId|userId/i)).toHaveCount(0);
    if (evidenceRoot) {
      await page.screenshot({ path: join(evidenceRoot, "s17-invalid-verify.png"), fullPage: true });
    }
  });

  test("verify lookup page reachable without login", async ({ page }) => {
    await page.goto("/verify");
    await expect(page.getByTestId("verify-lookup-heading")).toBeVisible({ timeout: 30_000 });
    expect(page.url()).not.toMatch(/\/login/);
    if (evidenceRoot) {
      await page.screenshot({ path: join(evidenceRoot, "s17-verify-lookup.png"), fullPage: true });
    }
  });
});
