import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("auth-refresh pilot wiring", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "false");
    vi.stubEnv("VITE_AUTH_PROVIDER", "legacy");
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
    const { useAuthStore } = await import("@/stores/authStore");
    useAuthStore.getState().logout();
  });

  it("keeps legacy Bearer refresh when pilot flag is false", async () => {
    const postSpy = vi.spyOn(axios, "post").mockResolvedValue({
      data: { access_token: "legacy-access", expires_in: 3600 },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    const { refreshAccessToken } = await import("../auth-refresh");
    const token = await refreshAccessToken("legacy-refresh");
    expect(token).toBe("legacy-access");
    expect(postSpy).toHaveBeenCalledWith(
      "http://legacy.example.test/auth/refresh",
      {},
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer legacy-refresh" }),
      }),
    );
  });

  it("uses auth-client.refresh when pilot active with nest auth provider", async () => {
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "true");
    vi.stubEnv("VITE_AUTH_PROVIDER", "nest");
    vi.resetModules();

    const refreshMock = vi.fn().mockResolvedValue({
      kind: "ok" as const,
      data: { access_token: "nest-access", refresh_token: "nest-refresh-rotated" },
    });
    vi.doMock("@/lib/api/auth-client", () => ({
      refresh: refreshMock,
    }));

    const { useAuthStore } = await import("@/stores/authStore");
    useAuthStore.getState().login({
      access_token: "old-access",
      refresh_token: "old-refresh",
    });

    const { refreshAccessToken } = await import("../auth-refresh");
    const token = await refreshAccessToken("old-refresh");
    expect(token).toBe("nest-access");
    expect(refreshMock).toHaveBeenCalledWith("old-refresh");
  });

  it("does not use auth-client when pilot flag true but auth provider legacy", async () => {
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "true");
    vi.stubEnv("VITE_AUTH_PROVIDER", "legacy");
    vi.resetModules();

    const refreshMock = vi.fn();
    vi.doMock("@/lib/api/auth-client", () => ({
      refresh: refreshMock,
    }));

    const postSpy = vi.spyOn(axios, "post").mockResolvedValue({
      data: { access_token: "legacy-access", expires_in: 3600 },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    const { refreshAccessToken } = await import("../auth-refresh");
    await refreshAccessToken("legacy-refresh");
    expect(refreshMock).not.toHaveBeenCalled();
    expect(postSpy).toHaveBeenCalled();
  });
});
