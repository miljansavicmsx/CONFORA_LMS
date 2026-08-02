import { defineConfig, devices } from "@playwright/test";

/**
 * E2E: backend (FastAPI) mora raditi ako testovi zadiru u API.
 *
 * Frontend:
 * - Ako Vite već sluša na istom portu kao u `vite.config.ts` (npr. 3001), Playwright ga NE pokreće ponovo (`reuseExistingServer` lokalno).
 * - F4-8g smoke: PLAYWRIGHT_F4_SMOKE=1 enables skip-auth + Nest URL for cutover validation.
 * - Pilot Nest auth (exam-reg / appeals-complaints): dedicated port 3011 with VITE_AUTH_PROVIDER=nest.
 */
const f4Smoke =
  process.env.PLAYWRIGHT_F4_SMOKE === "1" ||
  process.argv.some((arg) => arg.includes("f4-cutover-smoke"));

const pilotNestAuth =
  process.env.PLAYWRIGHT_PILOT_AUTH === "1" ||
  process.env.PLAYWRIGHT_EXAM_REG_1 === "1" ||
  process.env.PLAYWRIGHT_APPEALS_COMPLAINTS_1 === "1" ||
  process.env.PLAYWRIGHT_APPEALS_COMPLAINTS_1R === "1" ||
  process.env.PLAYWRIGHT_APPEALS_COMPLAINTS_2R === "1" ||
  process.argv.some(
    (arg) =>
      arg.includes("exam-reg-1") ||
      arg.includes("appeals-complaints-1") ||
      arg.includes("appeals-complaints-1r") ||
      arg.includes("appeals-complaints-2r"),
  );

const forceFresh = process.env.PLAYWRIGHT_FORCE_FRESH_SERVER === "1";
const e2ePort = process.env.PLAYWRIGHT_E2E_PORT ?? (pilotNestAuth ? "3011" : "3001");
const e2eOrigin = `http://localhost:${e2ePort}`;

if (f4Smoke) {
  process.env.PLAYWRIGHT_F4_SMOKE = "1";
}

if (pilotNestAuth) {
  process.env.PLAYWRIGHT_PILOT_AUTH = "1";
}

const a11yBaseline = process.env.PLAYWRIGHT_A11Y_BASELINE === "1";
const a11yOrigin =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5173";

export default defineConfig({
  testDir: a11yBaseline ? "./tests/accessibility" : "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: a11yBaseline
      ? a11yOrigin
      : (process.env.PLAYWRIGHT_BASE_URL ?? e2eOrigin),
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer:
    process.env.PLAYWRIGHT_NO_WEB_SERVER || a11yBaseline
      ? undefined
      : {
          command: forceFresh || pilotNestAuth ? `npx vite --port ${e2ePort} --strictPort` : "npm run dev",
          url: process.env.PLAYWRIGHT_BASE_URL ?? e2eOrigin,
          reuseExistingServer: forceFresh || pilotNestAuth ? false : !process.env.CI,
          timeout: 240 * 1000,
          env: {
            ...process.env,
            ...(f4Smoke
              ? {
                  VITE_SKIP_AUTH_GUARD: "true",
                  VITE_NEST_AUTH_PILOT_ENABLED: "false",
                  VITE_AUTH_PROVIDER: "legacy",
                  VITE_API_PROVIDER: "nest",
                  VITE_CONFORA_API_URL: process.env.VITE_CONFORA_API_URL ?? "http://127.0.0.1:4000",
                  VITE_HCAPTCHA_SITEKEY:
                    process.env.VITE_HCAPTCHA_SITEKEY ?? "10000000-ffff-ffff-ffff-000000000001",
                }
              : {}),
            ...(pilotNestAuth
              ? {
                  VITE_SKIP_AUTH_GUARD: "false",
                  VITE_NEST_AUTH_PILOT_ENABLED: "true",
                  VITE_AUTH_PROVIDER: "nest",
                  VITE_API_PROVIDER: process.env.VITE_API_PROVIDER ?? "hybrid",
                  VITE_CONFORA_API_URL: process.env.VITE_CONFORA_API_URL ?? "http://127.0.0.1:4000",
                  VITE_LEGACY_API_URL: process.env.VITE_LEGACY_API_URL ?? "http://127.0.0.1:8000",
                  VITE_API_URL: process.env.VITE_API_URL ?? "http://127.0.0.1:8000",
                  VITE_HCAPTCHA_SITEKEY:
                    process.env.VITE_HCAPTCHA_SITEKEY ?? "10000000-ffff-ffff-ffff-000000000001",
                  PORT: e2ePort,
                }
              : {}),
          },
        },
});
