import { describe, expect, it } from "vitest";

import {
  canPerformStaffIdentityReview,
  canReadStaffIdentityQueue,
} from "@/lib/staff-identity-review-access";

describe("staff-identity-review-access (RBAC-API-1)", () => {
  it("allows id verifier to read and perform", () => {
    const input = { jwtRoles: ["STAFF_ID_VERIFIER"], roleFromProfile: "manual_id_verifier" };
    expect(canReadStaffIdentityQueue(input)).toBe(true);
    expect(canPerformStaffIdentityReview(input)).toBe(true);
  });

  it("allows director read-only", () => {
    const input = { jwtRoles: ["STAFF_DIR"], roleFromProfile: "director" };
    expect(canReadStaffIdentityQueue(input)).toBe(true);
    expect(canPerformStaffIdentityReview(input)).toBe(false);
  });

  it("denies sysadmin identity review by default", () => {
    const input = { jwtRoles: ["STAFF_SYSADM"], roleFromProfile: "sys_admin" };
    expect(canPerformStaffIdentityReview(input)).toBe(false);
  });
});
