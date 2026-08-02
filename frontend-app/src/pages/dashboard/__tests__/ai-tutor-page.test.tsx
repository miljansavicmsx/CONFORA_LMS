import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import DashboardAiTutorPage from "@/pages/dashboard/DashboardAiTutorPage";

describe("DashboardAiTutorPage", () => {
  it("explains AI tutor boundaries", () => {
    render(
      <MemoryRouter>
        <DashboardAiTutorPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/AI ne donosi certifikacijske odluke/i)).toBeTruthy();
    expect(screen.getByText(/ne odobrava ili odbija prijavu/i)).toBeTruthy();
    expect(screen.getByText(/AI daje edukativnu pomoć/i)).toBeTruthy();
  });
});
