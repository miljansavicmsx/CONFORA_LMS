import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "vitest";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = path.resolve(frontendRoot, "..");

describe("vite-csp-preview bootstrap", () => {
  it("exports cspPreviewPlugin compatible with current Vite config", async () => {
    const href = pathToFileURL(path.join(frontendRoot, "vite-csp-preview.mjs")).href;
    const mod = (await import(`${href}?t=${Date.now()}`)) as {
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

  it("defaults to enforce and remains preview-server scoped (CSP-R01, CSP-R03)", () => {
    const source = readFileSync(path.join(frontendRoot, "vite-csp-preview.mjs"), "utf8");
    expect(source).toContain("configurePreviewServer");
    expect(source).toContain("CSP_MODE ?? 'enforce'");
    expect(source).toContain("isProd: true");
    expect(source).toContain("buildContentSecurityPolicy");
    expect(source).toContain("../packages/config/csp/build-csp.mjs");
    expect(source).not.toMatch(/CSP_MODE\s*\?\?\s*'report-only'/);
    expect(source).not.toContain("process.env.NODE_ENV");
  });

  it("does not introduce unsafe-eval in the restored preview module", () => {
    const source = readFileSync(path.join(frontendRoot, "vite-csp-preview.mjs"), "utf8");
    expect(source).not.toContain("unsafe-eval");
    expect(source).not.toMatch(/nonce\s*[:=]\s*['"][0-9a-fA-F-]{8,}['"]/);
  });

  it("removes bare https: connect-src and prod style-src unsafe-inline (CSP-R02, CSP-R04)", async () => {
    const href = pathToFileURL(path.join(repoRoot, "packages/config/csp/build-csp.mjs")).href;
    const mod = (await import(`${href}?t=${Date.now()}`)) as {
      buildContentSecurityPolicy: (opts: {
        nonce: string;
        apiOrigin: string;
        isProd: boolean;
        mode?: "off" | "report-only" | "enforce";
      }) => { headerName: string | null; value: string | null };
    };

    const prod = mod.buildContentSecurityPolicy({
      nonce: "testnonce",
      apiOrigin: "http://127.0.0.1:8000",
      isProd: true,
      mode: "enforce",
    });
    expect(prod.headerName).toBe("Content-Security-Policy");
    expect(prod.value).toContain("connect-src 'self' http://127.0.0.1:8000");
    expect(prod.value).not.toMatch(/connect-src[^;]*\shttps:/);
    expect(prod.value).toContain("style-src 'self' 'nonce-testnonce'");
    expect(prod.value).not.toMatch(/style-src[^;]*'unsafe-inline'/);
    expect(prod.value).not.toContain("unsafe-eval");

    const reportOnly = mod.buildContentSecurityPolicy({
      nonce: "testnonce",
      apiOrigin: "http://127.0.0.1:8000",
      isProd: true,
      mode: "report-only",
    });
    expect(reportOnly.headerName).toBe("Content-Security-Policy-Report-Only");

    const previewMiddleware = readFileSync(path.join(frontendRoot, "vite-csp-preview.mjs"), "utf8");
    expect(previewMiddleware).toContain("configurePreviewServer");
    expect(previewMiddleware).not.toContain("configureServer");
  });

  it("applies enforce header by default through preview plugin middleware (CSP-R01)", async () => {
    const href = pathToFileURL(path.join(frontendRoot, "vite-csp-preview.mjs")).href;
    const previousMode = process.env.CSP_MODE;
    delete process.env.CSP_MODE;
    try {
      const mod = (await import(`${href}?t=${Date.now()}-runtime`)) as {
        cspPreviewPlugin: () => {
          configurePreviewServer: (server: {
            middlewares: {
              use: (
                fn: (
                  req: unknown,
                  res: {
                    setHeader: ReturnType<typeof vi.fn>;
                    getHeader: ReturnType<typeof vi.fn>;
                    write: ReturnType<typeof vi.fn>;
                    end: ReturnType<typeof vi.fn>;
                    headersSent: boolean;
                  },
                  next: () => void,
                ) => void,
              ) => void;
            };
          }) => void;
        };
        injectScriptNonces: (html: string, nonce: string) => string;
      };
      const plugin = mod.cspPreviewPlugin();
      let middleware:
        | ((
            req: unknown,
            res: {
              setHeader: ReturnType<typeof vi.fn>;
              getHeader: ReturnType<typeof vi.fn>;
              write: ReturnType<typeof vi.fn>;
              end: ReturnType<typeof vi.fn>;
              headersSent: boolean;
            },
            next: () => void,
          ) => void)
        | undefined;
      plugin.configurePreviewServer({
        middlewares: {
          use: (fn) => {
            middleware = fn;
          },
        },
      });
      expect(typeof middleware).toBe("function");
      const headers = new Map<string, string>();
      const setHeader = vi.fn((k: string, v: string) => {
        headers.set(String(k).toLowerCase(), String(v));
      });
      const getHeader = vi.fn((k: string) => headers.get(String(k).toLowerCase()));
      const res = {
        setHeader,
        getHeader,
        write: vi.fn(),
        end: vi.fn(),
        headersSent: false,
      };
      const next = vi.fn();
      middleware!({}, res, next);
      expect(setHeader).toHaveBeenCalledWith(
        "Content-Security-Policy",
        expect.stringContaining("connect-src 'self'"),
      );
      expect(setHeader).toHaveBeenCalledWith("x-nonce", expect.any(String));
      expect(next).toHaveBeenCalled();
      const cspCall = setHeader.mock.calls.find((c) => c[0] === "Content-Security-Policy");
      expect(cspCall?.[1]).not.toMatch(/connect-src[^;]*\shttps:/);
      expect(cspCall?.[1]).not.toMatch(/style-src[^;]*'unsafe-inline'/);
      // Remediation: HTML nonce helper exists and remains preview-only (no configureServer).
      expect(typeof mod.injectScriptNonces).toBe("function");
      expect(readFileSync(path.join(frontendRoot, "vite-csp-preview.mjs"), "utf8")).toContain(
        "injectScriptNonces",
      );
    } finally {
      if (previousMode === undefined) {
        delete process.env.CSP_MODE;
      } else {
        process.env.CSP_MODE = previousMode;
      }
    }
  });
});
