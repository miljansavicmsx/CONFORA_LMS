import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { GovernanceCockpitHero } from "@/components/dashboard/enterprise/GovernanceCockpitHero";

afterEach(() => {
  cleanup();
});

describe("GovernanceCockpitHero", () => {
  it("renders metrics and headings", () => {
    render(
      <MemoryRouter>
        <GovernanceCockpitHero
          title="Test cockpit"
          subtitle="Opis cockpit-a za test."
          metrics={[
            { label: "Stavka A", value: 3, severity: "success" },
            { label: "Stavka B", value: "ok", href: "/x" },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Test cockpit" })).toBeTruthy();
    expect(screen.getByText("Stavka A")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("Stavka B")).toBeTruthy();
    expect(screen.getByText("ok")).toBeTruthy();
  });

  it("technical surface emphasises observability wording", () => {
    render(
      <MemoryRouter>
        <GovernanceCockpitHero
          surface="technical"
          title="Ops test"
          subtitle="Tehnički signal."
          metrics={[{ label: "API", value: "ok" }]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("Operations observability")).toBeTruthy();
    expect(screen.queryByText("Command center")).toBeNull();
  });
});
