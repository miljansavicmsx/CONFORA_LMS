import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { EnterpriseEmptyState } from "@/design-system/EnterpriseEmptyState";
import { EnterpriseKpiCard } from "@/design-system/EnterpriseKpiCard";
import { EnterpriseSectionHeader } from "@/design-system/EnterpriseSectionHeader";
import { EnterpriseStatusBadge } from "@/design-system/EnterpriseStatusBadge";

describe("Enterprise primitives", () => {
  it("EnterpriseEmptyState exposes title and primary link", () => {
    render(
      <MemoryRouter>
        <EnterpriseEmptyState
          id="t-empty"
          title="Nema zapisa"
          description="Opis praznog stanja."
          primary={{ label: "Dalje", to: "/x" }}
        />
      </MemoryRouter>,
    );
    const title = screen.getByRole("heading", { name: "Nema zapisa" });
    expect(title.id).toBe("t-empty-title");
    const link = screen.getByRole("link", { name: "Dalje" });
    expect(link.getAttribute("href")).toBe("/x");
  });

  it("EnterpriseKpiCard exposes group label for screen readers", () => {
    render(<EnterpriseKpiCard label="Prihod" value="12" hint="EUR" />);
    expect(screen.getByRole("group", { name: "Prihod" })).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
  });

  it("EnterpriseSectionHeader renders chosen heading level", () => {
    const { container } = render(
      <EnterpriseSectionHeader titleLevel="h3" eyebrow="ISO" title="Pregled" description="Detalji." />,
    );
    expect(container.querySelector("h3")?.textContent).toBe("Pregled");
  });

  it("EnterpriseStatusBadge forwards text", () => {
    render(<EnterpriseStatusBadge severity="warning">Čekanje</EnterpriseStatusBadge>);
    expect(screen.getByText("Čekanje")).toBeTruthy();
  });
});
