import { describe, expect, it } from "vitest";

import {
  LEARNER_EDUCATION_CERT_BOUNDARY_MESSAGE,
  LEARNER_ISSUED_ACTIVE_BOUNDARY,
  candidateApplicationNextStep,
  certificateLifecycleStatusLabel,
  containsLearnerPrivateFields,
  moduleProgressLabel,
} from "@/lib/learner-flow-labels";

describe("learner-flow-labels", () => {
  it("renders education/certification boundary message", () => {
    expect(LEARNER_EDUCATION_CERT_BOUNDARY_MESSAGE).toMatch(/ISO\/IEC 17024/i);
    expect(LEARNER_EDUCATION_CERT_BOUNDARY_MESSAGE).toMatch(/edukacij/i);
  });

  it("distinguishes ISSUED from ACTIVE", () => {
    expect(LEARNER_ISSUED_ACTIVE_BOUNDARY).toMatch(/ISSUED/i);
    expect(LEARNER_ISSUED_ACTIVE_BOUNDARY).toMatch(/ACTIVE/i);
    expect(certificateLifecycleStatusLabel("ISSUED")).not.toBe(certificateLifecycleStatusLabel("ACTIVE"));
  });

  it("maps module progress labels", () => {
    expect(moduleProgressLabel("COMPLETED")).toBe("Završeno");
    expect(moduleProgressLabel("IN_PROGRESS")).toBe("U tijeku");
  });

  it("provides next step for draft and submitted", () => {
    expect(candidateApplicationNextStep("DRAFT").title).toMatch(/pošaljite/i);
    expect(candidateApplicationNextStep("SUBMITTED").title).toMatch(/pregledu/i);
  });

  it("does not imply automatic approval for decision-pending", () => {
    expect(candidateApplicationNextStep("ELIGIBLE_FOR_DECISION").detail).toMatch(/Nema automatskog/i);
  });

  it("detects private internal fields", () => {
    expect(containsLearnerPrivateFields({ reviewerNotes: "secret" })).toBe(true);
    expect(containsLearnerPrivateFields({ applicationId: "x" })).toBe(false);
  });
});
