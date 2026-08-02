import { type JSX } from "react";
import { createConforaI18n, CANDIDATE_PORTAL_NS } from "@confora/i18n";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";

import { CertificateSelector } from "@/components/learner/CertificateSelector";
import type { MyCertificateItem } from "@/lib/api-certificates";

function cert(id: string, title: string): MyCertificateItem {
  return {
    certificateId: id,
    certificateKind: "PERSON_CERTIFICATION",
    credentialWalletCategory: "certification",
    documentTypeLabel: "Person certification",
    title,
    courseName: null,
    certificationLevel: "1",
    certificateNumber: id,
    issueDate: "2026-01-01",
    expiryDate: "2031-01-01",
    lifecycleStatus: "ACTIVE",
    qrHash: null,
    pdfUrl: null,
    learnerVerifyPath: `/verify/${id}`,
    publicVerificationUrl: null,
    supersededByCertificateId: null,
    schemeTitle: title,
    issuedAt: "2026-01-01",
    validUntil: "2031-01-01",
    publicNumber: id,
    recertificationEligible: true,
    cpdEligible: true,
  };
}

function renderSelector(ui: JSX.Element) {
  const i18n = createConforaI18n({ lng: "en", fallbackLng: "en" });
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe("CertificateSelector", () => {
  it("renders loading state", () => {
    renderSelector(
      <CertificateSelector certificates={[]} selectedId={null} onSelect={vi.fn()} loading />,
    );
    expect(screen.getByTestId("certificate-selector-loading")).toBeTruthy();
  });

  it("renders empty state when no certificates", () => {
    renderSelector(
      <CertificateSelector certificates={[]} selectedId={null} onSelect={vi.fn()} />,
    );
    expect(screen.getByTestId("certificate-selector-empty")).toBeTruthy();
  });

  it("renders select from API certificates", () => {
    const onSelect = vi.fn();
    renderSelector(
      <CertificateSelector
        certificates={[cert("CON-A", "Scheme A"), cert("CON-B", "Scheme B")]}
        selectedId="CON-A"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByTestId("certificate-selector")).toBeTruthy();
    expect(screen.getByTestId("certificate-selector-summary")).toBeTruthy();
    fireEvent.change(screen.getByTestId("certificate-selector-select"), { target: { value: "CON-B" } });
    expect(onSelect).toHaveBeenCalledWith("CON-B");
  });

  it("shows fallback hint when dev query param is active", () => {
    renderSelector(
      <CertificateSelector
        certificates={[cert("CON-FB", "Fallback scheme")]}
        selectedId="CON-FB"
        onSelect={vi.fn()}
        fallbackActive
      />,
    );
    expect(screen.getByTestId("certificate-selector-fallback-hint")).toBeTruthy();
  });
});
