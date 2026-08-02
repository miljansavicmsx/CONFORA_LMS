import { describe, expect, it } from "vitest";

import {
  canReadReviewStatusPanel,
  canShowStartReviewAction,
  shouldLoadReviewStatusQuery,
} from "@/lib/certification-begin-review-access";

const REVIEWER_ID = "b5200000-0000-4000-8000-000000000020";
const ASSIGNEE_REF = "rev-b5200000";

describe("certification-begin-review-access (P1-B5-3b)", () => {
  it("allows STAFF_DIR to read review status panel", () => {
    expect(canReadReviewStatusPanel(["STAFF_DIR"])).toBe(true);
    expect(shouldLoadReviewStatusQuery(["STAFF_DIR"])).toBe(true);
  });

  it("shows start review when SUBMITTED + ACCEPTED + assignee reviewer", () => {
    expect(
      canShowStartReviewAction({
        applicationStatus: "SUBMITTED",
        assignmentStatus: "ACCEPTED",
        assigneeReference: ASSIGNEE_REF,
        nestRoles: ["STAFF_TRAINADM"],
        currentUserId: REVIEWER_ID,
      }),
    ).toBe(true);
  });

  it("hides start review for COM_CERT-only", () => {
    expect(
      canShowStartReviewAction({
        applicationStatus: "SUBMITTED",
        assignmentStatus: "ACCEPTED",
        assigneeReference: ASSIGNEE_REF,
        nestRoles: ["COM_CERT"],
        currentUserId: REVIEWER_ID,
      }),
    ).toBe(false);
  });

  it("hides start review when application is not SUBMITTED", () => {
    expect(
      canShowStartReviewAction({
        applicationStatus: "UNDER_REVIEW",
        assignmentStatus: "ACCEPTED",
        assigneeReference: ASSIGNEE_REF,
        nestRoles: ["SME"],
        currentUserId: REVIEWER_ID,
      }),
    ).toBe(false);
  });

  it("hides start review when assignment is not ACCEPTED", () => {
    expect(
      canShowStartReviewAction({
        applicationStatus: "SUBMITTED",
        assignmentStatus: "ASSIGNED",
        assigneeReference: ASSIGNEE_REF,
        nestRoles: ["SME"],
        currentUserId: REVIEWER_ID,
      }),
    ).toBe(false);

    expect(
      canShowStartReviewAction({
        applicationStatus: "SUBMITTED",
        assignmentStatus: "IN_REVIEW",
        assigneeReference: ASSIGNEE_REF,
        nestRoles: ["SME"],
        currentUserId: REVIEWER_ID,
      }),
    ).toBe(false);
  });

  it("hides start review for non-assigned reviewer", () => {
    expect(
      canShowStartReviewAction({
        applicationStatus: "SUBMITTED",
        assignmentStatus: "ACCEPTED",
        assigneeReference: ASSIGNEE_REF,
        nestRoles: ["STAFF_TRAINADM"],
        currentUserId: "other-user-id",
      }),
    ).toBe(false);
  });

  it("hides start review for director not assigned as reviewer", () => {
    expect(
      canShowStartReviewAction({
        applicationStatus: "SUBMITTED",
        assignmentStatus: "ACCEPTED",
        assigneeReference: ASSIGNEE_REF,
        nestRoles: ["STAFF_DIR"],
        currentUserId: "b5100000-0000-4000-8000-000000000099",
      }),
    ).toBe(false);
  });
});
