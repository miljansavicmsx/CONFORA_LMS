import { describe, expect, it } from "vitest";

import {
  canCommitteeApproveCertificationScheme,
  canDraftEditCertificationScheme,
  showActivateAction,
  showApproveAction,
  isSysAdminReadOnlyOnSchemes,
} from "@/lib/certification-schemes-ui-access";

describe("certification-schemes-ui-access", () => {
  it("shows approve only for cert_committee when status is REVIEW", () => {
    expect(showApproveAction("cert_committee", "REVIEW")).toBe(true);
    expect(showApproveAction("cert_committee", "DRAFT")).toBe(false);
    expect(showApproveAction("admin", "REVIEW")).toBe(false);
  });

  it("blocks director from draft edit", () => {
    expect(canDraftEditCertificationScheme("director")).toBe(false);
  });

  it("requires director or admin for activate on APPROVED", () => {
    expect(showActivateAction("director", "APPROVED")).toBe(true);
    expect(showActivateAction("admin", "APPROVED")).toBe(true);
    expect(showActivateAction("cert_committee", "APPROVED")).toBe(false);
  });

  it("flags sys_admin as read-only persona for scheme governance actions", () => {
    expect(isSysAdminReadOnlyOnSchemes("sys_admin")).toBe(true);
    expect(canCommitteeApproveCertificationScheme("sys_admin")).toBe(false);
  });
});
