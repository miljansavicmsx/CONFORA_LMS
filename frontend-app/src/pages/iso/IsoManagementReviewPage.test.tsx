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

import IsoManagementReviewPage from "./IsoManagementReviewPage";

describe("IsoManagementReviewPage", () => {
  it("rendira naslov stranice", () => {
    render(
      <MemoryRouter>
        <IsoManagementReviewPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Pregled rukovodstva \(ISO \/ IEC 17024\)/i)).toBeTruthy();
  });
});
