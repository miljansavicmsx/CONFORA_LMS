import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";

import { CredentialLifecycleBadge, StatusBadge } from "@/design-system/badges";
import { CertificateCard } from "@/design-system/cards";
import { DomainHero } from "@/design-system/heroes";
import { TrustVerificationCard } from "@/design-system/trust";

afterEach(() => {
  cleanup();
});

describe("Phase A DS — badges", () => {
  it("StatusBadge exposes semantic label override with ariaLabel", () => {
    render(
      <StatusBadge status="pending" ariaLabel="Status: Potrebna recertifikacija">
        Recertifikacija
      </StatusBadge>,
    );
    const el = document.querySelector("[aria-label=\"Status: Potrebna recertifikacija\"]");
    expect(el?.textContent).toContain("Recertifikacija");
  });

  it("CredentialLifecycleBadge maps ACTIVE to Aktivan aria", () => {
    render(<CredentialLifecycleBadge lifecycleStatus="ACTIVE" />);
    expect(document.querySelector("[aria-label=\"Status: Aktivan\"]")).toBeTruthy();
  });

  it("CredentialLifecycleBadge maps ISTEKAO to Istekao", () => {
    render(<CredentialLifecycleBadge lifecycleStatus="ISTEKAO" />);
    expect(document.querySelector("[aria-label=\"Status: Istekao\"]")).toBeTruthy();
  });
});

describe("Phase A DS — cards & trust", () => {
  it("CertificateCard merges aria-label and heading", () => {
    render(
      <CertificateCard ariaLabel="Dokument: ISO 9001 Lead Auditor" heading="ISO 9001 Lead Auditor">
        <p>Ovdje tijelo kartice.</p>
      </CertificateCard>,
    );
    expect(document.querySelector("[aria-label=\"Dokument: ISO 9001 Lead Auditor\"]")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: /iso 9001 lead auditor/i })).toBeTruthy();
  });

  it("TrustVerificationCard sets region aria for failure path", () => {
    render(
      <TrustVerificationCard verified={false} title="Nepoznat dokument" subtitle="Pokušajte drugi link.">
        <p>pomoćni tekst</p>
      </TrustVerificationCard>,
    );
    const region = document.querySelector(
      "[aria-label=\"Rezultat verifikacije: nije potvrđen ili javno nedostupan\"]",
    );
    expect(region).toBeTruthy();
  });
});

describe("Phase A DS — heroes", () => {
  it("DomainHero binds title id when id prefix provided", () => {
    render(<DomainHero variant="trust" eyebrow="Eyebrow" title="Naslov za test" id="test-hero-id" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.id).toBe("test-hero-id-title");
  });
});
