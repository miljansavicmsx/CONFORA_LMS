import { describe, expect, it } from "vitest";

import {
  adminAuditActionLabel,
  adminAuditResourceTypeLabel,
  adminBodyMustNotExposeRawEnums,
  adminEducationEventKeyLabel,
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

  it.each([
    ["education.report.read", "Pregled izvještaja edukacije"],
    ["education.completion.recorded", "Zabilježen završetak edukacije"],
    ["education.enrolment.confirmed", "Potvrđen upis na kurs"],
  ] as const)("maps audit action %s", (raw, expected) => {
    expect(adminAuditActionLabel(raw)).toBe(expected);
    expect(adminEducationEventKeyLabel(raw)).toBe(expected);
  });

  it.each([
    ["education.report", "Izvještaj edukacije"],
    ["education.enrolment", "Upis na kurs"],
  ] as const)("maps audit resource %s", (raw, expected) => {
    expect(adminAuditResourceTypeLabel(raw)).toBe(expected);
  });

  it("audit labels do not expose raw dot-notation keys", () => {
    expect(adminAuditActionLabel("education.report.read")).not.toContain("education.report");
    expect(adminAuditResourceTypeLabel("education.report")).not.toBe("education.report");
  });
});
