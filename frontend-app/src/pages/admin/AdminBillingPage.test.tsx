import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminBillingPage from "@/pages/admin/AdminBillingPage";
import { useAuthStore } from "@/stores/authStore";

const fetchAnalyticsOverview = vi.fn();

vi.mock("@/lib/api-analytics", () => ({
  fetchAnalyticsOverview: (...args: unknown[]) => fetchAnalyticsOverview(...args),
}));

vi.mock("@/lib/api-billing", () => ({
  manualActivateTenant: vi.fn(),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AdminBillingPage />
    </QueryClientProvider>,
  );
}

describe("AdminBillingPage", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { email: "a@b.com", role: "sys_admin" },
      isAuthenticated: true,
    });
    fetchAnalyticsOverview.mockResolvedValue({
      kpis: { mrr: 0 },
      trends: [],
      pilotTenantUsage: [],
      certificateIssuanceTrend: [],
      onboardingFunnel: [],
    });
  });
  afterEach(() => {
    useAuthStore.getState().logout();
    vi.clearAllMocks();
    cleanup();
  });

  it("renders manual activation for sys_admin", async () => {
    renderPage();
    await waitFor(() => expect(fetchAnalyticsOverview).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: /Manual activate/i })).toBeTruthy();
  });

  it("hides manual controls for non-sys_admin", async () => {
    useAuthStore.setState({ user: { email: "x@y.com", role: "training_admin" }, isAuthenticated: true });
    renderPage();
    await waitFor(() => expect(fetchAnalyticsOverview).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: /Manual activate/i })).toBeNull();
    expect(screen.getByText(/samo sistemskom administratoru/i)).toBeTruthy();
  });
});
