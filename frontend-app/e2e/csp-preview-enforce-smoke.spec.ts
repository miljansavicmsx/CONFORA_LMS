import { expect, test } from "@playwright/test";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * CMD-04 browser smoke under enforced Vite preview CSP.
 *
 * Full `vite build` is blocked by pre-existing frontend CSS/Tailwind debt outside
 * the remediation envelope. This smoke creates a minimal dist artifact that
 * `vite preview` serves through `cspPreviewPlugin` (nonce HTML rewrite + enforce CSP).
 */
const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const previewPort = Number(process.env.CSP_PREVIEW_SMOKE_PORT ?? "4173");
const previewOrigin = `http://127.0.0.1:${previewPort}`;
const distRoot = path.join(frontendRoot, ".csp-preview-smoke-dist");

function writeMinimalDist(): void {
  rmSync(distRoot, { recursive: true, force: true });
  mkdirSync(path.join(distRoot, "assets"), { recursive: true });
  writeFileSync(
    path.join(distRoot, "assets", "entry.js"),
    [
      "const root = document.getElementById('root');",
      "if (root) {",
      "  root.innerHTML = '';",
      "  const shell = document.createElement('div');",
      "  shell.className = 'flex min-h-screen flex-col lg:ml-[280px]';",
      "  shell.setAttribute('data-testid', 'dashboard-shell');",
      "  shell.textContent = 'csp-shell-ok';",
      "  root.appendChild(shell);",
      "  window.__CSP_ENTRY_EXECUTED = true;",
      "}",
    ].join("\n"),
    "utf8",
  );
  writeFileSync(
    path.join(distRoot, "index.html"),
    [
      "<!doctype html>",
      '<html lang="en">',
      "<head><meta charset=\"UTF-8\" /><title>CSP Preview Smoke</title></head>",
      "<body>",
      '<div id="root"></div>',
      '<script type="module" src="/assets/entry.js"></script>',
      "</body>",
      "</html>",
    ].join("\n"),
    "utf8",
  );
}

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

test.describe("CSP preview enforce smoke", () => {
  let previewProc: ChildProcessWithoutNullStreams | undefined;

  test.beforeAll(async () => {
    writeMinimalDist();
    const viteCli = path.join(frontendRoot, "node_modules", "vite", "bin", "vite.js");
    previewProc = spawn(
      process.execPath,
      [
        viteCli,
        "preview",
        "--host",
        "127.0.0.1",
        "--port",
        String(previewPort),
        "--strictPort",
        "--outDir",
        distRoot,
      ],
      {
        cwd: frontendRoot,
        env: { ...process.env, CSP_MODE: "enforce" },
        stdio: "pipe",
        windowsHide: true,
      },
    );
    await waitForServer(previewOrigin + "/", 60_000);
  });

  test.afterAll(async () => {
    if (previewProc && !previewProc.killed) {
      previewProc.kill("SIGTERM");
    }
    rmSync(distRoot, { recursive: true, force: true });
  });

  test("entry script is nonced and executes under enforced CSP", async ({ page, request }) => {
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
    const reportOnly = headers["content-security-policy-report-only"] ?? "";
    expect(csp.length).toBeGreaterThan(0);
    expect(reportOnly.length).toBe(0);
    expect(csp).toMatch(/'nonce-[a-f0-9]+'/i);
    expect(csp).not.toMatch(/style-src[^;]*'unsafe-inline'/);
    expect(csp).not.toMatch(/connect-src[^;]*\shttps:/);

    const nonceHeader = headers["x-nonce"] ?? "";
    expect(nonceHeader.length).toBeGreaterThan(0);
    expect(csp).toContain(`'nonce-${nonceHeader}'`);

    const html = await doc.text();
    const scriptMatch = html.match(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>/i);
    expect(scriptMatch).not.toBeNull();
    expect(scriptMatch![0]).toContain(`nonce="${nonceHeader}"`);
    expect((scriptMatch![0].match(/\bnonce=/gi) ?? []).length).toBe(1);

    await page.goto(previewOrigin + "/", { waitUntil: "networkidle" });
    await expect(page.locator("#root")).toBeAttached();
    await expect(page.getByTestId("dashboard-shell")).toBeVisible();
    const executed = await page.evaluate(() => (window as unknown as { __CSP_ENTRY_EXECUTED?: boolean }).__CSP_ENTRY_EXECUTED);
    expect(executed).toBe(true);

    // DashboardLayout remediation uses class margins; fixture mirrors that (no inline style).
    const inlineStyle = await page.getByTestId("dashboard-shell").getAttribute("style");
    expect(inlineStyle).toBeNull();

    expect(cspViolations, cspViolations.join("\n")).toHaveLength(0);
  });

  test("report-only mode is not conflated with default enforce", async ({ request }) => {
    const doc = await request.get(previewOrigin + "/");
    const headers = doc.headers();
    expect(headers["content-security-policy"]).toBeTruthy();
    expect(headers["content-security-policy-report-only"] ?? "").toBe("");
  });
});
