import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import ExamTakingPage from "./ExamTakingPage";

vi.mock("@/lib/exam-api", () => ({
  fetchExamSession: vi.fn(async () => ({
    sessionId: "11111111-1111-4111-8111-111111111111",
    status: "IN_PROGRESS",
    remainingSeconds: 600,
    items: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        domainCode: "A",
        stem: "Šta ostaje odvojeno od certifikata osobe?",
        itemType: "SINGLE_CHOICE",
        choices: [
          { choiceKey: "A", text: "Obuka" },
          { choiceKey: "B", text: "Odluka odbora" },
        ],
        selectedKeys: [],
      },
    ],
  })),
  startExamSession: vi.fn(),
  saveExamAnswers: vi.fn(),
  submitExamSession: vi.fn(),
}));

describe("ExamTakingPage", () => {
  it("exposes a keyboard-operable choice and no answer key", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/dashboard/exams/sessions/11111111-1111-4111-8111-111111111111"]}>
          <Routes>
            <Route path="/dashboard/exams/sessions/:sessionId" element={<ExamTakingPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const choice = await screen.findByRole("radio", { name: "Obuka" });
    expect(screen.getByRole("radiogroup", { name: "Šta ostaje odvojeno od certifikata osobe?" })).toBeTruthy();
    expect(document.body.textContent).not.toContain("isCorrect");
    choice.focus();
    expect(document.activeElement).toBe(choice);
    fireEvent.click(choice);
    expect((choice as HTMLInputElement).checked).toBe(true);
  });
});
