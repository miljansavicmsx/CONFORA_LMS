import { describe, expect, it } from "vitest";

import {
  applicationStatusLabel,
  decisionOutcomeLabel,
  decisionReviewStatusLabel,
} from "@/lib/certification-ops-labels";

describe("certification-ops-labels (MD08 residual)", () => {
  it("maps application status to HR/BHS label", () => {
    expect(applicationStatusLabel("SUBMITTED")).toBe("Podneseno");
    expect(applicationStatusLabel("PENDING_REVIEW")).toBe("U pregledu");
    expect(applicationStatusLabel("UNKNOWN_STATUS_XYZ")).toBe("UNKNOWN_STATUS_XYZ");
  });

  it("maps decision review status", () => {
    expect(decisionReviewStatusLabel("IN_REVIEW")).toBe("U pregledu odluke");
    expect(decisionReviewStatusLabel("DECIDED")).toBe("Odluka donesena");
    expect(decisionReviewStatusLabel("NOT_STARTED")).toBe("Nije započeto");
  });

  it("maps decision outcome without conflating issuance", () => {
    expect(decisionOutcomeLabel("CERTIFICATION_APPROVED")).toBe("Certifikacija odobrena");
    expect(decisionOutcomeLabel("CERTIFICATION_DENIED")).toBe("Certifikacija odbijena");
    expect(decisionOutcomeLabel(null)).toBe("—");
    expect(decisionOutcomeLabel(undefined)).toBe("—");
  });
});
