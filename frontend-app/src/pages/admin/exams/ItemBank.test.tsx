import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ItemBank from "./ItemBank";

vi.mock("@/components/exams/QuestionDialog", () => ({
  QuestionDialog: () => null,
}));

const fetchPublishedCourses = vi.fn();
const fetchItemBank = vi.fn();

vi.mock("@/lib/catalog-api", () => ({
  fetchPublishedCourses: (...args: unknown[]) => fetchPublishedCourses(...args),
}));

vi.mock("@/lib/api-item-bank", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-item-bank")>("@/lib/api-item-bank");
  return {
    ...actual,
    fetchItemBank: (...args: unknown[]) => fetchItemBank(...args),
  };
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ItemBank />
    </QueryClientProvider>,
  );
}

const sampleCourse = {
  courseId: "course-test-1",
  slug: "course-test-1",
  title: "Test kurz",
  domain: null,
  hasFinalExam: true,
};

describe("ItemBank", () => {
  beforeEach(() => {
    fetchPublishedCourses.mockResolvedValue([sampleCourse]);
    fetchItemBank.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders empty state when there are no questions", async () => {
    renderPage();
    await waitFor(() => {
      expect(fetchItemBank).toHaveBeenCalled();
    });
    expect(await screen.findByText("Nema pitanja u item banku za ovaj kurs.")).toBeTruthy();
  });

  it("renders error state when the list request fails", async () => {
    fetchItemBank.mockRejectedValue(new Error("Request failed with status code 500"));
    renderPage();
    expect(await screen.findByText("Nije moguće učitati item bank.")).toBeTruthy();
    expect(screen.getByText(/Request failed with status code 500/)).toBeTruthy();
  });

  it("retry button refetches item bank", async () => {
    /** Deterministički više poziva (npr. refetch/useQuery lifecycle) bez oslanjanja na mock*Once lanac nad beforeEach stubom. */
    let itemBankAttempts = 0;
    fetchItemBank.mockImplementation(async () => {
      itemBankAttempts += 1;
      if (itemBankAttempts === 1) {
        throw new Error("fail");
      }
      return [];
    });
    renderPage();
    await screen.findByText("Nije moguće učitati item bank.");
    expect(await screen.findByText("fail")).toBeTruthy();
    const retry = await screen.findByRole("button", { name: "Pokušaj ponovo" });
    expect(retry).toBeTruthy();
    fireEvent.click(retry);
    await waitFor(() => {
      expect(fetchItemBank).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText("Nema pitanja u item banku za ovaj kurs.")).toBeTruthy();
  });
});
