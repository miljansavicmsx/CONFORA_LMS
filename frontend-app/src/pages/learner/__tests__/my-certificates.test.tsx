import { describe, expect, it } from "vitest";

import { certificateMatchesWalletFilter } from "@/pages/learner/MyCertificates";
import type { MyCertificateItem } from "@/lib/api-certificates";

function cert(overrides: Partial<MyCertificateItem>): MyCertificateItem {
  return {
    certificateId: "cert-1",
    certificateKind: "EXAM_PASS_CERTIFICATE",
    credentialWalletCategory: "exam_pass",
    documentTypeLabel: "Potvrda o položenom ispitu",
    title: "ISO 27001",
    courseName: "ISO 27001",
    certificationLevel: null,
    certificateNumber: "N-1",
    issueDate: null,
    expiryDate: null,
    lifecycleStatus: "ACTIVE",
    qrHash: "a".repeat(64),
    pdfUrl: null,
    learnerVerifyPath: "/verify/hash",
    publicVerificationUrl: "https://verify/hash",
    supersededByCertificateId: null,
    ...overrides,
  };
}

describe("certificate wallet filters", () => {
  it("keeps exam pass separate from person certification", () => {
    const exam = cert({ credentialWalletCategory: "exam_pass", certificateKind: "EXAM_PASS_CERTIFICATE" });
    const person = cert({ credentialWalletCategory: "certification", certificateKind: "PERSON_CERTIFICATION" });

    expect(certificateMatchesWalletFilter(exam, "exam_pass")).toBe(true);
    expect(certificateMatchesWalletFilter(exam, "certification")).toBe(false);
    expect(certificateMatchesWalletFilter(person, "certification")).toBe(true);
  });

  it("treats person recertification statuses as active wallet filter", () => {
    expect(
      certificateMatchesWalletFilter(
        cert({ credentialWalletCategory: "certification", lifecycleStatus: "RECERTIFICATION_DUE", certificateKind: "PERSON_CERTIFICATION" }),
        "active",
      ),
    ).toBe(true);
    expect(
      certificateMatchesWalletFilter(
        cert({
          credentialWalletCategory: "certification",
          lifecycleStatus: "UNDER_RECERTIFICATION_REVIEW",
          certificateKind: "PERSON_CERTIFICATION",
        }),
        "active",
      ),
    ).toBe(true);
  });

  it("matches revoked and expired statuses", () => {
    expect(certificateMatchesWalletFilter(cert({ lifecycleStatus: "REVOKED" }), "revoked")).toBe(true);
    expect(certificateMatchesWalletFilter(cert({ lifecycleStatus: "EXPIRED" }), "expired")).toBe(true);
    expect(certificateMatchesWalletFilter(cert({ lifecycleStatus: "SUSPENDED" }), "suspended")).toBe(true);
  });
});
