import { describe, expect, it } from "vitest";

import {
  APPEAL_COMPLAINT_BOUNDARY_NOTICE,
  CONTACT_BOUNDARY_NOTICE,
  FORBIDDEN_LEARNER_GRIEVANCE_ENUMS,
  learnerAppealStatusLabel,
  learnerAppealTypeLabel,
  learnerComplaintCategoryLabel,
  learnerComplaintStatusLabel,
} from "@/lib/appeals-complaints-labels";

describe("appeals-complaints-labels (APPEALS-COMPLAINTS-1)", () => {
  it("keeps appeal and complaint vocabulary distinct", () => {
    expect(APPEAL_COMPLAINT_BOUNDARY_NOTICE).toMatch(/Žalba/);
    expect(APPEAL_COMPLAINT_BOUNDARY_NOTICE).toMatch(/Prigovor/);
    expect(APPEAL_COMPLAINT_BOUNDARY_NOTICE).toMatch(/nije ni žalba ni prigovor/i);
    expect(CONTACT_BOUNDARY_NOTICE).toMatch(/odvojen/i);
  });

  it("maps statuses to learner-safe labels without raw enums", () => {
    expect(learnerAppealStatusLabel("SUBMITTED")).toBe("Podneseno");
    expect(learnerComplaintStatusLabel("ACKNOWLEDGED")).toBe("Zaprimljeno");
    expect(learnerAppealTypeLabel("CERTIFICATION_DECISION_APPEAL")).toMatch(/Žalba/);
    expect(learnerComplaintCategoryLabel("complaint")).toMatch(/Prigovor/);
    for (const raw of FORBIDDEN_LEARNER_GRIEVANCE_ENUMS) {
      expect(learnerAppealStatusLabel(raw)).not.toBe(raw);
    }
  });

  it("exposes staff boundary notices for resolution UX", async () => {
    const mod = await import("@/lib/appeals-complaints-labels");
    expect(mod.STAFF_APPEAL_COMPLAINT_BOUNDARY_NOTICE).toMatch(/Žalbe/);
    expect(mod.STAFF_RESOLUTION_DEFERRED_NOTICE).toMatch(/void|poništenje/i);
  });
});
