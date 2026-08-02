import { describe, expect, it } from "vitest";

import {
  CERT_ELIGIBILITY_BOUNDARY_NOTICE,
  isAvailableEligibilityStatus,
  isBlockedEligibilityStatus,
  isInProgressEligibilityStatus,
  sanitizeLearnerEligibilityLabel,
  splitEligibilityItems,
  type LearnerCertEligibilityItem,
} from "@/lib/cert-eligibility-labels";

const item = (
  status: LearnerCertEligibilityItem["eligibilityStatus"],
  overrides: Partial<LearnerCertEligibilityItem> = {},
): LearnerCertEligibilityItem => ({
  schemeId: "s1",
  schemeTitle: "ISO Scheme",
  programmeId: "c1",
  programmeTitle: "ISO Course",
  eligibilityStatus: status,
  learnerLabel: sanitizeLearnerEligibilityLabel(status),
  reason: null,
  nextStep: "Next",
  activeApplicationId: null,
  activeApplicationStatus: null,
  publicSchemeUrl: null,
  publicProgrammeUrl: "/courses/c1",
  canApply: status === "ELIGIBLE_TO_APPLY",
  ...overrides,
});

describe("cert-eligibility-labels", () => {
  it("maps internal enums to Serbian labels", () => {
    expect(sanitizeLearnerEligibilityLabel("ELIGIBLE_TO_APPLY")).toBe("Možete podnijeti prijavu");
    expect(sanitizeLearnerEligibilityLabel("BLOCKED_EXAM_NOT_PASSED")).toBe("Ispit nije položen");
  });

  it("splits items into available, in progress, and blocked sections", () => {
    const { available, inProgress, blocked } = splitEligibilityItems([
      item("ELIGIBLE_TO_APPLY"),
      item("IN_PROGRESS_APPLICATION", { activeApplicationId: "a1" }),
      item("BLOCKED_EDUCATION_NOT_COMPLETED"),
    ]);
    expect(available).toHaveLength(1);
    expect(inProgress).toHaveLength(1);
    expect(blocked).toHaveLength(1);
  });

  it("classifies eligibility status helpers", () => {
    expect(isAvailableEligibilityStatus("ELIGIBLE_TO_APPLY")).toBe(true);
    expect(isInProgressEligibilityStatus("IN_PROGRESS_APPLICATION")).toBe(true);
    expect(isBlockedEligibilityStatus("BLOCKED_SCHEME_UNAVAILABLE")).toBe(true);
  });

  it("defines certification boundary notice", () => {
    expect(CERT_ELIGIBILITY_BOUNDARY_NOTICE).toContain("odvojen postupak");
  });

  it("does not expose duplicate apply for in-progress items", () => {
    const inProg = item("IN_PROGRESS_APPLICATION", { canApply: false, activeApplicationId: "a1" });
    expect(inProg.canApply).toBe(false);
    expect(isAvailableEligibilityStatus(inProg.eligibilityStatus)).toBe(false);
  });
});
