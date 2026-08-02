import { describe, expect, it } from "vitest";

import {
  evaluateStaffAppealsComplaintsAccess,
  isLearnerDeniedStaffAppealsComplaintsRoute,
} from "@/lib/staff-appeals-complaints-access";
import {
  STAFF_APPEAL_COMPLAINT_BOUNDARY_NOTICE,
  STAFF_RESOLUTION_DEFERRED_NOTICE,
  staffAppealStatusLabel,
  staffComplaintCategoryLabel,
} from "@/lib/appeals-complaints-labels";

describe("staff-appeals-complaints-access (APPEALS-COMPLAINTS-2)", () => {
  it("allows staff roles and denies learners", () => {
    expect(evaluateStaffAppealsComplaintsAccess({ roleFromProfile: "appeals_committee" })).toBe(true);
    expect(evaluateStaffAppealsComplaintsAccess({ roleFromProfile: "director" })).toBe(true);
    expect(evaluateStaffAppealsComplaintsAccess({ roleFromProfile: "sys_admin" })).toBe(true);
    expect(evaluateStaffAppealsComplaintsAccess({ roleFromProfile: "candidate" })).toBe(false);
    expect(evaluateStaffAppealsComplaintsAccess({ roleFromProfile: "learner" })).toBe(false);
    expect(isLearnerDeniedStaffAppealsComplaintsRoute({ roleFromProfile: "usr_cand" })).toBe(true);
  });
});

describe("staff appeals-complaints labels (APPEALS-COMPLAINTS-2)", () => {
  it("keeps staff boundary vocabulary and avoids raw enums", () => {
    expect(STAFF_APPEAL_COMPLAINT_BOUNDARY_NOTICE).toMatch(/Žalbe/);
    expect(STAFF_APPEAL_COMPLAINT_BOUNDARY_NOTICE).toMatch(/prigovori/i);
    expect(STAFF_APPEAL_COMPLAINT_BOUNDARY_NOTICE).toMatch(/certifikat/i);
    expect(STAFF_RESOLUTION_DEFERRED_NOTICE).toMatch(/acknowledge|zaprimanje/i);
    expect(staffAppealStatusLabel("SUBMITTED")).toBe("Podneseno");
    expect(staffComplaintCategoryLabel("PROCESS_COMPLAINT")).toMatch(/Prigovor/);
    expect(staffComplaintCategoryLabel("PROCESS_COMPLAINT")).not.toBe("PROCESS_COMPLAINT");
  });
});
