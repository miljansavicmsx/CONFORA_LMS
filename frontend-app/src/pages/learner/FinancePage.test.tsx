import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as billingApi from "@/lib/api-billing";
import * as financeApi from "@/lib/finance-api";
import FinancePage from "@/pages/learner/FinancePage";

vi.mock("@/lib/finance-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/finance-api")>("@/lib/finance-api");
  return {
    ...actual,
    fetchFinanceSummary: vi.fn(),
    fetchFinanceLedger: vi.fn(),
    fetchAdminFinanceRevenueByCourse: vi.fn(),
    fetchAdminFinanceRevenueByPeriod: vi.fn(),
    fetchAdminFinanceInvoiceOverview: vi.fn(),
    fetchAdminFinanceOutstanding: vi.fn(),
    openInvoicePdfInNewTab: vi.fn(),
  };
});

vi.mock("@/lib/api-billing", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-billing")>("@/lib/api-billing");
  return { ...actual, fetchMySubscription: vi.fn() };
});

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <FinancePage />
    </QueryClientProvider>,
  );
}

const emptySummary = {
  currency: "EUR",
  totalPaidMinor: 0,
  totalRefundedMinor: 0,
  pendingMinor: 0,
  amfDueDate: null,
  amfPaid: null,
  amfStatusLabel: "Nije postavljeno",
  membershipStatus: null,
} as const;

describe("FinancePage", () => {
  beforeEach(() => {
    vi.mocked(financeApi.fetchFinanceSummary).mockResolvedValue({ ...emptySummary });
    vi.mocked(financeApi.fetchFinanceLedger).mockResolvedValue([]);
    vi.mocked(financeApi.fetchAdminFinanceRevenueByCourse).mockResolvedValue([]);
    vi.mocked(financeApi.fetchAdminFinanceRevenueByPeriod).mockResolvedValue([]);
    vi.mocked(financeApi.fetchAdminFinanceInvoiceOverview).mockResolvedValue({
      paidWithPdf: 0,
      paidWithoutPdf: 0,
      refunds: 0,
    });
    vi.mocked(financeApi.fetchAdminFinanceOutstanding).mockResolvedValue({
      ledgerRowsScanned: 0,
      totalPaymentsMinor: 0,
      totalRefundsMinor: 0,
      currency: "EUR",
      outstandingEstimateMinor: 0,
    });
    vi.mocked(billingApi.fetchMySubscription).mockResolvedValue({
      id: "s",
      tenantId: "t",
      planId: "trial",
      status: "TRIAL",
      seats: 1,
      priceMonthly: 0,
      currency: "EUR",
      billingCycle: "MONTHLY",
      providerStatus: "live",
    });
  });
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders no records empty ledger copy", async () => {
    renderPage();
    await waitFor(() => expect(financeApi.fetchFinanceLedger).toHaveBeenCalled());
    expect(await screen.findByText("Još nema finansijskih zapisa.")).toBeTruthy();
  });

  it("shows config blocker when subscription provider blocked", async () => {
    vi.mocked(billingApi.fetchMySubscription).mockResolvedValue({
      id: "s",
      tenantId: "t",
      planId: "trial",
      status: "TRIAL",
      seats: 1,
      priceMonthly: 0,
      currency: "EUR",
      billingCycle: "MONTHLY",
      providerStatus: "config_blocker",
      providerReason: "Nedostaje ključ.",
    });
    renderPage();
    expect(await screen.findByText(/Stripe nije konfigurisan/u)).toBeTruthy();
  });
});
