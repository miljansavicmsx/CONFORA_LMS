import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import DemoStartPage from "@/pages/public/DemoStartPage";
import LandingPage from "@/pages/public/LandingPage";
import PricingPage from "@/pages/public/PricingPage";
import VerifyLookupPage from "@/pages/public/VerifyLookupPage";

describe("launch public pages", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders landing page", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/CONFORA/i)).toBeTruthy();
  });

  it("renders pricing page", () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Starter/i)).toBeTruthy();
  });

  it("renders verify page", () => {
    render(
      <MemoryRouter>
        <VerifyLookupPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /Javna verifikacija/i })).toBeTruthy();
  });

  it("renders demo start page", () => {
    render(
      <MemoryRouter>
        <DemoStartPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /Start Demo/i })).toBeTruthy();
  });
});

