import { describe, expect, it } from "vitest";

import {
  canRecordDecisionOutcome,
  canStartDecisionReview,
  isDirectorGovernanceOnlyDecisionView,
  shouldLoadDecisionQuery,
} from "@/lib/certification-decision-access";
import { resolvePilotNavPersona } from "@/lib/nest-auth-pilot";
import {
  canPerformStaffIdentityReview,
  canReadStaffIdentityQueue,
} from "@/lib/staff-identity-review-access";

describe("RBAC-API-1 frontend alignment", () => {
  it("director decision view is governance-only (no finalize)", () => {
    const roles = ["STAFF_DIR"];
    expect(shouldLoadDecisionQuery(roles)).toBe(true);
    expect(isDirectorGovernanceOnlyDecisionView(roles)).toBe(true);
    expect(canStartDecisionReview(roles)).toBe(false);
    expect(canRecordDecisionOutcome(roles)).toBe(false);
  });

  it("committee member can finalize decisions when quorum evidence is satisfied", () => {
    const roles = ["COM_CERT"];
    expect(canStartDecisionReview(roles)).toBe(true);
    expect(canRecordDecisionOutcome(roles)).toBe(true);
    expect(isDirectorGovernanceOnlyDecisionView(roles)).toBe(false);
  });

  it("sysadmin does not get business decision finalize or ID review perform", () => {
    const roles = ["STAFF_SYSADM"];
    expect(canRecordDecisionOutcome(roles)).toBe(false);
    expect(canStartDecisionReview(roles)).toBe(false);
    expect(
      canPerformStaffIdentityReview({ jwtRoles: roles, roleFromProfile: "sys_admin" }),
    ).toBe(false);
  });

  it("id verifier sees ID review queue and perform action", () => {
    const input = { jwtRoles: ["STAFF_ID_VERIFIER"], roleFromProfile: "manual_id_verifier" };
    expect(canReadStaffIdentityQueue(input)).toBe(true);
    expect(canPerformStaffIdentityReview(input)).toBe(true);
    expect(resolvePilotNavPersona({ jwtRoles: ["STAFF_ID_VERIFIER"], roleFromProfile: "manual_id_verifier" })).toBe("id_verifier");
  });

  it("learner cannot access staff decision or identity review routes", () => {
    const roles = ["USR_CAND"];
    expect(shouldLoadDecisionQuery(roles)).toBe(false);
    expect(
      canReadStaffIdentityQueue({ jwtRoles: roles, roleFromProfile: "learner" }),
    ).toBe(false);
    expect(resolvePilotNavPersona({ jwtRoles: roles, roleFromProfile: "learner" })).toBe("learner");
  });
});
