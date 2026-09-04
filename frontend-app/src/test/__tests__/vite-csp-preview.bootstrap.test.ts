import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("vite-csp-preview bootstrap", () => {
  it("exports cspPreviewPlugin compatible with current Vite config", async () => {
    const href = pathToFileURL(path.join(frontendRoot, "vite-csp-preview.mjs")).href;
    const mod = (await import(href)) as {
      cspPreviewPlugin: () => {
        name: string;
        configurePreviewServer?: unknown;
        configureServer?: unknown;
        transformIndexHtml?: unknown;
      };
    };
    expect(typeof mod.cspPreviewPlugin).toBe("function");
    const plugin = mod.cspPreviewPlugin();
    expect(plugin.name).toBe("confora-csp-preview");
    expect(typeof plugin.configurePreviewServer).toBe("function");
    expect(plugin.configureServer).toBeUndefined();
    expect(plugin.transformIndexHtml).toBeUndefined();
  });

  it("is preview-server scoped and does not claim enforcement by default", () => {
    const source = readFileSync(path.join(frontendRoot, "vite-csp-preview.mjs"), "utf8");
    expect(source).toContain("configurePreviewServer");
    expect(source).toContain("CSP_MODE ?? 'report-only'");
    expect(source).toContain("isProd: true");
    expect(source).toContain("buildContentSecurityPolicy");
    expect(source).toContain("../packages/config/csp/build-csp.mjs");
    // Must not falsely assert enforcement; report-only remains the default.
    expect(source).not.toMatch(/CSP_MODE\s*\?\?\s*'enforce'/);
  });

  it("does not introduce unsafe-eval in the restored preview module", () => {
    const source = readFileSync(path.join(frontendRoot, "vite-csp-preview.mjs"), "utf8");
    expect(source).not.toContain("unsafe-eval");
    expect(source).not.toMatch(/nonce\s*[:=]\s*['"][0-9a-fA-F-]{8,}['"]/);
  });
});
