import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReleaseReadinessDashboard } from "@/components/release-readiness";

describe("release readiness dashboard", () => {
  it("renders internal RC summary and known issues", () => {
    render(<ReleaseReadinessDashboard />);
    expect(screen.getByRole("region", { name: /Matrica spremnosti područja/i })).toBeTruthy();
    expect(screen.getByRole("region", { name: /Poznati problemi/i })).toBeTruthy();
    expect(screen.getByText(/snapshot\/heuristika/i)).toBeTruthy();
  });
});
