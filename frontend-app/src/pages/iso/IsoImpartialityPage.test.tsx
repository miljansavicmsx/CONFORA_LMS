import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
  })),
}));

import IsoImpartialityPage from "./IsoImpartialityPage";

describe("IsoImpartialityPage", () => {
  it("renders title", () => {
    render(
      <MemoryRouter>
        <IsoImpartialityPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /Nepristranost \(ISO \/ IEC 17024\)/i })).toBeTruthy();
  });
});
