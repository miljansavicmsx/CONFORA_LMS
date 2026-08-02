import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import BackupsPage from "@/pages/admin/BackupsPage";
import AdminJobsPage from "@/pages/admin/AdminJobsPage";
import SupportAdminPage from "@/pages/admin/SupportAdminPage";
import SystemHealthPage from "@/pages/admin/SystemHealthPage";
import { vi } from "vitest";

vi.mock("@/lib/api-system-health", () => ({
  fetchHealthReady: () => Promise.resolve({ status: "ready", checks: {} }),
  fetchMetricsText: () => Promise.resolve("# metrics"),
  fetchAlertHistory: () => Promise.resolve([]),
  fetchEmailStatus: () => Promise.resolve({ provider: "mock" }),
  exportSystemSnapshot: () => undefined,
  postTestAlert: () => Promise.resolve({}),
  postAlertMutePlaceholder: () => Promise.resolve({ status: "placeholder", detail: "x" }),
  fetchJobsStatus: () => Promise.resolve({ jobs: {}, worker: { provider: "memory", queueDepth: 0 } }),
  fetchJobRuns: () => Promise.resolve([]),
  fetchRecurringJobs: () => Promise.resolve([]),
  runJob: () => Promise.resolve({}),
  drainWorkerOnce: () => Promise.resolve({ ok: true }),
  tickRecurringJobs: () => Promise.resolve({ pushed: [] }),
  retryJobRun: () => Promise.resolve({}),
}));

describe("admin ops pages", () => {
  function wrap(ui: ReactNode) {
    const qc = new QueryClient();
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  it("renders system health page", () => {
    render(wrap(<SystemHealthPage />));
    expect(screen.getByText(/System health/i)).toBeTruthy();
  });

  it("renders admin jobs page", () => {
    render(wrap(<AdminJobsPage />));
    expect(screen.getByText(/Jobs & workers/i)).toBeTruthy();
  });

  it("renders backups page", () => {
    render(wrap(<BackupsPage />));
    expect(screen.getByText(/Backups & DR/i)).toBeTruthy();
  });

  it("renders support page", () => {
    render(wrap(<SupportAdminPage />));
    expect(screen.getByText(/Registar žalbi/i)).toBeTruthy();
  });
});

