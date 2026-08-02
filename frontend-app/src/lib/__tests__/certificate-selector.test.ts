import { describe, expect, it } from "vitest";

import { filterCpdSelectorCertificates, resolveDefaultCertificateId } from "@/lib/certificate-selector";
import type { MyCertificateItem } from "@/lib/api-certificates";

function cert(overrides: Partial<MyCertificateItem>): MyCertificateItem {
  return {
    certificateId: "cert-1",
    certificateKind: "PERSON_CERTIFICATION",
    credentialWalletCategory: "certification",
    documentTypeLabel: "Person certification",
    title: "Widget Pro",
    courseName: null,
    certificationLevel: "2",
    certificateNumber: "CON-1",
    issueDate: "2026-01-01",
    expiryDate: "2031-01-01",
    lifecycleStatus: "ACTIVE",
    qrHash: null,
    pdfUrl: null,
    learnerVerifyPath: "/verify/CON-1",
    publicVerificationUrl: null,
    supersededByCertificateId: null,
    schemeTitle: "Widget Scheme",
    issuedAt: "2026-01-01",
    validUntil: "2031-01-01",
    publicNumber: "CON-1",
    recertificationEligible: true,
    cpdEligible: true,
    ...overrides,
  };
}

describe("certificate selector helpers", () => {
  it("filters to CPD-eligible person certifications only", () => {
    const items = [
      cert({ certificateId: "person-1" }),
      cert({
        certificateId: "exam-1",
        credentialWalletCategory: "exam_pass",
        certificateKind: "EXAM_PASS_CERTIFICATE",
        cpdEligible: false,
        recertificationEligible: false,
      }),
      cert({ certificateId: "blocked", recertificationEligible: false, cpdEligible: false }),
    ];
    expect(filterCpdSelectorCertificates(items).map((c) => c.certificateId)).toEqual(["person-1"]);
  });

  it("auto-selects when exactly one eligible certificate exists", () => {
    const items = [cert({ certificateId: "only-one" })];
    expect(resolveDefaultCertificateId(items, null)).toBe("only-one");
  });

  it("prefers valid ?certificateId= fallback over multi-select", () => {
    const items = [cert({ certificateId: "a" }), cert({ certificateId: "b" })];
    expect(resolveDefaultCertificateId(items, "b")).toBe("b");
  });

  it("returns null when no eligible certificates exist", () => {
    expect(resolveDefaultCertificateId([], "fallback")).toBeNull();
  });
});
