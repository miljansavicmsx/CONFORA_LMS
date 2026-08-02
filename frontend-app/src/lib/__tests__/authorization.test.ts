import { describe, expect, it } from "vitest";

import { hasAnyPermission, hasPermission } from "@/lib/authorization";
import type { MePermissionsPayload } from "@/lib/permissions";

const SNAP: MePermissionsPayload = {
  primaryRole: "cert_committee",
  isoRole: "certification_committee",
  isoRoleLabel: "Odbor",
  permissions: ["risk.register.read"],
  tenantId: "t",
  blockedPermissions: [],
  governanceCapabilities: [],
};

describe("authorization", () => {
  it("hasPermission trusts snapshot when granted", () => {
    expect(hasPermission(SNAP, "risk.register.read", false)).toBe(true);
  });

  it("hasPermission falls back when snapshot misses", () => {
    expect(hasPermission(SNAP, "missing.permission", true)).toBe(true);
    expect(hasPermission(SNAP, "missing.permission", false)).toBe(false);
  });

  it("hasAnyPermission works with snapshot", () => {
    expect(hasAnyPermission(SNAP, ["audit.read"], true)).toBe(true);
    expect(hasAnyPermission(null, ["x"], false)).toBe(false);
  });
});
