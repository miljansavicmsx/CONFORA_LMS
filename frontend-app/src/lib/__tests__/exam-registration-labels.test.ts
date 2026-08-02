import { describe, expect, it } from "vitest";

import {
  EXAM_REGISTRATION_BOUNDARY_NOTICE,
  hideRawExamRegistrationEnum,
  learnerExamRegistrationEligibilityLabel,
  learnerExamRegistrationStatusLabel,
} from "@/lib/exam-registration-labels";

describe("exam-registration-labels", () => {
  it("maps eligibility to Serbian labels", () => {
    expect(learnerExamRegistrationEligibilityLabel("ELIGIBLE_TO_REGISTER")).toBe(
      "Možete se prijaviti za ispit",
    );
    expect(learnerExamRegistrationEligibilityLabel("BLOCKED_EDUCATION_NOT_COMPLETED")).toBe(
      "Edukacija nije završena",
    );
    expect(hideRawExamRegistrationEnum("ELIGIBLE_TO_REGISTER")).toBe(true);
    expect(hideRawExamRegistrationEnum(EXAM_REGISTRATION_BOUNDARY_NOTICE)).toBe(false);
  });

  it("maps registration statuses without raw enums", () => {
    expect(learnerExamRegistrationStatusLabel("REGISTERED")).toBe("Prijavljen");
    expect(learnerExamRegistrationStatusLabel("RESULT_RECORDED")).toBe("Rezultat evidentiran");
    expect(learnerExamRegistrationStatusLabel("UNKNOWN")).toBe("Status prijave");
  });
});
