import { describe, expect, it } from "vitest";

import {
  adminBodyMustNotExposeRawEnums,
  adminReportStatusLabel,
  RAW_ADMIN_ENUM_DENY_LIST,
} from "../admin-gov-ux-labels";

describe("admin-gov-ux-labels", () => {
  it.each([
    ["ELIGIBILITY_REVIEW_COMPLETED", "Pregled podobnosti završen"],
    ["WITHDRAWN", "Povučeno"],
    ["DRAFT", "Nacrt"],
    ["EXAM_AUTHORIZATION_COMPLETED", "Odobrenje za ispit završeno"],
    ["SUBMITTED", "Podneseno"],
    ["APPROVED", "Odobreno"],
    ["CERTIFICATION_DECISION_RECORDED", "Odluka o certifikaciji evidentirana"],
    ["UNDER_REVIEW", "U pregledu"],
    ["NOT_STARTED", "Nije započeto"],
    ["IN_PROGRESS", "U toku"],
    ["COMPLETED", "Završeno"],
    ["PUBLIC", "Objavljeno"],
    ["ARCHIVED", "Arhivirano"],
    ["CONTACT", "Kontakt zahtevi"],
    ["APPEALS", "Žalbe"],
    ["COMPLAINTS", "Prigovori"],
  ] as const)("maps %s", (raw, expected) => {
    expect(adminReportStatusLabel(raw)).toBe(expected);
  });

  it("deny list tokens are mapped away from raw display", () => {
    for (const token of RAW_ADMIN_ENUM_DENY_LIST) {
      expect(adminReportStatusLabel(token)).not.toBe(token);
    }
  });

  it("adminBodyMustNotExposeRawEnums passes for mapped sample", () => {
    const body = [
      adminReportStatusLabel("SUBMITTED"),
      adminReportStatusLabel("DRAFT"),
      "Poslovni izvještaji",
    ].join(" ");
    expect(adminBodyMustNotExposeRawEnums(body)).toBe(true);
  });
});
