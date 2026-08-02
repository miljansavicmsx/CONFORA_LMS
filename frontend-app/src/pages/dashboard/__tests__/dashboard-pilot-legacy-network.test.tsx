/**
 * @vitest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import { DashboardLayoutRoute } from "@/pages/dashboard/DashboardLayoutRoute";
import ExamsList from "@/pages/learner/ExamsList";
import CertificationApplicationsPage from "@/pages/learner/CertificationApplicationsPage";
import { useAuthStore } from "@/stores/authStore";

const fetchMyAttempts = vi.fn();
const fetchMyCertificationApplications = vi.fn();
const fetchMeDashboard = vi.fn();
const fetchCertificationBodyInfo = vi.fn();
const fetchDashboardContext = vi.fn();
const getCurrentUser = vi.fn();
const getCurrentUserPermissions = vi.fn();

vi.mock("@/stores/authStore");

vi.mock("@/lib/api-exam-engine", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-exam-engine")>("@/lib/api-exam-engine");
  return { ...actual, fetchMyAttempts: () => fetchMyAttempts() };
});

vi.mock("@/lib/api-governance", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-governance")>("@/lib/api-governance");
  return { ...actual, fetchMyCertificationApplications: () => fetchMyCertificationApplications() };
});

vi.mock("@/lib/module1-dashboard-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/module1-dashboard-api")>("@/lib/module1-dashboard-api");
  return {
    ...actual,
    fetchMeDashboard: () => fetchMeDashboard(),
    fetchCertificationBodyInfo: () => fetchCertificationBodyInfo(),
  };
});

vi.mock("@/lib/dashboard-context-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dashboard-context-api")>(
    "@/lib/dashboard-context-api",
  );
  return { ...actual, fetchDashboardContext: () => fetchDashboardContext() };
});

vi.mock("@/lib/api/auth-client", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
  getCurrentUserPermissions: (...args: unknown[]) => getCurrentUserPermissions(...args),
}));

vi.mock("@/components/OffCanvasPanel", () => ({
  OffCanvasPanel: () => null,
}));

vi.mock("@/components/dashboard/module1/DashboardSupportChat", () => ({
  DashboardSupportChat: () => null,
}));

function mockAuthStore(): void {
  const state = {
    accessToken: "test-token",
    setUser: vi.fn(),
    logout: vi.fn(),
  };
  vi.mocked(useAuthStore).mockImplementation((selector) =>
    selector(state as unknown as ReturnType<typeof useAuthStore.getState>),
  );
  Object.assign(useAuthStore, {
    getState: () => state,
    persist: {
      hasHydrated: () => true,
      onFinishHydration: (cb: () => void) => {
        cb();
        return () => undefined;
      },
    },
  });
}

function renderPilotDashboard(initialEntry: string) {
  mockAuthStore();
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <TooltipProvider>
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/dashboard" element={<DashboardLayoutRoute />}>
              <Route index element={<DashboardHome />} />
              <Route path="exams" element={<ExamsList />} />
              <Route path="certification/applications" element={<CertificationApplicationsPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </TooltipProvider>,
  );
}

describe("Nest auth pilot legacy dashboard network (GNG-C07)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "true");
    vi.stubEnv("VITE_AUTH_PROVIDER", "nest");
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("1024"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    fetchMyAttempts.mockReset();
    fetchMyCertificationApplications.mockReset();
    fetchMeDashboard.mockReset();
    fetchCertificationBodyInfo.mockReset();
    fetchDashboardContext.mockReset();
    getCurrentUser.mockReset();
    getCurrentUserPermissions.mockReset();

    getCurrentUser.mockResolvedValue({
      kind: "ok",
      data: {
        userId: "user-1",
        email: "pilot@example.test",
        full_name: "Pilot User",
        role: "learner",
        roles: [],
        permissions: [],
        tenantId: "00000000-0000-4000-8000-000000000001",
        mfaVerified: false,
      },
    });
    getCurrentUserPermissions.mockResolvedValue({
      kind: "ok",
      data: {
        primaryRole: "learner",
        permissions: ["catalog.read"],
        blockedPermissions: [],
        tenantId: "00000000-0000-4000-8000-000000000001",
      },
    });
    fetchMeDashboard.mockResolvedValue({
      viewer: {
        userId: "user-1",
        firstName: "Pilot",
        lastName: "User",
        email: "pilot@example.test",
        accountStatus: "ACTIVE",
        roles: ["USR_CAND"],
        previewMode: false,
      },
      guards: { readOnlyHistory: false, courseActionsDisabled: false },
      catalog: { scopes: [], filters: { languages: [], levels: [] }, byScope: [] },
      progress: { inProgressCourses: [], nextExam: null, certificatesExpiringSoon: [] },
      notifications: [],
      hero: {
        subtitle: "You have 0 active courses out of 0 enrolled.",
        overallProgressPct: 0,
        continueCourseId: "",
      },
      stats: {
        activeCourses: 0,
        totalCourses: 0,
        weekLearningLabel: "0h 00m learning",
        certificatesCount: 0,
        lastCertificateLabel: "—",
        avgScorePct: 0,
        trendActive: "down",
        trendWeek: "down",
        trendCerts: "down",
        trendScore: "down",
      },
      activities: [],
    });
    fetchCertificationBodyInfo.mockResolvedValue({ sections: [] });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("does not call legacy my-attempts when blocked exams route is requested", async () => {
    renderPilotDashboard("/dashboard/exams");
    await waitFor(() => {
      expect(getCurrentUser).toHaveBeenCalled();
    });
    expect(fetchMyAttempts).not.toHaveBeenCalled();
  });

  it("does not call legacy my-applications when blocked certification route is requested", async () => {
    renderPilotDashboard("/dashboard/certification/applications");
    await waitFor(() => {
      expect(getCurrentUser).toHaveBeenCalled();
    });
    expect(fetchMyCertificationApplications).not.toHaveBeenCalled();
  });

  it("pilot dashboard home uses Module 1 Nest APIs only", async () => {
    mockAuthStore();
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={<Outlet context={{ user: { name: "Pilot User", role: "learner" } }} />}
            >
              <Route index element={<DashboardHome />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await waitFor(() => {
      expect(fetchMeDashboard).toHaveBeenCalled();
    });
    expect(fetchMyAttempts).not.toHaveBeenCalled();
    expect(fetchMyCertificationApplications).not.toHaveBeenCalled();
    expect(fetchDashboardContext).not.toHaveBeenCalled();
  });
});

describe("Legacy dashboard mode (pilot off)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is inactive when pilot flag is false", async () => {
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "false");
    vi.stubEnv("VITE_AUTH_PROVIDER", "legacy");
    const { isNestAuthPilotActive } = await import("@/lib/nest-auth-pilot");
    expect(isNestAuthPilotActive()).toBe(false);
  });
});
