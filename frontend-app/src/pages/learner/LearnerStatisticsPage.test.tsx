import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { createConforaI18n } from "@confora/i18n";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import LearnerStatisticsPage from "./LearnerStatisticsPage";

vi.mock("@/lib/learning-api", () => ({
  fetchLearningStatistics: vi.fn(async () => ({
    analyticsConsent: false,
    enrolments: [
      {
        enrolmentId: "33333333-3333-4333-8333-333333333333",
        courseId: "course",
        courseTitle: "Osnove digitalne kompetencije",
        areaCode: "DIGCOMP",
        progressPercent: 40,
        completedAt: null,
        paymentState: "NOT_REQUIRED",
      },
    ],
    quizResults: [
      {
        attemptId: "attempt",
        quizId: "quiz",
        quizTitle: "Kviz poglavlja",
        courseTitle: "Osnove digitalne kompetencije",
        scorePercent: 100,
        passed: true,
        submittedAt: "2026-10-20T00:00:00.000Z",
      },
    ],
  })),
  saveAnalyticsConsent: vi.fn(),
}));

describe("LearnerStatisticsPage", () => {
  it("shows own progress, quiz result and consent state", async () => {
    const i18n = createConforaI18n({ lng: "bs", fallbackLng: "en" });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <LearnerStatisticsPage />
          </MemoryRouter>
        </I18nextProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole("heading", { name: "Statistika" })).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "Osnove digitalne kompetencije" })).toBeTruthy();
    expect(screen.getByText(/Kviz poglavlja · 100%/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Dozvoli analitiku" })).toBeTruthy();
  });
});
