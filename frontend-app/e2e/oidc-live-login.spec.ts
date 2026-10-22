import { createHmac } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test, type Page } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const shots = "/opt/cursor/artifacts/oidc";
const caseId = "c8c8c8c8-c8c8-4c8c-8c8c-c8c8c8c8c8c8";

test.use({ screenshot: "off", trace: "off", video: "off" });

function secrets(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of readFileSync(path.join(root, ".secrets/local.env"), "utf8").split("\n")) {
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

test("live Keycloak sessions, role limits, logout, and idle expiry", async ({ page }) => {
  test.setTimeout(180_000);
  const env = secrets();
  await signIn(page, "exam-candidate", env.OTP_SECRET_EXAM_CANDIDATE ?? null, env);
  await page.waitForURL(/localhost:3001\/dashboard/, { timeout: 20_000 });
  expect(unsafe(page.url())).toBe(false);
  await page.goto("/dashboard/profil");
  await expect(page.getByTestId("session-profile")).toBeVisible();
  await expect(page.getByTestId("session-email")).toContainText("exam-candidate@demo.confora.test");
  await expect(page.getByTestId("session-courses")).toContainText("Uvod u digitalnu kompetenciju");
  await expect(page.getByTestId("session-applications")).toContainText("DIGCOMP");
  await expect(page.getByTestId("session-edu")).toContainText("EDU-2026-0001");
  await expect(page.getByTestId("session-exm")).toContainText("EXM-2026-0001");
  await shoot(page, "candidate-profile");

  await page.goto("/dashboard/committee/assigned");
  await expect(page.getByTestId("access-denied")).toBeVisible();
  await shoot(page, "candidate-committee-denied");
  const candidateCase = await page.request.get(`http://localhost:4000/v1/committee/cases/${caseId}`);
  expect(candidateCase.status()).toBe(403);

  await signIn(page, "exam-committee", env.OTP_SECRET_EXAM_COMMITTEE ?? null, env);
  await page.waitForURL(/localhost:3001\/dashboard/, { timeout: 20_000 });
  await page.goto("/dashboard/committee/assigned");
  await expect(page.getByTestId("assigned-case")).toContainText(caseId);
  await shoot(page, "committee-assigned");
  const listed = await page.request.get("http://localhost:4000/v1/committee/cases");
  expect(listed.status()).toBe(200);
  const rows = (await listed.json()) as { caseId: string }[];
  expect(rows.some((row) => row.caseId === caseId)).toBe(true);

  await signIn(page, "exam-approver", null, env);
  await page.waitForURL(/localhost:3001\/dashboard/, { timeout: 20_000 });
  await page.goto("/dashboard/admin/item-bank");
  await expect(page.getByTestId("access-denied")).toBeVisible();
  await expect(page.getByTestId("denied-account")).toContainText("exam-approver@demo.confora.test");
  await shoot(page, "exam-approver-denied");
  const approverItems = await page.request.get("http://localhost:4000/v1/staff/exams/items");
  expect(approverItems.status()).toBe(403);

  await signIn(page, "exam-committee-chair", null, env);
  await page.waitForURL(/localhost:3001\/dashboard/, { timeout: 20_000 });
  await page.goto("/dashboard/committee/assigned");
  await expect(page.getByTestId("access-denied")).toBeVisible();
  await expect(page.getByTestId("denied-account")).toContainText("exam-committee-chair@demo.confora.test");
  await expect(page.getByTestId("chair-not-implemented")).toBeVisible();
  await shoot(page, "committee-chair-not-implemented");
  const chairCase = await page.request.get(`http://localhost:4000/v1/committee/cases/${caseId}`);
  expect(chairCase.status()).toBe(403);

  await page.goto("/dashboard");
  await page.locator("header button").last().click();
  await page.getByText("Sign out").click();
  await page.waitForURL(/localhost:3001\/login/, { timeout: 20_000 });
  expect(unsafe(page.url())).toBe(false);
  await expect(page.getByTestId("keycloak-login")).toBeVisible();
  await shoot(page, "logout-login");
  const afterLogout = await page.request.get("http://localhost:4000/v1/auth/session");
  expect(afterLogout.status()).toBe(401);

  await signIn(page, "exam-candidate", env.OTP_SECRET_EXAM_CANDIDATE ?? null, env);
  await page.waitForURL(/localhost:3001\/dashboard/, { timeout: 20_000 });
  await page.goto("/dashboard/profil");
  await expect(page.getByTestId("session-profile")).toBeVisible();
  await page.waitForTimeout(13_000);
  await page.reload();
  await page.waitForURL(/\/login\?reason=expired/, { timeout: 20_000 });
  await expect(page.getByTestId("session-notice")).toBeVisible();
  await shoot(page, "session-expired-login");
  await page.getByTestId("keycloak-login").click();
  await page.locator("#username").waitFor();
  await expect(page.locator("#username")).toHaveValue("");
  await expect(page.locator("#password")).toHaveValue("");
  await shoot(page, "session-expired-keycloak-form");

  await signIn(page, "exam-outsider", null, env);
  await page.waitForURL(/\/login\?reason=denied/, { timeout: 20_000 });
  await shoot(page, "outsider-denied");
  await signIn(page, "exam-bad-tenant", null, env);
  await page.waitForURL(/\/login\?reason=denied/, { timeout: 20_000 });
  await shoot(page, "bad-tenant-denied");
});

test("api rejects a missing session and a forged bearer", async ({ request }) => {
  expect((await request.get("http://localhost:4000/v1/auth/session")).status()).toBe(401);
  expect(
    (
      await request.get("http://localhost:4000/v1/auth/session", {
        headers: { Authorization: "Bearer not-a-token" },
      })
    ).status(),
  ).toBe(401);
  expect((await request.get("http://localhost:4000/v1/committee/cases")).status()).toBe(401);
});
