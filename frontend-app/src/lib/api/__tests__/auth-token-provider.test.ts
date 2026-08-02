import { afterEach, describe, expect, it } from "vitest";

import {
  authorizationHeaderValue,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  PERSISTED_AUTH_STORAGE_KEY,
  setAccessToken,
  setTokens,
} from "@/lib/api/auth-token-provider";

function seedConforaAuth(state: Record<string, unknown>): void {
  localStorage.setItem(
    PERSISTED_AUTH_STORAGE_KEY,
    JSON.stringify({
      state,
      version: 0,
    }),
  );
}

describe("auth-token-provider PERSISTED_AUTH_READ_BRIDGE (028D-2aS2R)", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("reads access and refresh tokens from confora-auth Zustand envelope", () => {
    seedConforaAuth({
      user: { id: "u1", email: "learner@example.com" },
      accessToken: "access-from-login",
      refreshToken: "refresh-from-login",
      isAuthenticated: true,
    });

    expect(getAccessToken()).toBe("access-from-login");
    expect(getRefreshToken()).toBe("refresh-from-login");
    expect(authorizationHeaderValue()).toBe("Bearer access-from-login");
  });

  it("does not read legacy confora_access_token keys", () => {
    localStorage.setItem("confora_access_token", "legacy-access");
    localStorage.setItem("confora_refresh_token", "legacy-refresh");

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(authorizationHeaderValue()).toBeNull();
  });

  it("returns null when confora-auth is missing or malformed", () => {
    expect(getAccessToken()).toBeNull();
    localStorage.setItem(PERSISTED_AUTH_STORAGE_KEY, "{not-json");
    expect(getAccessToken()).toBeNull();
  });

  it("setAccessToken updates confora-auth without writing legacy keys", () => {
    seedConforaAuth({
      accessToken: "old-access",
      refreshToken: "keep-refresh",
      isAuthenticated: true,
    });

    setAccessToken("rotated-access");

    expect(getAccessToken()).toBe("rotated-access");
    expect(getRefreshToken()).toBe("keep-refresh");
    expect(localStorage.getItem("confora_access_token")).toBeNull();
    expect(localStorage.getItem("confora_refresh_token")).toBeNull();

    const envelope = JSON.parse(localStorage.getItem(PERSISTED_AUTH_STORAGE_KEY)!) as {
      state: { accessToken: string; refreshToken: string; isAuthenticated: boolean };
    };
    expect(envelope.state.accessToken).toBe("rotated-access");
    expect(envelope.state.refreshToken).toBe("keep-refresh");
    expect(envelope.state.isAuthenticated).toBe(true);
  });

  it("setTokens and clearTokens only mutate confora-auth", () => {
    setTokens({ accessToken: "a1", refreshToken: "r1" });
    expect(getAccessToken()).toBe("a1");
    expect(getRefreshToken()).toBe("r1");
    expect(localStorage.getItem("confora_access_token")).toBeNull();

    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(authorizationHeaderValue()).toBeNull();

    const envelope = JSON.parse(localStorage.getItem(PERSISTED_AUTH_STORAGE_KEY)!) as {
      state: { accessToken: string | null; refreshToken: string | null; isAuthenticated: boolean };
    };
    expect(envelope.state.accessToken).toBeNull();
    expect(envelope.state.refreshToken).toBeNull();
    expect(envelope.state.isAuthenticated).toBe(false);
  });
});
