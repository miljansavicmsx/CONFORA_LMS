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

describe("auth-token-provider does not persist tokens", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("removes a leftover confora-auth envelope and returns no token", () => {
    localStorage.setItem(
      PERSISTED_AUTH_STORAGE_KEY,
      JSON.stringify({ state: { accessToken: "access-from-login", refreshToken: "refresh-from-login" }, version: 0 }),
    );
    sessionStorage.setItem("confora_access_token", "session-access");
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(authorizationHeaderValue()).toBeNull();
    expect(localStorage.getItem(PERSISTED_AUTH_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem("confora_access_token")).toBeNull();
  });

  it("setTokens and setAccessToken do not write tokens", () => {
    setTokens({ accessToken: "a1", refreshToken: "r1" });
    setAccessToken("rotated-access");
    expect(localStorage.getItem(PERSISTED_AUTH_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem("confora_refresh_token")).toBeNull();
    clearTokens();
    expect(getAccessToken()).toBeNull();
  });
});
