import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getCurrentUser,
  getCurrentUserPermissions,
  normalizeAuthProfile,
  refresh,
  resolveAuthRefreshTransport,
} from "../auth-client";
import { resolveAuthApiBaseUrl } from "../api-provider";

describe("auth-client refresh transport", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_AUTH_PROVIDER", "legacy");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sends JSON body refresh in nest provider mode", async () => {
    vi.stubEnv("VITE_API_PROVIDER", "nest");
    const postSpy = vi.spyOn(axios, "post").mockResolvedValue({
      data: { access_token: "new-access", refresh_token: "new-refresh" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    await refresh("rt-json");

    expect(postSpy).toHaveBeenCalledWith(
      "http://nest.example.test/auth/refresh",
      { refresh_token: "rt-json" },
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
    const authHeader = postSpy.mock.calls[0]?.[2]?.headers?.Authorization;
    expect(authHeader).toBeUndefined();
  });

  it("sends Bearer refresh in legacy provider mode", async () => {
    vi.stubEnv("VITE_API_PROVIDER", "legacy");
    const postSpy = vi.spyOn(axios, "post").mockResolvedValue({
      data: { access_token: "new-access" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    await refresh("rt-bearer");

    expect(postSpy).toHaveBeenCalledWith(
      "http://legacy.example.test/auth/refresh",
      {},
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer rt-bearer" }),
      }),
    );
  });

  it("hybrid stays on legacy auth unless VITE_AUTH_PROVIDER=nest", () => {
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
    vi.stubEnv("VITE_AUTH_PROVIDER", "legacy");
    expect(resolveAuthRefreshTransport()).toBe("bearer-header");
    expect(resolveAuthApiBaseUrl()).toBe("http://legacy.example.test");

    vi.stubEnv("VITE_AUTH_PROVIDER", "nest");
    expect(resolveAuthRefreshTransport()).toBe("json-body");
    expect(resolveAuthApiBaseUrl()).toBe("http://nest.example.test");
  });
});

describe("auth-client profile and permissions", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_API_PROVIDER", "nest");
    vi.stubEnv("VITE_AUTH_PROVIDER", "nest");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("normalizeAuthProfile maps Nest /auth/me fields", () => {
    const normalized = normalizeAuthProfile({
      sub: "user-1",
      userId: "user-1",
      email: "staff@example.test",
      fullName: "Staff User",
      role: "director",
      roles: ["STAFF_DIR"],
      permissions: ["governance.read"],
      tenant_id: "tenant-from-jwt",
      tenantId: "tenant-from-jwt",
      mfaVerified: true,
    });

    expect(normalized.userId).toBe("user-1");
    expect(normalized.email).toBe("staff@example.test");
    expect(normalized.full_name).toBe("Staff User");
    expect(normalized.role).toBe("director");
    expect(normalized.roles).toEqual(["STAFF_DIR"]);
    expect(normalized.permissions).toEqual(["governance.read"]);
    expect(normalized.tenantId).toBe("tenant-from-jwt");
    expect(normalized.mfaVerified).toBe(true);
  });

  it("getCurrentUser normalizes Nest profile response", async () => {
    vi.spyOn(axios, "get").mockResolvedValue({
      data: {
        sub: "user-2",
        userId: "user-2",
        email: "user@example.test",
        fullName: "User Two",
        role: "learner",
        roles: ["LEARNER"],
        permissions: [],
        tenant_id: "00000000-0000-4000-8000-000000000001",
        mfaVerified: false,
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    const result = await getCurrentUser("Bearer access-token");
    expect(result.kind).toBe("ok");
    if (result.kind === "ok") {
      expect(result.data.userId).toBe("user-2");
      expect(result.data.tenantId).toBe("00000000-0000-4000-8000-000000000001");
    }

    const getSpy = vi.mocked(axios.get);
    expect(getSpy).toHaveBeenCalledWith(
      "http://nest.example.test/auth/me",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer access-token" }),
      }),
    );
    const config = getSpy.mock.calls[0]?.[1];
    expect(config).not.toHaveProperty("params");
    expect(config?.data).toBeUndefined();
  });

  it("getCurrentUserPermissions calls /api/auth/me/permissions without tenant_id", async () => {
    const getSpy = vi.spyOn(axios, "get").mockResolvedValue({
      data: {
        primaryRole: "director",
        permissions: ["governance.read"],
        blockedPermissions: [],
        tenantId: "00000000-0000-4000-8000-000000000001",
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    const result = await getCurrentUserPermissions("Bearer access-token");
    expect(result.kind).toBe("ok");
    expect(getSpy).toHaveBeenCalledWith(
      "http://nest.example.test/api/auth/me/permissions",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer access-token" }),
      }),
    );
    const config = getSpy.mock.calls[0]?.[1];
    expect(config).not.toHaveProperty("params");
    expect(config?.data).toBeUndefined();
  });
});
