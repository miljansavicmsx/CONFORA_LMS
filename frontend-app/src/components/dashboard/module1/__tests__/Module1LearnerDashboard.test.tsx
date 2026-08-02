/**
 * @vitest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Module1LearnerDashboard } from "@/components/dashboard/module1/Module1LearnerDashboard";
import type { MeDashboardResponse } from "@/lib/module1-dashboard-api";

const fetchMeDashboard = vi.fn();
const fetchCertificationBodyInfo = vi.fn();

vi.mock("@/lib/module1-dashboard-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/module1-dashboard-api")>("@/lib/module1-dashboard-api");
  return {
    ...actual,
    fetchMeDashboard: () => fetchMeDashboard(),
    fetchCertificationBodyInfo: () => fetchCertificationBodyInfo(),
  };
});

vi.mock("@/components/dashboard/module1/DashboardSupportChat", () => ({
  DashboardSupportChat: () => null,
}));

const COURSE_ID = "d1000000-0000-4000-8000-000000000001";

function buildMeDashboardFixture(overrides: Partial<MeDashboardResponse> = {}): MeDashboardResponse {
  return {
    viewer: {
      userId: "b2000000-0000-4000-8000-000000000001",
      firstName: "Pilot",
      lastName: "Learner",
      email: "pilot.learner@confora.test",
      accountStatus: "ACTIVE",
      roles: ["USR_CAND"],
      previewMode: false,
    },
    guards: {
      courseActionsDisabled: false,
      readOnlyHistory: false,
    },
    catalog: {
      scopes: [{ id: "c1000000-0000-4000-8000-000000000001", name: "Scope A" }],
      filters: { languages: ["en"], levels: ["Professional"] },
      byScope: [
        {
          scopeId: "c1000000-0000-4000-8000-000000000001",
          scopeName: "Scope A",
          courses: [
            {
              id: COURSE_ID,
              title: "Course Alpha",
              scopeId: "c1000000-0000-4000-8000-000000000001",
              scopeName: "Scope A",
              coverImage: null,
              languages: ["en"],
              level: "Professional",
              durationMin: 60,
              price: { amount: "49.00", currency: "EUR" },
            },
          ],
        },
      ],
    },
    progress: {
      inProgressCourses: [
        {
          enrollmentId: "e1000000-0000-4000-8000-000000000001",
          courseId: COURSE_ID,
          title: "Course Alpha",
          scopeName: "Scope A",
          progressPct: 55,
          status: "ENROLLED",
        },
      ],
      nextExam: null,
      certificatesExpiringSoon: [],
    },
    notifications: [],
    hero: {
      subtitle: "You have 1 active courses out of 2 enrolled. Last activity: 1 min ago.",
      overallProgressPct: 55,
      continueCourseId: COURSE_ID,
    },
    stats: {
      activeCourses: 1,
      totalCourses: 2,
      weekLearningLabel: "2h 05m learning",
      certificatesCount: 1,
      lastCertificateLabel: "ISO 9001 Lead Auditor",
      avgScorePct: 80,
      trendActive: "up",
      trendWeek: "up",
      trendCerts: "up",
      trendScore: "up",
    },
    activities: [
      {
        id: "enroll-1",
        kind: "enroll",
        title: "Enrolled in course: Course Alpha",
        courseTag: "Course Alpha",
        timeLabel: "1 min ago",
        occurredAt: "2026-05-20T10:00:00.000Z",
        detail: null,
      },
    ],
    ...overrides,
  };
}

function renderDashboard() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <TooltipProvider>
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <Module1LearnerDashboard fallback={<p>Fallback</p>} />
        </MemoryRouter>
      </QueryClientProvider>
    </TooltipProvider>,
  );
}

describe("Module1LearnerDashboard (P1-A-03)", () => {
  beforeEach(() => {
    fetchMeDashboard.mockReset();
    fetchCertificationBodyInfo.mockReset();
    fetchMeDashboard.mockResolvedValue(buildMeDashboardFixture());
    fetchCertificationBodyInfo.mockResolvedValue({ sections: [], generatedAt: "2026-05-20T00:00:00.000Z" });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders hero summary and continue learning link", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/You have 1 active courses out of 2 enrolled/i)).toBeTruthy();
    });
    const continueLink = screen.getByRole("link", { name: /Nastavi učenje/i });
    expect(continueLink.getAttribute("href")).toContain(COURSE_ID);
    expect(screen.getByRole("img", { name: /Ukupni napredak 55 posto/i })).toBeTruthy();
  });

  it("renders learner KPI stats from v1.1.0 payload", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Pokazatelji učenja/i })).toBeTruthy();
    });
    expect(screen.getByText("Upisani programi")).toBeTruthy();
    expect(screen.getByText("1/2")).toBeTruthy();
    expect(screen.getAllByText("2h 05m learning").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("80%")).toBeTruthy();
    expect(screen.getAllByText("ISO 9001 Lead Auditor").length).toBeGreaterThanOrEqual(1);
  });

  it("renders recent activities", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Enrolled in course: Course Alpha")).toBeTruthy();
    });
    expect(screen.getByRole("heading", { name: /Nedavna aktivnost/i })).toBeTruthy();
  });

  it("preserves v1.0.0 catalog and progress sections", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Katalog tečajeva/i })).toBeTruthy();
    });
    expect(screen.getByRole("heading", { name: /Napredak i ispiti/i })).toBeTruthy();
    expect(screen.getAllByText("Course Alpha").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { name: /Obavijesti/i })).toBeTruthy();
  });

  it("shows fallback when dashboard fetch fails", async () => {
    fetchMeDashboard.mockRejectedValue(new Error("network"));
    renderDashboard();
    await waitFor(
      () => {
        expect(screen.getByText("Fallback")).toBeTruthy();
      },
      { timeout: 8000 },
    );
  });
});
