import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { createConforaI18n } from "@confora/i18n";
import type { ReactElement } from "react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LearnerDashboard } from "./LearnerDashboard";

const catalogue = {
  areas: [{ code: "DIGCOMP" }, { code: "ISMS" }],
  courses: [
    {
      id: "c1000000-0000-4000-8000-000000000001",
      code: "DIGCOMP-01",
      title: "Osnove digitalne kompetencije",
      description: "Uvod u pretragu.",
      areaCode: "DIGCOMP",
      imageObjectKey: "/learning/cover-digcomp.svg",
      language: "bs",
      priceAmount: "0.00",
      priceCurrency: "BAM",
      typicalLearningTimeMinutes: 30,
      learningObjectives: null,
      educationalLevel: null,
      targetAudience: null,
      requiresCertification: false,
    },
    {
      id: "c2000000-0000-4000-8000-000000000001",
      code: "ISMS-01",
      title: "Uvod u informacionu sigurnost",
      description: "Povjerljivost.",
      areaCode: "ISMS",
      imageObjectKey: "/learning/cover-isms.svg",
      language: "bs",
      priceAmount: "90.00",
      priceCurrency: "BAM",
      typicalLearningTimeMinutes: 30,
      learningObjectives: null,
      educationalLevel: null,
      targetAudience: null,
      requiresCertification: false,
    },
  ],
};

vi.mock("@/lib/learning-api", () => ({
  fetchLearningCatalogue: vi.fn(async () => catalogue),
  fetchMyLearningEnrolments: vi.fn(async () => []),
  enrolInLearningCourse: vi.fn(),
  readLearningCart: () => [],
  writeLearningCart: vi.fn(),
}));

function renderDashboard(lng: string): { ui: ReactElement } {
  const i18n = createConforaI18n({ lng, fallbackLng: "en" });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const ui = (
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <LearnerDashboard learnerName="Miljan" />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
  return { ui };
}

describe("LearnerDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("groups courses by area and opens the Bosnian overview action", async () => {
    const { ui } = renderDashboard("bs");
    render(ui);
    expect(await screen.findByRole("heading", { name: /Dobro došli, Miljan/ })).toBeTruthy();
    expect(await screen.findByRole("heading", { name: "Osnove digitalne kompetencije" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "DIGCOMP" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "ISMS" })).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Opšte" })[0]!);
    expect(screen.getByRole("button", { name: "Dodaj kurs" })).toBeTruthy();
    expect(screen.getByText("Uvod u pretragu.")).toBeTruthy();
  });

  it("uses the English overview label", async () => {
    const { ui } = renderDashboard("en");
    render(ui);
    expect((await screen.findAllByRole("button", { name: "Overview" })).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /Welcome, Miljan/ })).toBeTruthy();
  });
});
