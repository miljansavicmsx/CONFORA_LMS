import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import axios from "axios";
import { describe, expect, it } from "vitest";

import { getConforaApiConfig, getDefaultLegacyBaseUrl } from "@/lib/api/api-config";

const testDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("vitest setup bootstrap", () => {
  it("loads ResizeObserver setup deterministically", () => {
    expect(typeof globalThis.ResizeObserver).toBe("function");
    const observer = new globalThis.ResizeObserver(() => undefined);
    expect(() => observer.observe(document.body)).not.toThrow();
    expect(() => observer.disconnect()).not.toThrow();
  });

  it("loads Axios/Fetch setup without missing historical helpers", () => {
    expect(typeof axios.defaults.adapter).toBe("function");
    expect(typeof globalThis.fetch).toBe("function");

    const axiosSource = readFileSync(path.join(testDir, "vitest-axios-adapter.ts"), "utf8");
    const fetchSource = readFileSync(path.join(testDir, "vitest-fetch-guard.ts"), "utf8");

    expect(axiosSource).not.toMatch(/from\s+["']@\/test\/lms-api-test-mock["']/);
    expect(axiosSource).not.toMatch(/from\s+["']@\/lib\/api-base-url["']/);
    expect(axiosSource).not.toMatch(/\bxhrFallback\b/);
    expect(axiosSource).toContain("@/lib/api/api-config");

    expect(fetchSource).not.toMatch(/from\s+["']@\/test\/lms-api-test-mock["']/);
    expect(fetchSource).not.toMatch(/from\s+["']@\/lib\/api-base-url["']/);
    expect(fetchSource).toContain("@/lib/api/api-config");
  });

  it("fail-closes Axios requests to configured API origins without real network", async () => {
    const { legacyBaseUrl, nestBaseUrl } = getConforaApiConfig();

    const legacy = await axios.get(`${legacyBaseUrl}/api/bootstrap-probe`, {
      validateStatus: () => true,
    });
    expect(legacy.status).toBe(404);
    expect(legacy.data).toEqual({ detail: "vitest-guard:not-found" });

    const nest = await axios.get(`${nestBaseUrl}/v1/bootstrap-probe`, {
      validateStatus: () => true,
    });
    expect(nest.status).toBe(404);
    expect(nest.data).toEqual({ detail: "vitest-guard:not-found" });

    await expect(axios.get("https://example.com/escape-probe")).rejects.toThrow(
      /vitest-axios-adapter:blocked-origin/,
    );
  });

  it("fail-closes Fetch requests to API origin without real network", async () => {
    const apiOrigin = new URL(getDefaultLegacyBaseUrl()).origin;
    const response = await fetch(`${apiOrigin}/api/bootstrap-probe`);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      detail: "vitest-fetch-guard:not-found",
    });
  });
});
