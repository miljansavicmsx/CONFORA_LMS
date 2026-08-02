import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import type { DashboardContextPayload } from "@/lib/dashboard-context-api";
import DashboardHome from "@/pages/dashboard/DashboardHome";

const fetchMock = vi.fn<() => Promise<DashboardContextPayload>>();

vi.mock("@/lib/dashboard-context-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dashboard-context-api")>(
                                    "@/lib/dashboard-context-api");
  return {
    ...actual,
    fetchDashboardContext: () => fetchMock(),
  };
});

vi.mock("@/lib/api", () => ({
  api: {
    get: () => Promise.resolve({ data: [] }),
  },
}));

function renderDashboard(ui: ReactNode, user: { name: string; role: string } = { name: "Test User", role: "learner" }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <TooltipProvider>
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard" element={<Outlet context={{ user }} />}>
              <Route index element={ui} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </TooltipProvider>,
  );
}

const learnerContext = (role = "learner"): DashboardContextPayload => ({
  persona: "candidate",
  role,
  isoRole: "unknown",
  isoRoleLabel: "Nepoznato",
  candidate: {
    learner: {
      heroSubtitle: "Test",
      overallProgressPct: 40,
      continueCourseId: "c1",
      stats: {
        activeCourses: 1,
        totalCourses: 2,
        weekLearningLabel: "1h 00m učenja",
        certificatesCount: 3,
        lastCertificateLabel: "A",
        lastExamResultLabel: "Položio (82%)",
        avgScorePct: 80,
        trendActive: "up",
        trendWeek: "up",
        trendCerts: "up",
        trendScore: "up",
      },
      activities: [],
    },
    platformInfo: "PI",
    reminders: [],
    examStatus: { passedCourses: 1, failedOrIncomplete: 0, lastExamLabel: "PASSED (80%)" },
    certificateKinds: {
      examPassIssued: 1,
      examPassActive: 1,
      certificationIssued: 0,
      certificationActive: 0,
    },
    certificationPipeline: {
      applicationStatus: "DRAFT",
      applicationId: null,
      decisionStatus: "",
      decisionId: null,
    },
    notifications: [],
    nextAction: { label: "Dalje", href: "/dashboard/courses", reason: "r" },
  },
});

const trainingAdminContext: DashboardContextPayload = {
  persona: "training_admin",
  role: "admin",
  isoRole: "certification_manager",
  isoRoleLabel: "Voditelj certifikacije",
  trainingAdmin: {
    coursesTotal: 5,
    coursesPublished: 3,
    pendingPublishDrafts: 2,
    coursesPendingContent: 2,
    coursesPendingValidation: 1,
    activeLearners: 10,
    enrollmentsCompleted: 4,
    enrollmentsActive: 6,
    learnersReadyForExam: 2,
    pendingSupportTickets: 1,
    revenuePaidTotalEur: 1200.5,
    unpaidInvoices: 1,
  },
};

describe("DashboardHome", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders error and recovery UI when dashboard API fails", async () => {
    fetchMock.mockRejectedValueOnce(new Error("api down"));
    renderDashboard(<DashboardHome />);

    expect(await screen.findByText(/Došlo je do .*greške/i)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /Pokušaj ponovo/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Ne možemo učitati sve brojke/i)).toBeTruthy();
  });

  it("renders learner metrics from context", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(learnerContext()));
    renderDashboard(<DashboardHome />);

    expect(await screen.findByText(/Broj dokumenata/i)).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText(/Položio \(82%\)/i)).toBeTruthy();
  });

  it("renders training admin revenue and course counts", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(trainingAdminContext));
    renderDashboard(<DashboardHome />, { name: "Admin", role: "admin" });

    expect(await screen.findByText(/Learning operations center/i)).toBeTruthy();
    expect(await screen.findByText(/1200\.50 €/, {}, { timeout: 15000 })).toBeTruthy();
    expect(await screen.findByText(/Financije/i, {}, { timeout: 15000 })).toBeTruthy();
  });

  it("renders ISO role label from dashboard context", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(trainingAdminContext));
    renderDashboard(<DashboardHome />, { name: "Admin", role: "admin" });

    expect(await screen.findByText(/Uloga \(ISO\/IEC 17024\):/)).toBeTruthy();
    expect(screen.getByText("Voditelj certifikacije")).toBeTruthy();
  });

  it("surfaces LMS learning path timeline for learner", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(learnerContext()));
    renderDashboard(<DashboardHome />);

    expect(await screen.findByText(/Put kroz obuku/i)).toBeTruthy();
    expect(screen.getByRole("navigation", { name: /Redoslijed poglavlja učenja/i })).toBeTruthy();
  });

  it("exposes floating AI tutor entry for learner", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(learnerContext()));
    renderDashboard(<DashboardHome />);

    const link = await screen.findByRole("link", { name: /Pitaj AI asistenta za učenje/i });
    expect(link.getAttribute("href")).toBe("/dashboard/ai-tutor");
  });

  it("renders sys admin cockpit with technical observability eyebrow", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        persona: "sys_admin",
        role: "sys_admin",
        isoRole: "unknown",
        isoRoleLabel: "Nepoznato",
        sysAdmin: {
          usersSampled: 10,
          tenantsActive: 2,
          roleDistribution: { learner: 5 },
          auditEventsRecent: 3,
          auditSensitiveFlags: 0,
          verificationHits24h: 12,
          jobStatusLabel: "OK",
          integrationStatusLabel: "Redis OK · SMTP OK",
          apiStatus: "ok",
        },
      }),
    );
    renderDashboard(<DashboardHome />, { name: "Sys", role: "sys_admin" });

    expect(await screen.findByText(/Operations observability/i)).toBeTruthy();
    expect(screen.getByText(/Platform operativni centar/i)).toBeTruthy();
  });

  it("shows ISO unknown label for learner dashboard header", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(learnerContext()));
    renderDashboard(<DashboardHome />);

    await screen.findByText(/Broj dokumenata/i);
    expect(screen.getByText("Nepoznato")).toBeTruthy();
  });

  it("does not leak training admin payload for learner persona (role isolation)", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(learnerContext("learner")));
    renderDashboard(<DashboardHome />);

    expect(await screen.findByText(/Polaznik/i)).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: /Learning operations center/i }),
    ).toBeNull();
    expect(screen.queryByText(/Naplata \(plaćeno\)/i)).toBeNull();
  });

  it("renders ISO governance panel for auditor persona", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        persona: "iso_governance",
        role: "auditor",
        isoRole: "internal_auditor",
        isoRoleLabel: "Interni auditor",
        isoGovernance: {
          activeCertificates: 2,
          openAppeals: 1,
          openComplaints: 0,
          openGovernanceCases: 3,
          note: "n",
        },
      }),
    );
    renderDashboard(<DashboardHome />, { name: "Auditor", role: "auditor" });

    expect(await screen.findByText(/Audit & compliance intelligence/i)).toBeTruthy();
    expect(screen.getAllByText(/Predmeti nadzora/i).length).toBeGreaterThanOrEqual(1);
    await waitFor(
      () => {
        expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 3000 },
    );
  });

  it("renders quality_manager iso governance workspace (not unknown persona)", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        persona: "iso_governance",
        role: "quality_manager",
        isoRole: "quality_manager",
        isoRoleLabel: "Menadžer kvalitete",
        isoGovernance: {
          activeCertificates: 0,
          openAppeals: 0,
          openComplaints: 0,
          openGovernanceCases: 0,
          note: "n",
        },
      }),
    );
    renderDashboard(<DashboardHome />, { name: "QM", role: "quality_manager" });

    expect(await screen.findByText(/Quality management cockpit/i)).toBeTruthy();
    expect(screen.getByText(/Menadžment kvalitete: CAPA/i)).toBeTruthy();
    expect(screen.getByText("Menadžer kvalitete")).toBeTruthy();
    expect(screen.queryByText(/Vaša uloga nije prepoznata/i)).toBeNull();
  });

  it("renders empty-role hint when payload missing", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        persona: "training_admin",
        role: "admin",
        isoRole: "certification_manager",
        isoRoleLabel: "Voditelj certifikacije",
        trainingAdmin: null,
      }),
    );
    renderDashboard(<DashboardHome />, { name: "Admin", role: "admin" });

    expect(await screen.findByText(/Sažetak za ovu ulogu trenutno je prazan/i)).toBeTruthy();
  });
});
