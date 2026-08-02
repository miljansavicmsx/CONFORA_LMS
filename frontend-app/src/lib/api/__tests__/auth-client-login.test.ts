import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loginWithPassword } from "../auth-client";

describe("auth-client login (pilot)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_AUTH_PROVIDER", "nest");
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("loginWithPassword posts username to Nest /auth/login", async () => {
    const postSpy = vi.spyOn(axios, "post").mockResolvedValue({
      data: { access_token: "at", refresh_token: "rt", expires_in: 300 },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    const result = await loginWithPassword("pilot@example.test", "secret");
    expect(result.kind).toBe("ok");
    expect(postSpy).toHaveBeenCalledWith(
      "http://nest.example.test/auth/login",
      { username: "pilot@example.test", password: "secret" },
      expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) }),
    );
  });
});
