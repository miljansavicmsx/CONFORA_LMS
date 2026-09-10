import { expect, test } from "@playwright/test";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * CMD-04 browser smoke under enforced Vite preview CSP.
 *
 * Builds the csp-dashboard-runtime harness that imports and mounts the REAL
 * frontend-app/src/layouts/DashboardLayout.tsx, then serves it via vite preview
 * so cspPreviewPlugin applies enforce CSP + entry script nonces.
 *
 * Claim boundary: browser proves CSP/nonce/entry + real DashboardLayout mount
 * with Header/Sidebar (and four missing-module) stubs. Primary collapsed/
 * expanded/mobile DOM contract is also covered by Vitest runtime test.
 */
const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const harnessDir = path.join(frontendRoot, "e2e", "csp-dashboard-runtime");
const harnessConfig = path.join(harnessDir, "vite.config.mjs");
const distRoot = path.join(frontendRoot, ".csp-dashboard-runtime-dist");
const previewPort = Number(process.env.CSP_PREVIEW_SMOKE_PORT ?? "4175");
const previewOrigin = `http://127.0.0.1:${previewPort}`;

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) {
        return;
      }
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Preview server did not become ready at ${url}`);
}

function runNode(args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd,
      env: { ...process.env, CSP_MODE: "enforce" },
      stdio: "pipe",
      windowsHide: true,
    });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += String(d);
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed (${code}): ${args.join(" ")}\n${stderr}`));
      }
    });
  });
}

test.describe("CSP preview enforce smoke — real DashboardLayout", () => {
  let previewProc: ChildProcessWithoutNullStreams | undefined;

  test.beforeAll(async () => {
    test.setTimeout(180_000);
    rmSync(distRoot, { recursive: true, force: true });
    const viteCli = path.join(frontendRoot, "node_modules", "vite", "bin", "vite.js");
    await runNode([viteCli, "build", "--config", harnessConfig], frontendRoot);
    if (!existsSync(path.join(distRoot, "index.html"))) {
      throw new Error("Harness build did not produce index.html");
    }
    previewProc = spawn(
      process.execPath,
      [
        viteCli,
        "preview",
        "--config",
        harnessConfig,
        "--host",
        "127.0.0.1",
        "--port",
        String(previewPort),
        "--strictPort",
      ],
      {
        cwd: frontendRoot,
        env: { ...process.env, CSP_MODE: "enforce" },
        stdio: "pipe",
        windowsHide: true,
      },
    );
    await waitForServer(previewOrigin + "/", 90_000);
  });

  test.afterAll(async () => {
    if (previewProc && !previewProc.killed) {
      previewProc.kill("SIGTERM");
    }
    rmSync(distRoot, { recursive: true, force: true });
  });

  test("imports and mounts actual DashboardLayout under enforced CSP", async ({ page, request }) => {
    test.setTimeout(120_000);
    const cspViolations: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (/refused to (execute|apply|load)|content security policy/i.test(text)) {
        cspViolations.push(text);
      }
    });
    page.on("pageerror", (err) => {
      if (/content security policy/i.test(err.message)) {
        cspViolations.push(err.message);
      }
    });

    const doc = await request.get(previewOrigin + "/");
    expect(doc.ok()).toBeTruthy();
    const headers = doc.headers();
    const csp = headers["content-security-policy"] ?? "";
    expect(csp.length).toBeGreaterThan(0);
    expect(headers["content-security-policy-report-only"] ?? "").toBe("");
    const nonceHeader = headers["x-nonce"] ?? "";
    expect(nonceHeader.length).toBeGreaterThan(0);
    expect(csp).toContain(`'nonce-${nonceHeader}'`);
    const html = await doc.text();
    const scriptMatch = html.match(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>/i);
    expect(scriptMatch).not.toBeNull();
    expect(scriptMatch![0]).toContain(`nonce="${nonceHeader}"`);

    await page.goto(previewOrigin + "/", { waitUntil: "networkidle" });

    await expect.poll(async () => page.evaluate(() => window.__ACTUAL_DASHBOARD_IMPORTED__ === true)).toBe(true);
    await expect.poll(async () => page.evaluate(() => window.__ACTUAL_DASHBOARD_MOUNTED__ === true)).toBe(true);

    const importUrl = await page.evaluate(() => window.__DASHBOARD_IMPORT_URL__ ?? "");
    expect(importUrl.replace(/\\/g, "/")).toMatch(/DashboardLayout/);
    const marginMap = await page.evaluate(() => window.__DASHBOARD_MARGIN_CLASS_MAP__);
    expect(marginMap?.[280]).toBe("lg:ml-[280px]");
    expect(marginMap?.[72]).toBe("lg:ml-[72px]");

    await expect(page.getByTestId("dashboard-content-shell")).toBeVisible();
    await expect(page.getByTestId("dashboard-children")).toHaveText("dashboard-child");
    await expect(page.getByTestId("dashboard-content-shell")).toHaveClass(/lg:ml-\[280px\]/);
    await expect(page.getByTestId("dashboard-desktop-aside")).toHaveClass(/w-\[280px\]/);
    expect(await page.getByTestId("dashboard-content-shell").getAttribute("style")).toBeNull();

    expect(cspViolations, cspViolations.join("\n")).toHaveLength(0);
  });

  test("expanded / collapsed / mobile runtime states on actual DashboardLayout", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(previewOrigin + "/", { waitUntil: "networkidle" });
    await expect.poll(async () => page.evaluate(() => window.__ACTUAL_DASHBOARD_MOUNTED__ === true)).toBe(true);

    await page.evaluate(() => window.__setDashboardLayoutState__?.({ sidebarCollapsed: false, drawerOpen: false }));
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByTestId("dashboard-content-shell")).toHaveClass(/lg:ml-\[280px\]/);
    await expect(page.getByTestId("dashboard-desktop-aside")).toHaveClass(/w-\[280px\]/);
    await expect(page.getByTestId("harness-sidebar")).toHaveAttribute("data-collapsed", "false");

    await page.evaluate(() => window.__setDashboardLayoutState__?.({ sidebarCollapsed: true, drawerOpen: false }));
    await expect(page.getByTestId("dashboard-content-shell")).toHaveClass(/lg:ml-\[72px\]/);
    await expect(page.getByTestId("dashboard-desktop-aside")).toHaveClass(/w-\[72px\]/);
    await expect(page.getByTestId("harness-sidebar")).toHaveAttribute("data-collapsed", "true");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.__setDashboardLayoutState__?.({ sidebarCollapsed: false, drawerOpen: true }));
    await expect(page.getByTestId("dashboard-mobile-drawer")).toBeVisible();
    await expect(page.locator('nav[aria-label="Mobilna navigacija"]')).toBeVisible();
    expect(await page.getByTestId("dashboard-mobile-drawer").getAttribute("style")).toBeNull();
  });

  test("report-only mode is not conflated with default enforce", async ({ request }) => {
    const doc = await request.get(previewOrigin + "/");
    const headers = doc.headers();
    expect(headers["content-security-policy"]).toBeTruthy();
    expect(headers["content-security-policy-report-only"] ?? "").toBe("");
  });
});
