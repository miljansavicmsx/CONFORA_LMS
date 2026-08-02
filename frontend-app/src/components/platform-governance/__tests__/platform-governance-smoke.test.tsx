import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlatformGovernanceDashboard } from "@/components/platform-governance";

describe("platform governance dashboard", () => {
  it("renders internal governance landmark and domain panel", () => {
    render(<PlatformGovernanceDashboard />);
    expect(screen.getByRole("region", { name: "Platform governance dashboard" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Domain governance" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "AI compliance" })).toBeTruthy();
  });
});
