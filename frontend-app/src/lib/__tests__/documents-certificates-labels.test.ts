import { describe, expect, it } from "vitest";

import type { MyCertificateItem } from "@/lib/api-certificates";
import {
  CONFIRMATION_SECTION_NOTICE,
  canDownloadPdf,
  hideRawEnumFromLearnerText,
  issuedIsDistinctFromActive,
  learnerCertificateStatusLabel,
  learnerDocumentTypeLabel,
  shouldShowPublicVerificationForCertificate,
} from "@/lib/documents-certificates-labels";

function cert(overrides: Partial<MyCertificateItem>): MyCertificateItem {
  return {
    certificateId: "cert-1",
    certificateKind: "EXAM_PASS_CERTIFICATE",
    credentialWalletCategory: "exam_pass",
    documentTypeLabel: "Potvrda",
    title: "Test",
    courseName: null,
    certificationLevel: null,
    certificateNumber: "N-1",
    issueDate: null,
    expiryDate: null,
    lifecycleStatus: "ACTIVE",
    qrHash: null,
    pdfUrl: null,
    learnerVerifyPath: "/verify/hash",
    publicVerificationUrl: null,
    supersededByCertificateId: null,
    ...overrides,
  };
}

describe("documents-certificates-labels", () => {
  it("maps document types to Serbian labels without raw enums", () => {
    expect(learnerDocumentTypeLabel("EXAM_PASS_CERTIFICATE")).toBe("Potvrda o položenom ispitu");
    expect(learnerDocumentTypeLabel("EDUCATION_COMPLETION_CONFIRMATION")).toBe(
      "Potvrda o završenoj edukaciji",
    );
    expect(learnerDocumentTypeLabel("PERSON_CERTIFICATION")).toBe("Profesionalni certifikat osobe");
    expect(learnerDocumentTypeLabel("ISO_17024_CERTIFICATE")).toBe("ISO/IEC 17024 certifikat osobe");
    expect(learnerDocumentTypeLabel("UNKNOWN_INTERNAL")).toBe("Dokument");
    expect(hideRawEnumFromLearnerText("EXAM_PASS_CERTIFICATE")).toBe(true);
    expect(hideRawEnumFromLearnerText(CONFIRMATION_SECTION_NOTICE)).toBe(false);
  });

  it("maps certificate statuses without collapsing ISSUED to ACTIVE", () => {
    expect(learnerCertificateStatusLabel("ISSUED")).toBe("Izdat");
    expect(learnerCertificateStatusLabel("ACTIVE")).toBe("Aktivan");
    expect(learnerCertificateStatusLabel("PENDING_ISSUANCE")).toBe("Izdavanje u toku");
    expect(issuedIsDistinctFromActive("ISSUED")).toBe(true);
    expect(issuedIsDistinctFromActive("ACTIVE")).toBe(false);
  });

  it("shows download only when pdf is safely available", () => {
    expect(canDownloadPdf(cert({ pdfUrl: null, pdfDownloadAvailable: false }))).toBe(false);
    expect(canDownloadPdf(cert({ pdfUrl: "https://cdn.example.test/a.pdf" }))).toBe(true);
    expect(canDownloadPdf(cert({ pdfDownloadAvailable: true }))).toBe(true);
  });

  it("shows public verification only for public-verifiable person certificates", () => {
    const confirmation = cert({
      credentialWalletCategory: "exam_pass",
      lifecycleStatus: "ACTIVE",
      learnerVerifyPath: "/verify/x",
    });
    const personActive = cert({
      credentialWalletCategory: "certification",
      certificateKind: "PERSON_CERTIFICATION",
      lifecycleStatus: "ACTIVE",
      learnerVerifyPath: "/verify/y",
    });
    const personDraft = cert({
      credentialWalletCategory: "certification",
      certificateKind: "PERSON_CERTIFICATION",
      lifecycleStatus: "DRAFT",
      learnerVerifyPath: "/verify/z",
    });

    expect(shouldShowPublicVerificationForCertificate(confirmation)).toBe(false);
    expect(shouldShowPublicVerificationForCertificate(personActive)).toBe(true);
    expect(shouldShowPublicVerificationForCertificate(personDraft)).toBe(false);
  });
});
