import { describe, expect, it } from "vitest";

import {
  applicationStatusLabel,
  certificateLifecycleStatusLabel,
  decisionOutcomeLabel,
  decisionReviewStatusLabel,
  resolveCertificationWorkflowStage,
} from "@/lib/certification-ops-labels";

describe("certification-ops-labels", () => {
  it("maps application status to HR label", () => {
    expect(applicationStatusLabel("SUBMITTED")).toBe("Poslano");
    expect(applicationStatusLabel("PENDING_REVIEW")).toBe("Na pregledu");
  });

  it("maps decision review status", () => {
    expect(decisionReviewStatusLabel("IN_REVIEW")).toBe("U pregledu odluke");
    expect(decisionReviewStatusLabel("DECIDED")).toBe("Odluka donesena");
  });

  it("maps decision outcome without conflating issuance", () => {
    expect(decisionOutcomeLabel("CERTIFICATION_APPROVED")).toBe("Certifikacija odobrena");
  });

  it("distinguishes ISSUED from ACTIVE lifecycle", () => {
    expect(certificateLifecycleStatusLabel("ISSUED")).toBe("Izdano");
    expect(certificateLifecycleStatusLabel("ACTIVE")).toBe("Aktivan");
    expect(certificateLifecycleStatusLabel("ISSUED")).not.toBe(certificateLifecycleStatusLabel("ACTIVE"));
  });

  it("resolves decision stage when eligibility completed", () => {
    const stage = resolveCertificationWorkflowStage({
      applicationStatus: "UNDER_REVIEW",
      eligibilityStatus: "COMPLETED",
      decisionStatus: "IN_REVIEW",
    });
    expect(stage.stageId).toBe("DECISION");
    expect(stage.responsibleRole).toContain("COM_CERT");
  });

  it("resolves issuance stage after decision", () => {
    const stage = resolveCertificationWorkflowStage({
      applicationStatus: "APPROVED",
      decisionStatus: "DECIDED",
      decisionOutcome: "CERTIFICATION_APPROVED",
      issuanceStatus: "NOT_STARTED",
    });
    expect(stage.stageId).toBe("ISSUANCE");
    expect(stage.blockedReason).toContain("Izdavanje");
  });
});
