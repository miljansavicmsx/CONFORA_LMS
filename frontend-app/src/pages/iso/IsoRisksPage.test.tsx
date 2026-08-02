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

import IsoRisksPage from "./IsoRisksPage";

describe("IsoRisksPage", () => {
  it("renders heatmap tab shell", async () => {
    render(
      <MemoryRouter>
        <IsoRisksPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Registar rizika \(ISO 17024\)/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /heatmap 5×5/i })).toBeTruthy();
  });
});
