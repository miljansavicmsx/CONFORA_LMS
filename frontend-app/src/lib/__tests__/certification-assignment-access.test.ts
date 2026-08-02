import { describe, expect, it } from "vitest";

import {
  canShowAssignmentCreatorActions,
  isComCertOnlyAssigner,
  isCurrentUserAssignee,
  resolveActorNestRoles,
  resolvePublicAssignmentState,
  toAssigneeReference,
} from "@/lib/certification-assignment-access";

describe("certification-assignment-access (P1-B5-2b)", () => {
  it("maps legacy director profile to STAFF_DIR creator access", () => {
    const roles = resolveActorNestRoles({ roleFromProfile: "director" });
    expect(canShowAssignmentCreatorActions(roles)).toBe(true);
  });

  it("allows STAFF_TRAINADM as assignment creator fallback", () => {
    const roles = resolveActorNestRoles({ jwtRoles: ["STAFF_TRAINADM"] });
    expect(canShowAssignmentCreatorActions(roles)).toBe(true);
  });

  it("blocks COM_CERT-only users from assign UI", () => {
    const roles = resolveActorNestRoles({ jwtRoles: ["COM_CERT"], roleFromProfile: "cert_committee" });
    expect(isComCertOnlyAssigner(roles)).toBe(true);
    expect(canShowAssignmentCreatorActions(roles)).toBe(false);
  });

  it("allows COM_CERT with STAFF_DIR to assign", () => {
    const roles = resolveActorNestRoles({ jwtRoles: ["COM_CERT", "STAFF_DIR"] });
    expect(canShowAssignmentCreatorActions(roles)).toBe(true);
  });

  it("derives assignee reference matching backend pseudonym", () => {
    const userId = "b5200000-0000-4000-8000-000000000020";
    const ref = toAssigneeReference(userId);
    expect(ref).toBe("rev-b5200000");
    expect(isCurrentUserAssignee(userId, ref)).toBe(true);
  });

  it("resolves public assignment states", () => {
    expect(resolvePublicAssignmentState(null)).toBe("UNASSIGNED");
    expect(resolvePublicAssignmentState({ status: "ASSIGNED" })).toBe("ASSIGNED");
    expect(resolvePublicAssignmentState({ status: "ACCEPTED" })).toBe("ACCEPTED");
    expect(resolvePublicAssignmentState({ status: "IN_REVIEW" })).toBe("IN_REVIEW");
  });
});
