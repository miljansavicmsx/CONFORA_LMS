import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CertificationCatalogDisclaimer } from "../CertificationCatalogDisclaimer";

describe("CertificationCatalogDisclaimer (D-12)", () => {
  afterEach(() => cleanup());

  it("renders ISO/IEC 17024 certification boundary notice", () => {
    render(<CertificationCatalogDisclaimer />);
    const el = screen.getByTestId("catalog-cert-disclaimer");
    expect(el).toBeTruthy();
    expect(el.textContent).toMatch(/ISO\/IEC 17024/i);
    expect(el.textContent).toMatch(/ne daje automatski/i);
  });

  it("renders compact variant without extended paragraph", () => {
    render(<CertificationCatalogDisclaimer compact />);
    expect(screen.getByTestId("catalog-cert-disclaimer")).toBeTruthy();
    expect(screen.queryByText(/Certifikacija zahtijeva zaseban postupak/i)).toBeNull();
  });
});
