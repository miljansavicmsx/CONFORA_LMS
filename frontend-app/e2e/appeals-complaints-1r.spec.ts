import { expect, test, type Page } from "@playwright/test";

import { loginPilotLearner } from "./pilot-login";

const enabled = process.env.PLAYWRIGHT_APPEALS_COMPLAINTS_1R === "1";
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

test.use({ viewport: { width: 1280, height: 900 } });

async function assertNoMojibake(page: Page, label: string): Promise<void> {
  const text = await page.locator("main, [data-testid='learner-appeals-complaints-page'], [data-testid='learner-support-page']").first().innerText();
  expect(text, `${label} must not contain mojibake`).not.toMatch(MOJIBAKE);
  expect(text, `${label} must contain Latin ž/Ž where expected for appeals UI`).toMatch(/Žalb|žalb|Prigovor|prigovor/);
}

test.describe("APPEALS-COMPLAINTS-1R browser confirmation", () => {
  test.skip(!enabled, "Set PLAYWRIGHT_APPEALS_COMPLAINTS_1R=1");

  test("learner route tabs, boundaries, encoding, and contact separation", async ({ page }) => {
    test.setTimeout(180_000);
    await loginPilotLearner(page);

    await page.goto("/dashboard/appeals-complaints");
    await expect(page.getByTestId("learner-appeals-complaints-page")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("heading", { name: /^Žalbe i prigovori$/i })).toBeVisible();
    await expect(page.getByTestId("learner-appeals-tab")).toHaveText(/^Žalbe$/);
    await expect(page.getByTestId("learner-complaints-tab")).toHaveText(/^Prigovori$/);

    const boundary = page.getByTestId("learner-appeals-complaints-boundary");
    await expect(boundary).toBeVisible();
    await expect(boundary).toContainText(/Žalba \(appeal\).*preispitivanje odluke/i);
    await expect(boundary).toContainText(/Prigovor \(complaint\).*nezadovoljstva procesom/i);

    await expect(page.getByTestId("learner-appeals-section")).toBeVisible();
    await expect(page.getByTestId("learner-appeals-section")).toContainText(/preispitivanje odluke/i);

    await page.getByTestId("learner-complaints-tab").click();
    await expect(page.getByTestId("learner-complaints-section")).toBeVisible();
    await expect(page.getByTestId("learner-complaints-section")).toContainText(/nezadovoljstvo procesom/i);

    for (const raw of FORBIDDEN_ENUMS) {
      await expect(page.getByTestId("learner-appeals-complaints-page").getByText(raw, { exact: true })).toHaveCount(
        0,
      );
    }

    await assertNoMojibake(page, "appeals-complaints page");

    await page.goto("/dashboard/support");
    await expect(page.getByTestId("learner-support-page")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("learner-support-to-appeals-complaints")).toBeVisible();
    await expect(page.getByTestId("learner-support-appeals-deferred")).toHaveCount(0);
    await assertNoMojibake(page, "support page");
  });

  test("submit complaint and attempt appeal in local test mode", async ({ page }) => {
    test.setTimeout(240_000);
    await loginPilotLearner(page);
    await page.goto("/dashboard/appeals-complaints");
    await expect(page.getByTestId("learner-appeals-complaints-page")).toBeVisible({ timeout: 60_000 });

    const complaintSubject = `1R browser prigovor ${Date.now()}`;

    // Complaint submit (no certification mutation required)
    await page.getByTestId("learner-complaints-tab").click();
    await page.getByTestId("learner-complaint-new-btn").click();
    await expect(page.getByTestId("learner-complaint-dialog")).toBeVisible();
    await page.getByTestId("learner-complaint-subject").fill(complaintSubject);
    await page.getByTestId("learner-complaint-description").fill(
      "Automatski prigovor za APPEALS-COMPLAINTS-1R. Ne mijenja certifikaciju ni ispit.",
    );
    await page.getByTestId("learner-complaint-submit").click();
    await expect(page.getByTestId("learner-appeals-complaints-toast")).toContainText(/Prigovor je zaprimljen/i, {
      timeout: 60_000,
    });
    await expect(
      page.getByTestId("learner-appeals-complaints-page").getByText(complaintSubject, { exact: true }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByTestId("learner-appeals-complaints-page").getByText("PROCESS_COMPLAINT", { exact: true }),
    ).toHaveCount(0);
    await assertNoMojibake(page, "after complaint submit");

    // Appeal: open dialog and submit only when a decision UUID is provided
    await page.getByTestId("learner-appeals-tab").click();
    await page.getByTestId("learner-appeal-new-btn").click();
    await expect(page.getByTestId("learner-appeal-dialog")).toBeVisible();
    await expect(page.getByTestId("learner-appeal-type")).toBeVisible();
    const typeOptions = page.getByTestId("learner-appeal-type").locator("option");
    const optionCount = await typeOptions.count();
    for (let i = 0; i < optionCount; i += 1) {
      const label = (await typeOptions.nth(i).textContent()) ?? "";
      expect(label).not.toMatch(/CERTIFICATION_DECISION_APPEAL|ADMINISTRATIVE_REJECTION_APPEAL/);
      expect(label).toMatch(/Žalba/);
    }

    const decisionId = process.env.PLAYWRIGHT_APPEAL_DECISION_ID?.trim();
    if (decisionId) {
      const appealSubject = `1R browser zalba ${Date.now()}`;
      await page.getByTestId("learner-appeal-subject").fill(appealSubject);
      await page.getByTestId("learner-appeal-grounds").fill(
        "Automatska zalba za APPEALS-COMPLAINTS-1R. Ne mijenja status certifikacije ni rezultat ispita.",
      );
      await page.getByTestId("learner-appeal-related-ref").fill(decisionId);
      await page.getByTestId("learner-appeal-submit").click();
      await expect(page.getByTestId("learner-appeals-complaints-toast")).toContainText(/Žalba je zaprimljena/i, {
        timeout: 60_000,
      });
      await expect(page.getByText(appealSubject, { exact: true })).toBeVisible({ timeout: 30_000 });
    } else {
      await page.getByTestId("learner-appeal-subject").fill("1R browser zalba UI potvrda");
      await page.getByTestId("learner-appeal-grounds").fill("UI potvrda obrasca zalbe bez submit fixture.");
      await expect(page.getByTestId("learner-appeal-related-ref")).toBeVisible();
      await page.getByRole("button", { name: /^Odustani$/i }).click();
      test.info().annotations.push({
        type: "note",
        description: "Appeal submit skipped: PLAYWRIGHT_APPEAL_DECISION_ID not set",
      });
    }

    await assertNoMojibake(page, "after appeal dialog");
  });
});
