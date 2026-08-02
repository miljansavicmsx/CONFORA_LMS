import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { CourseCatalogFilterBar } from "@/components/learning/CourseCatalogFilterBar";
import { CourseCatalogHero } from "@/components/learning/CourseCatalogHero";

describe("Course catalog (sastavni dijelovi)", () => {
  it("hero i filter bar su dostupni čitljivim natpisima", () => {
    render(
      <MemoryRouter>
        <div>
          <CourseCatalogHero />
          <CourseCatalogFilterBar
            selectedArea="all"
            onAreaChange={() => {}}
            searchQuery=""
            onSearchChange={() => {}}
          />
        </div>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /Izaberite program obuke/i })).toBeTruthy();
    expect(screen.getByRole("tablist", { name: /Filtri oblasti/i })).toBeTruthy();
  });
});
