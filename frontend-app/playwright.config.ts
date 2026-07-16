import { defineConfig, devices } from "@playwright/test";

/**
 * E2E: backend (FastAPI) mora raditi ako testovi zadiru u API.
 *
 * Frontend:
 * - Ako Vite već sluša na istom portu kao u `vite.config.ts` (npr. 3001), Playwright ga NE pokreće ponovo (`reuseExistingServer` lokalno).
 * - F4-8g smoke: PLAYWRIGHT_F4_SMOKE=1 enables skip-auth + Nest URL for cutover validation.
 */
const f4Smoke =
  process.env.PLAYWRIGHT_F4_SMOKE === "1" ||
  process.argv.some((arg) => arg.includes("f4-cutover-smoke"));

if (f4Smoke) {
  process.env.PLAYWRIGHT_F4_SMOKE = "1";
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    /** Usklađeno s `vite.config.ts` (`server.port`, trenutno 3001). */
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_NO_WEB_SERVER
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3001",
        /** Lokalno: ako je port već zauzet (Vite gore), preskoči `npm run dev`. U CI uvijek podigni svjež server. */
        reuseExistingServer: !process.env.CI,
        /** Čekanje da Vite postane spreman (sporiji disk / prvi cold start na Windowsu). */
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
        },
      },
});
