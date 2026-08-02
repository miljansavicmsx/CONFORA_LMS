import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getDefaultLegacyBaseUrl, getConforaApiConfig, parseApiProviderMode, parseAuthProviderMode } from "../api-config";
import { resolveApiBaseUrl, resolveAuthApiBaseUrl, resolveBaseUrlForProvider } from "../api-provider";
import { normalizeApiError } from "../api-error";
import { resolveHybridOwnerForPath } from "../endpoint-registry";

describe("api-config", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "http://legacy.example.test");
    vi.stubEnv("VITE_LEGACY_API_URL", "");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_API_PROVIDER", "legacy");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("legacy provider selects VITE_LEGACY_API_URL or VITE_API_URL fallback", () => {
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy-direct.example.test");
    vi.stubEnv("VITE_API_PROVIDER", "legacy");
    expect(getConforaApiConfig().legacyBaseUrl).toBe("http://legacy-direct.example.test");
    expect(resolveApiBaseUrl()).toBe("http://legacy-direct.example.test");
  });

  it("nest provider selects VITE_CONFORA_API_URL", () => {
    vi.stubEnv("VITE_API_PROVIDER", "nest");
    expect(getConforaApiConfig().nestBaseUrl).toBe("http://nest.example.test");
    expect(resolveApiBaseUrl()).toBe("http://nest.example.test");
    expect(resolveApiBaseUrl("/api/courses")).toBe("http://nest.example.test");
  });

  it("old VITE_API_URL fallback when VITE_LEGACY_API_URL is unset", () => {
    vi.stubEnv("VITE_LEGACY_API_URL", "");
    vi.stubEnv("VITE_API_URL", "http://from-vite-api-url.test");
    expect(getDefaultLegacyBaseUrl()).toBe("http://from-vite-api-url.test");
  });

  it("parseApiProviderMode defaults to legacy", () => {
    expect(parseApiProviderMode(undefined)).toBe("legacy");
    expect(parseApiProviderMode("hybrid")).toBe("hybrid");
    expect(parseApiProviderMode("canonical")).toBe("nest");
  });
});

describe("hybrid api-provider routing", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
    vi.stubEnv("VITE_AUTH_PROVIDER", "legacy");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hybrid mode routes mapped Nest paths to VITE_CONFORA_API_URL", () => {
    expect(resolveHybridOwnerForPath("/v1/me/dashboard")).toBe("nest");
    expect(resolveApiBaseUrl("/v1/me/dashboard")).toBe("http://nest.example.test");
  });

  it("hybrid mode routes public catalog to Nest without catching learning subpaths", () => {
    expect(resolveHybridOwnerForPath("/api/courses")).toBe("nest");
    expect(resolveApiBaseUrl("/api/courses")).toBe("http://nest.example.test");
    expect(resolveHybridOwnerForPath("/api/courses/lookup/demo-slug")).toBe("nest");
    expect(resolveHybridOwnerForPath("/api/courses/course-1/structure")).toBe("legacy");
  });

  it("hybrid mode routes learner certificate wallet to Nest", () => {
    expect(resolveHybridOwnerForPath("/v1/me/certificates")).toBe("nest");
    expect(resolveApiBaseUrl("/v1/me/certificates")).toBe("http://nest.example.test");
  });

  it("hybrid mode routes learner certificate PDF URL to Nest", () => {
    expect(resolveHybridOwnerForPath("/v1/me/certificates/CON-2026-000042/pdf-url")).toBe("nest");
    expect(resolveApiBaseUrl("/v1/me/certificates/CON-2026-000042/pdf-url")).toBe(
      "http://nest.example.test",
    );
    expect(resolveHybridOwnerForPath("/api/certificates/my/CON-2026-000042/pdf-url")).toBe("legacy");
  });

  it("hybrid mode routes public verification to Nest", () => {
    expect(resolveHybridOwnerForPath("/api/public/verify/abc")).toBe("nest");
    expect(resolveApiBaseUrl("/api/public/certificates/verify")).toBe("http://nest.example.test");
    expect(resolveHybridOwnerForPath("/verify/abcdef0123456789")).toBe("nest");
  });

  it("hybrid mode routes staff certification queue to Nest", () => {
    expect(resolveHybridOwnerForPath("/v1/staff/certification/applications")).toBe("nest");
    expect(resolveApiBaseUrl("/v1/staff/certification/applications")).toBe("http://nest.example.test");
    expect(resolveHybridOwnerForPath("/v1/staff/certification/applications/app-1")).toBe("nest");
  });

  it("hybrid mode keeps legacy staff list path on legacy when explicitly requested", () => {
    expect(resolveHybridOwnerForPath("/api/certification/applications")).toBe("legacy");
    expect(resolveApiBaseUrl("/api/certification/applications")).toBe("http://legacy.example.test");
  });

  it("hybrid mode keeps auth on legacy", () => {
    expect(resolveHybridOwnerForPath("/auth/login")).toBe("legacy");
    expect(resolveApiBaseUrl("/auth/refresh")).toBe("http://legacy.example.test");
    expect(resolveAuthApiBaseUrl()).toBe("http://legacy.example.test");
  });

  it("hybrid mode routes auth to Nest when VITE_AUTH_PROVIDER=nest", () => {
    vi.stubEnv("VITE_AUTH_PROVIDER", "nest");
    expect(resolveAuthApiBaseUrl()).toBe("http://nest.example.test");
    expect(parseAuthProviderMode("nest")).toBe("nest");
    expect(parseAuthProviderMode("keycloak")).toBe("nest");
  });

  it("resolveBaseUrlForProvider", () => {
    const config = getConforaApiConfig();
    expect(resolveBaseUrlForProvider("legacy", config)).toBe("http://legacy.example.test");
    expect(resolveBaseUrlForProvider("nest", config)).toBe("http://nest.example.test");
  });
});

describe("normalizeApiError", () => {
  it("normalizes Nest validation errors", () => {
    const err = normalizeApiError({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: ["field_a invalid", "field_b invalid"], error: "Bad Request" },
      },
    });
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual(["field_a invalid", "field_b invalid"]);
  });

  it("normalizes FastAPI detail string", () => {
    const err = normalizeApiError({
      isAxiosError: true,
      response: { status: 404, data: { detail: "not_found" } },
    });
    expect(err.status).toBe(404);
    expect(err.message).toBe("not_found");
  });
});

describe("http-client request policies", () => {
  type RequestConfig = {
    url?: string;
    headers?: Record<string, string>;
    baseURL?: string;
    params?: Record<string, unknown>;
    data?: Record<string, unknown>;
  };

  let requestHook: ((config: RequestConfig) => RequestConfig) | undefined;

  beforeEach(async () => {
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");

    requestHook = undefined;
    vi.spyOn(axios, "create").mockImplementation(
      () =>
        ({
          interceptors: {
            request: { use: (fn: (config: RequestConfig) => RequestConfig) => { requestHook = fn; } },
            response: { use: () => undefined },
          },
          defaults: {},
        }) as ReturnType<typeof axios.create>,
    );

    vi.resetModules();
    const { resetHttpClientForTests } = await import("../http-client");
    resetHttpClientForTests();
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    const { resetHttpClientForTests } = await import("../http-client");
    resetHttpClientForTests();
    vi.resetModules();
  });

  it("attaches Authorization header when token exists", async () => {
    const { useAuthStore } = await import("@/stores/authStore");
    useAuthStore.getState().login({
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
    });

    const { getHttpClient } = await import("../http-client");
    getHttpClient();
    expect(requestHook).toBeDefined();

    const out = requestHook!({
      url: "/v1/me/enrollments",
      headers: {},
      params: {},
      data: {},
    });
    expect(out.headers?.Authorization).toBe("Bearer test-access-token");
    expect(out.baseURL).toBe("http://nest.example.test");

    useAuthStore.getState().logout();
  });

  it("does not inject tenant_id into request body", async () => {
    const { getHttpClient } = await import("../http-client");
    getHttpClient();
    expect(requestHook).toBeDefined();

    const out = requestHook!({
      url: "/api/governance/risks",
      headers: {},
      data: {
        title: "risk",
        tenant_id: "00000000-0000-4000-8000-000000000001",
        tenantId: "00000000-0000-4000-8000-000000000001",
      },
    });
    expect(out.data).toEqual({ title: "risk" });
  });
});
