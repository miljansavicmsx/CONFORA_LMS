import { createHmac } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test, type APIResponse, type Page } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const secretFile = path.join(root, ".secrets/local.env");
const shots = "/opt/cursor/artifacts/route-wiring";
const apiOrigin = "http://localhost:4000";
const caseId = "c8c8c8c8-c8c8-4c8c-8c8c-c8c8c8c8c8c8";

test.use({ screenshot: "off", trace: "off", video: "off" });

function secrets(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of readFileSync(secretFile, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq > 0) env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of input.replace(/=+$/g, "").toUpperCase()) {
    const index = alphabet.indexOf(char);
    if (index < 0) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

const usedCounters = new Map<string, number>();

function codeFor(secret: string, counter: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", base32Decode(secret)).update(buffer).digest();
  const offset = digest[digest.length - 1]! & 0x0f;
  const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, "0");
}

async function freshTotp(secret: string): Promise<string> {
  let counter = Math.floor(Date.now() / 1000 / 30);
  if (usedCounters.get(secret) === counter) {
    const waitMs = (counter + 1) * 30_000 - Date.now() + 750;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    counter = Math.floor(Date.now() / 1000 / 30);
  }
  usedCounters.set(secret, counter);
  return codeFor(secret, counter);
}

function unsafe(url: string): boolean {
  const parsed = new URL(url);
  return [...parsed.searchParams.keys()].some((key) =>
    ["code", "access_token", "id_token", "refresh_token", "id_token_hint"].includes(key),
  );
}

async function shoot(page: Page, name: string): Promise<void> {
  if (unsafe(page.url())) throw new Error(`refusing screenshot ${name}`);
  mkdirSync(shots, { recursive: true });
  await page.screenshot({ path: path.join(shots, `${name}.png`) });
}

async function signIn(page: Page, username: string, otp: string | null, env: Record<string, string>): Promise<void> {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByTestId("keycloak-login").click();
  await page.locator("#username").waitFor();
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(env.DEMO_USER_PASSWORD ?? "");
  await page.locator("#kc-login").click();
  if (otp) {
    const field = page.locator("#otp, input[name='otp']").first();
    await field.waitFor({ timeout: 20_000 });
    await field.fill(await freshTotp(otp));
    await page.locator("#kc-login").click();
  }
}

async function csrf(page: Page): Promise<string> {
  const session = await page.request.get(`${apiOrigin}/v1/auth/session`);
  expect(session.status()).toBe(200);
  const body = (await session.json()) as { csrfToken?: string };
  if (!body.csrfToken) throw new Error("session did not return a CSRF token");
  return body.csrfToken;
}

async function postJson(page: Page, url: string, data: unknown): Promise<APIResponse> {
  return page.request.post(url, {
    data,
    headers: { "X-CSRF-Token": await csrf(page) },
  });
}

test("candidate and committee journeys use the live API", async ({ page }) => {
  test.skip(!existsSync(secretFile), "Live Keycloak secrets are not on this machine.");
  test.setTimeout(240_000);
  const env = secrets();

  await page.goto("/courses");
  await expect(page.getByTestId("public-catalog-page")).toBeVisible({ timeout: 30_000 });
  await expect(
    page.getByTestId("catalog-course-list").or(page.getByTestId("catalog-empty-state")),
  ).toBeVisible({ timeout: 30_000 });
  const catalog = await page.request.get(`${apiOrigin}/v1/public/catalog/courses`);
  expect(catalog.status()).toBe(200);
  const catalogText = JSON.stringify(await catalog.json());
  expect(catalogText).not.toContain("tenantId");
  expect(catalogText).not.toContain("authorUserId");
  expect(catalogText).not.toContain("priceAmount");
  expect(catalogText).toContain("Uvod u digitalnu kompetenciju");
  await expect(page.getByText("Uvod u digitalnu kompetenciju")).toBeVisible();
  await shoot(page, "public-catalog");

  await page.goto("/registry");
  await expect(page.getByTestId("public-registry-page")).toBeVisible();
  await page.getByTestId("registry-verification-input").fill("not-a-real-token");
  await page.getByRole("button", { name: "Provjeri" }).click();
  await expect(page.getByTestId("verify-unconfirmed")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/@demo\.confora\.test/i)).toHaveCount(0);
  await expect(page.getByText(/CON-\d{4}-\d{4}/)).toHaveCount(0);
  await shoot(page, "public-verify-unknown");

  await signIn(page, "exam-candidate", env.OTP_SECRET_EXAM_CANDIDATE ?? null, env);
  await page.waitForURL(/localhost:3001\/dashboard/, { timeout: 20_000 });
  await page.goto("/dashboard");
  await expect(page.getByTestId("session-profile").or(page.locator("main"))).toBeVisible();
  await shoot(page, "candidate-dashboard");

  await page.goto("/dashboard/learner/education");
  await expect(page.getByTestId("learner-education-page")).toBeVisible();
  await page.getByTestId("learner-education-tab-completed").click();
  await expect(page.getByText("Uvod u digitalnu kompetenciju")).toBeVisible({ timeout: 20_000 });
  await shoot(page, "candidate-education");

  await page.goto("/dashboard/exams/sessions");
  await expect(page.getByTestId("exam-session-list-page")).toBeVisible();
  await shoot(page, "candidate-exam-sessions");

  await page.goto("/dashboard/exams/register");
  await expect(page.getByTestId("exam-registration-not-implemented")).toBeVisible();
  await shoot(page, "candidate-exam-booking-not-implemented");

  await page.goto("/dashboard/certification/applications");
  await expect(page.getByText("DIGCOMP")).toBeVisible({ timeout: 20_000 });
  await shoot(page, "candidate-applications");

  await page.goto("/dashboard/certification/documents");
  await expect(page.getByTestId("my-certification-documents")).toBeVisible();
  await expect(page.getByText("EDU-2026-0001")).toBeVisible();
  await expect(page.getByText("EXM-2026-0001")).toBeVisible();
  await shoot(page, "candidate-documents");

  await page.goto("/dashboard/my-certificates");
  await expect(page.getByTestId("learner-certificates-page")).toBeVisible();
  await shoot(page, "candidate-certificates");

  await page.goto("/dashboard/committee/assigned");
  await expect(page.getByTestId("access-denied")).toBeVisible();
  const deniedVote = await postJson(page, `${apiOrigin}/v1/committee/cases/${caseId}/votes`, {
    ballot: "GRANT",
    reasoning: "Kandidat ne glasa.",
  });
  expect(deniedVote.status()).toBe(403);
  const deniedConflict = await postJson(page, `${apiOrigin}/v1/committee/cases/${caseId}/conflict-declaration`, {
    hasConflict: false,
    statement: "Kandidat ne potpisuje izjavu komiteta.",
  });
  expect(deniedConflict.status()).toBe(403);
  await shoot(page, "candidate-committee-denied");

  await signIn(page, "exam-committee", env.OTP_SECRET_EXAM_COMMITTEE ?? null, env);
  await page.waitForURL(/localhost:3001\/dashboard/, { timeout: 20_000 });
  await page.goto("/dashboard/committee/assigned");
  await expect(page.getByTestId("assigned-case")).toContainText(caseId);
  await expect(page.getByTestId("chair-actions-not-implemented")).toBeVisible();
  await shoot(page, "committee-assigned");

  await page.goto(`/dashboard/committee/review?case=${caseId}`);
  await expect(page.getByTestId("committee-review")).toBeVisible();
  await expect(page.locator("#review-case")).toHaveValue(caseId);
  await shoot(page, "committee-review");

  await page.goto(`/dashboard/committee/conflict?case=${caseId}`);
  await expect(page.locator("#conflict-case")).toHaveValue(caseId);
  await page.locator("#conflict-statement").fill("Nema sukoba interesa u ovom sintetičkom predmetu.");
  await page.getByTestId("committee-conflict-submit").click();
  await expect(page.getByRole("status")).toBeVisible({ timeout: 20_000 });
  await shoot(page, "committee-conflict");

  await page.goto(`/dashboard/committee/decision?case=${caseId}`);
  await expect(page.locator("#decision-case")).toHaveValue(caseId);
  await expect(page.getByTestId("committee-vote-submit")).toBeVisible();
  await expect(page.getByTestId("chair-actions-not-implemented")).toBeVisible();
  await page.locator("#decision-reasoning").fill("Obrazloženje se ne šalje u ovom prolazu.");
  await shoot(page, "committee-vote-form");

  await signIn(page, "exam-approver", null, env);
  await page.waitForURL(/localhost:3001\/dashboard/, { timeout: 20_000 });
  await page.goto("/dashboard/admin/item-bank");
  await expect(page.getByTestId("access-denied")).toBeVisible();
  const approverItems = await page.request.get(`${apiOrigin}/v1/staff/exams/items`);
  expect(approverItems.status()).toBe(403);
  await shoot(page, "exam-approver-item-bank-denied");

  await signIn(page, "exam-admin", env.OTP_SECRET_EXAM_ADMIN ?? null, env);
  await page.waitForURL(/localhost:3001\/dashboard/, { timeout: 20_000 });
  await page.goto("/dashboard/admin/education");
  await expect(page.getByTestId("admin-education-not-implemented")).toBeVisible();
  await shoot(page, "admin-education-not-implemented");
});
