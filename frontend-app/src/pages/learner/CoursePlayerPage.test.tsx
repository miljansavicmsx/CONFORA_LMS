import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { createConforaI18n } from "@confora/i18n";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import CoursePlayerPage from "./CoursePlayerPage";

vi.mock("@/lib/learning-api", () => ({
  fetchCoursePlayer: vi.fn(async () => ({
    enrolmentId: "33333333-3333-4333-8333-333333333333",
    paymentState: "PENDING_PAYMENT",
    course: {
      id: "course",
      title: "Osnove digitalne kompetencije",
      description: "Opis",
      areaCode: "DIGCOMP",
      imageObjectKey: null,
      minimumTimeSeconds: 30,
      progressPercent: 0,
      completedAt: null,
    },
    chapters: [
      {
        id: "chapter",
        sequence: 1,
        title: "Poglavlje 1",
        minimumTimeSeconds: 30,
        timeSpentSeconds: 0,
        lessons: [
          {
            id: "lesson",
            sequence: 1,
            title: "Uvodna lekcija",
            minimumTimeSeconds: 30,
            timeSpentSeconds: 30,
            completed: true,
            blocks: [
              { id: "text", sequence: 1, kind: "TEXT", title: "Tekst", textBody: "Tekst lekcije", objectKey: null },
              { id: "pdf", sequence: 2, kind: "PDF", title: "Bilješka", textBody: null, objectKey: "/learning/note.svg" },
            ],
          },
        ],
        quiz: {
          id: "quiz",
          title: "Kviz poglavlja",
          passMarkPercent: 100,
          passed: false,
          latestScorePercent: null,
          items: [
            {
              id: "item",
              sequence: 1,
              stem: "Šta važi za ovu obuku?",
              choices: [
                { choiceKey: "A", text: "Obuka je odvojena." },
                { choiceKey: "B", text: "Kviz izdaje certifikat." },
              ],
            },
          ],
        },
      },
    ],
  })),
  recordLessonProgress: vi.fn(),
  submitChapterQuiz: vi.fn(),
}));

describe("CoursePlayerPage", () => {
  it("shows chapter navigation, completed lesson text and the assistant placeholder", async () => {
    const i18n = createConforaI18n({ lng: "bs", fallbackLng: "en" });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={["/dashboard/learner/courses/33333333-3333-4333-8333-333333333333"]}>
            <Routes>
              <Route path="/dashboard/learner/courses/:enrolmentId" element={<CoursePlayerPage />} />
            </Routes>
          </MemoryRouter>
        </I18nextProvider>
      </QueryClientProvider>,
    );
    expect(await screen.findByRole("heading", { name: "Osnove digitalne kompetencije" })).toBeTruthy();
    expect(screen.getByText("Pređeno")).toBeTruthy();
    expect(screen.getByText("Tekst lekcije")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Bilješka" }).getAttribute("href")).toBe("/learning/note.svg");
    fireEvent.click(screen.getByRole("button", { name: /Kviz poglavlja/ }));
    expect(screen.getByRole("group", { name: "Šta važi za ovu obuku?" })).toBeTruthy();
    expect(screen.getByRole("note").textContent).toContain("Razgovor s pomoćnikom još nije dostupan");
    expect(screen.getByText("Plaćanje na čekanju")).toBeTruthy();
  });
});
