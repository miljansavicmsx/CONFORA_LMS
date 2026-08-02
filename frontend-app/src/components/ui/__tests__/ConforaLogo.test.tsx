import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConforaLogo } from "@/components/ui/ConforaLogo";

describe("ConforaLogo", () => {
  it("exposes accessible name for full logo", () => {
    render(<ConforaLogo mode="full" />);
    expect(screen.getByRole("img", { name: "CONFORA logo" })).toBeTruthy();
  });

  it("is presentational when used inside a labelled control", () => {
    render(<ConforaLogo mode="icon" presentational />);
    const el = document.querySelector('svg[role="presentation"]');
    expect(el).toBeTruthy();
    expect(el?.getAttribute("aria-hidden")).toBe("true");
  });
});
