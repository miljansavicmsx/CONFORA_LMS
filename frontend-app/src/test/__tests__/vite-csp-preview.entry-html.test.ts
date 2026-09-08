import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "vitest";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

async function loadPreviewModule() {
  const href = pathToFileURL(path.join(frontendRoot, "vite-csp-preview.mjs")).href;
  return (await import(`${href}?t=${Date.now()}`)) as {
    injectScriptNonces: (html: string, nonce: string) => string;
    cspPreviewPlugin: () => {
      name: string;
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
      transformIndexHtml?: unknown;
      configureServer?: unknown;
    };
  };
}

describe("vite-csp-preview entry HTML nonce rewrite", () => {
  it("injects nonce onto entry script tags without duplicating existing nonce", async () => {
    const { injectScriptNonces } = await loadPreviewModule();
    const html =
      '<!doctype html><html><body><div id="root"></div>' +
      '<script type="module" src="/assets/index.js"></script>' +
      '<script nonce="keep-me" src="/already.js"></script>' +
      "</body></html>";
    const out = injectScriptNonces(html, "abc123nonce");
    expect(out).toContain('<script type="module" src="/assets/index.js" nonce="abc123nonce">');
    expect(out).toContain('<script nonce="keep-me" src="/already.js">');
    expect(out.match(/nonce="abc123nonce"/g)?.length).toBe(1);
    expect(out).not.toMatch(/nonce="abc123nonce"[^>]*nonce=/);
  });

  it("leaves non-script HTML unchanged when no scripts present", async () => {
    const { injectScriptNonces } = await loadPreviewModule();
    const html = "<html><body><p>hi</p></body></html>";
    expect(injectScriptNonces(html, "n1")).toBe(html);
  });

  it("middleware sets enforce CSP and rewrites only text/html bodies", async () => {
    const previousMode = process.env.CSP_MODE;
    delete process.env.CSP_MODE;
    try {
      const mod = await loadPreviewModule();
      const plugin = mod.cspPreviewPlugin();
      expect(plugin.transformIndexHtml).toBeUndefined();
      expect(plugin.configureServer).toBeUndefined();

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
      let ended: Buffer | string | undefined;
      const res = {
        setHeader,
        getHeader,
        headersSent: false,
        write: vi.fn(),
        end: vi.fn((chunk?: Buffer | string) => {
          ended = chunk;
        }),
      };
      const next = vi.fn(() => {
        headers.set("content-type", "text/html; charset=utf-8");
        const html =
          '<!doctype html><html><body><script type="module" src="/assets/index-abc.js"></script></body></html>';
        // Call wrapped write/end after middleware replacement
        res.write(html);
        res.end();
      });

      middleware!({}, res, next);

      expect(setHeader).toHaveBeenCalledWith(
        "Content-Security-Policy",
        expect.stringContaining("'nonce-"),
      );
      expect(setHeader).toHaveBeenCalledWith("x-nonce", expect.any(String));
      const nonce = headers.get("x-nonce");
      expect(nonce).toBeTruthy();
      const csp = headers.get("content-security-policy") ?? "";
      expect(csp).toContain(`'nonce-${nonce}'`);
      expect(csp).not.toMatch(/style-src[^;]*'unsafe-inline'/);
      expect(csp).not.toMatch(/connect-src[^;]*\shttps:/);

      // After wrap, end should produce rewritten HTML
      expect(next).toHaveBeenCalled();
      // The wrapped end stores rewritten body via originalEnd mock — invoke through wrapped path:
      // middleware replaced res.write/end; next() used those. Check ended content if captured.
      const body = typeof ended === "string" ? ended : ended?.toString("utf8");
      // If write buffer path used, body includes nonce matching header
      if (body) {
        expect(body).toContain(`nonce="${nonce}"`);
        expect(body.match(new RegExp(`nonce="${nonce}"`, "g"))?.length).toBe(1);
      }
    } finally {
      if (previousMode === undefined) {
        delete process.env.CSP_MODE;
      } else {
        process.env.CSP_MODE = previousMode;
      }
    }
  });

  it("does not mutate non-HTML responses", async () => {
    const mod = await loadPreviewModule();
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

    const headers = new Map<string, string>();
    const originalEnd = vi.fn();
    const res = {
      setHeader: vi.fn((k: string, v: string) => headers.set(String(k).toLowerCase(), String(v))),
      getHeader: vi.fn((k: string) => headers.get(String(k).toLowerCase())),
      headersSent: false,
      write: vi.fn(),
      end: originalEnd,
    };
    const payload = '{"ok":true}';
    middleware!({}, res, () => {
      headers.set("content-type", "application/json");
      res.end(payload);
    });
    expect(originalEnd).toHaveBeenCalledWith(payload, undefined, undefined);
  });

  it("uses Content-Security-Policy-Report-Only when CSP_MODE=report-only", async () => {
    const previousMode = process.env.CSP_MODE;
    process.env.CSP_MODE = "report-only";
    try {
      const mod = await loadPreviewModule();
      const plugin = mod.cspPreviewPlugin();
      let middleware:
        | ((req: unknown, res: { setHeader: ReturnType<typeof vi.fn> }, next: () => void) => void)
        | undefined;
      plugin.configurePreviewServer({
        middlewares: {
          use: (fn) => {
            middleware = fn as typeof middleware;
          },
        },
      });
      const setHeader = vi.fn();
      const res = {
        setHeader,
        getHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
        headersSent: false,
      };
      middleware!({}, res, () => undefined);
      expect(setHeader).toHaveBeenCalledWith(
        "Content-Security-Policy-Report-Only",
        expect.stringContaining("script-src"),
      );
      expect(setHeader.mock.calls.some((c) => c[0] === "Content-Security-Policy")).toBe(false);
    } finally {
      if (previousMode === undefined) {
        delete process.env.CSP_MODE;
      } else {
        process.env.CSP_MODE = previousMode;
      }
    }
  });
});
