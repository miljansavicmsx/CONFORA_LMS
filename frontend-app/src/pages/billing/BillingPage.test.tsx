import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SubscriptionItem } from "@/lib/api-billing";
import BillingPage from "@/pages/billing/BillingPage";

const fetchMySubscription = vi.fn();

vi.mock("@/lib/api-billing", () => ({
  fetchMySubscription: (...args: unknown[]) => fetchMySubscription(...args),
  changePlan: vi.fn(),
  cancelSubscription: vi.fn(),
  requestInvoice: vi.fn(),
  manualActivateTenant: vi.fn(),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <BillingPage />
    </QueryClientProvider>,
  );
}

const trialSub: SubscriptionItem = {
  id: "s1",
  tenantId: "t1",
  planId: "trial",
  status: "TRIAL",
  seats: 5,
  priceMonthly: 0,
  currency: "EUR",
  billingCycle: "MONTHLY",
  providerStatus: "live",
};

const activeSub: SubscriptionItem = {
  ...trialSub,
  planId: "professional",
  status: "ACTIVE",
  priceMonthly: 149,
  renewAt: "2026-06-01T00:00:00Z",
  validFrom: "2026-01-01T00:00:00Z",
  invoiceReference: "INV-1",
  providerStatus: "live",
};

describe("BillingPage", () => {
  beforeEach(() => {
    fetchMySubscription.mockResolvedValue(trialSub);
  });
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders inactive copy for trial", async () => {
    renderPage();
    await waitFor(() => expect(fetchMySubscription).toHaveBeenCalled());
    expect(await screen.findByText(/Pretplata nije aktivirana/i)).toBeTruthy();
  });

  it("renders config_blocker warning", async () => {
    fetchMySubscription.mockResolvedValue({ ...trialSub, providerStatus: "config_blocker", providerReason: "x" });
    renderPage();
    expect(await screen.findByText(/Stripe nije konfigurisan/u)).toBeTruthy();
  });

  it("renders active subscription details", async () => {
    fetchMySubscription.mockResolvedValue(activeSub);
    renderPage();
    expect(await screen.findByText(/Referenca računa/u)).toBeTruthy();
    expect(screen.getByText(/INV-1/)).toBeTruthy();
  });

  it("renders error and retry refetches", async () => {
    fetchMySubscription.mockRejectedValueOnce(new Error("Request failed with status code 500")).mockResolvedValueOnce(trialSub);
    renderPage();
    expect(await screen.findByRole("button", { name: /Pokušaj ponovo/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Pokušaj ponovo/i }));
    await waitFor(() => expect(fetchMySubscription).toHaveBeenCalledTimes(2));
  });
});
