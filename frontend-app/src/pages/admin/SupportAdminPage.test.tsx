import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SupportAdminPage from "@/pages/admin/SupportAdminPage";

vi.mock("@/components/grievances/IsoGrievancesAdminPanel", () => ({
  IsoGrievancesAdminPanel: () => <div data-testid="iso-grievances-stub" />,
}));

vi.mock("@/components/support/TicketResolutionDialog", () => ({
  TicketResolutionDialog: () => null,
}));

const fetchAllTickets = vi.fn();

vi.mock("@/lib/api-support-admin", () => ({
  fetchAllTickets: (...args: unknown[]) => fetchAllTickets(...args),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <SupportAdminPage />
    </QueryClientProvider>,
  );
}

describe("SupportAdminPage", () => {
  beforeEach(() => {
    fetchAllTickets.mockResolvedValue([]);
  });
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders empty state when there are no tickets", async () => {
    renderPage();
    await waitFor(() => expect(fetchAllTickets).toHaveBeenCalled());
    expect(await screen.findByText("Nema otvorenih predmeta.")).toBeTruthy();
  });

  it("renders controlled error and retry refetches", async () => {
    fetchAllTickets.mockRejectedValueOnce(new Error("Request failed with status code 500")).mockResolvedValueOnce([]);
    renderPage();
    expect(await screen.findByText("Nije moguće učitati tikete.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Pokušaj ponovo/i }));
    await waitFor(() => expect(fetchAllTickets).toHaveBeenCalledTimes(2));
  });
});
