import { describe, expect, it } from "vitest";

import type { CertificationDecisionValidationDetail } from "@/lib/api-staff-cert-decision";
import {
  canFinalizeDecisionOutcome,
  canRecordDecisionOutcome,
  canStartDecisionReview,
  evaluateQuorumFinalizeState,
  isDirectorGovernanceOnlyDecisionView,
} from "@/lib/certification-decision-access";

const satisfiedQuorum: CertificationDecisionValidationDetail = {
  id: "00000000-0000-4000-8000-000000000001",
  certificationDecisionReviewId: "00000000-0000-4000-8000-000000000002",
  validationStatus: "PENDING_VALIDATION",
  quorumConfirmed: true,
  quorumCount: 3,
  requiredQuorum: 3,
  validatedByReference: null,
  validatedAt: null,
  validationNotes: null,
  rejectionReason: null,
  memberAttestations: [],
};

describe("certification-decision-access (RBAC-API-1)", () => {
  it("allows COM_CERT to finalize when quorum is satisfied", () => {
    expect(canStartDecisionReview(["COM_CERT"])).toBe(true);
    expect(canRecordDecisionOutcome(["COM_CERT"])).toBe(true);
    expect(canFinalizeDecisionOutcome(["COM_CERT"], "IN_REVIEW", satisfiedQuorum)).toBe(true);
  });

  it("denies STAFF_DIR and STAFF_SYSADM finalize", () => {
    expect(canRecordDecisionOutcome(["STAFF_DIR"])).toBe(false);
    expect(canStartDecisionReview(["STAFF_DIR"])).toBe(false);
    expect(canRecordDecisionOutcome(["STAFF_SYSADM"])).toBe(false);
    expect(canFinalizeDecisionOutcome(["STAFF_DIR"], "IN_REVIEW", satisfiedQuorum)).toBe(false);
  });

  it("blocks COM_CERT finalize without quorum evidence", () => {
    expect(canFinalizeDecisionOutcome(["COM_CERT"], "IN_REVIEW", null)).toBe(false);
    expect(evaluateQuorumFinalizeState("IN_REVIEW", null).blockedReason).toBe("quorum_missing");
  });

  it("blocks COM_CERT finalize with insufficient quorum", () => {
    expect(
      canFinalizeDecisionOutcome(["COM_CERT"], "IN_REVIEW", {
        ...satisfiedQuorum,
        quorumConfirmed: false,
        quorumCount: 1,
      }),
    ).toBe(false);
  });

  it("marks director as governance-only view", () => {
    expect(isDirectorGovernanceOnlyDecisionView(["STAFF_DIR"])).toBe(true);
    expect(isDirectorGovernanceOnlyDecisionView(["COM_CERT"])).toBe(false);
  });
});
