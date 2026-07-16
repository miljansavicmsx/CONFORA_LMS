import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IsoGrievancesAdminPanel } from "@/components/grievances/IsoGrievancesAdminPanel";

const mockComplaints = vi.fn();
const mockAppeals = vi.fn();

vi.mock("@/lib/api-grievances", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/api-grievances")>();
  return {
    ...mod,
    fetchAdminComplaints: (...args: unknown[]) => mockComplaints(...args),
    fetchAdminAppeals: (...args: unknown[]) => mockAppeals(...args),
  };
});

function renderPanel() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <IsoGrievancesAdminPanel />
    </QueryClientProvider>,
  );
}

describe("IsoGrievancesAdminPanel", () => {
  beforeEach(() => {
    mockComplaints.mockResolvedValue([]);
    mockAppeals.mockResolvedValue([]);
  });
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("shows complaints and appeals empty copy", async () => {
    renderPanel();
    expect(await screen.findByText("Nema prigovora za prikaz.")).toBeTruthy();
    expect(await screen.findByText("Nema žalbi za prikaz.")).toBeTruthy();
  });

  it("retry refetches complaints query on error", async () => {
    mockComplaints.mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce([]);
    mockAppeals.mockResolvedValue([]);
    renderPanel();
    const buttons = await screen.findAllByRole("button", { name: /Pokušaj ponovo/i });
    const first = buttons[0];
    if (!first) {
      throw new Error("expected retry button");
    }
    fireEvent.click(first);
    await waitFor(() => expect(mockComplaints.mock.calls.length).toBeGreaterThanOrEqual(2));
  });

  it("shows CLOSED consistently when complaint status is RESOLVED", async () => {
    mockComplaints.mockResolvedValue([
      {
        complaintId: "c1",
        publicReference: "CMP-1",
        userId: "u",
        category: "complaint",
        subject: "S",
        description: "D",
        status: "RESOLVED",
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
      },
    ]);
    mockAppeals.mockResolvedValue([]);
    renderPanel();
    expect(await screen.findByText("CLOSED")).toBeTruthy();
  });
});
