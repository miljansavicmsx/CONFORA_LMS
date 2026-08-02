import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  EnterpriseErrorPanel,
  EnterprisePartialDataPanel,
  EnterpriseUnavailablePanel,
} from "@/components/error-experience";

describe("enterprise error experience a11y", () => {
  it("error panel exposes alert role", () => {
    render(<EnterpriseErrorPanel title="API nedostupno" message="Nešto je pošlo po zlu." />);
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("heading", { name: /API nedostupno/i })).toBeTruthy();
  });

  it("unavailable panel exposes status role", () => {
    render(<EnterpriseUnavailablePanel title="Nedostupno" message="Servis nije dostupan." />);
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("partial data panel exposes status", () => {
    const { container } = render(<EnterprisePartialDataPanel title="Djelomično" message="Neki izvori fale." />);
    const statuses = container.querySelectorAll('[role="status"]');
    expect(statuses.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Neki izvori fale/)).toBeTruthy();
  });
});
