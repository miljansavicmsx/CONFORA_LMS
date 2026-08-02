import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const getCurrentUserPermissions = vi.fn();

vi.mock("@/lib/api/auth-client", () => ({
  getCurrentUser,
  getCurrentUserPermissions,
}));

describe("DashboardLayoutRoute pilot bootstrap", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "true");
    vi.stubEnv("VITE_AUTH_PROVIDER", "nest");
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
    getCurrentUser.mockReset();
    getCurrentUserPermissions.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses auth-client profile and permissions when pilot active", async () => {
    const { isNestAuthPilotActive } = await import("@/lib/nest-auth-pilot");
    expect(isNestAuthPilotActive()).toBe(true);

    getCurrentUser.mockResolvedValue({
      kind: "ok",
      data: {
        userId: "user-1",
        email: "pilot@example.test",
        full_name: "Pilot User",
        role: "learner",
        roles: [],
        permissions: [],
        tenantId: "00000000-0000-4000-8000-000000000001",
        mfaVerified: false,
      },
    });
    getCurrentUserPermissions.mockResolvedValue({
      kind: "ok",
      data: {
        primaryRole: "learner",
        permissions: ["catalog.read"],
        blockedPermissions: [],
        tenantId: "00000000-0000-4000-8000-000000000001",
      },
    });

    const profileResult = await getCurrentUser("Bearer test");
    const permResult = await getCurrentUserPermissions("Bearer test");

    expect(profileResult.kind).toBe("ok");
    expect(permResult.kind).toBe("ok");
    expect(getCurrentUser).toHaveBeenCalledWith("Bearer test");
    expect(getCurrentUserPermissions).toHaveBeenCalledWith("Bearer test");
  });
});
