import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConforaI18n } from "@confora/i18n";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CertificationDashboard from "@/pages/admin/CertificationDashboard";

const fetchStaffCertificationApplications = vi.fn();
const fetchStaffCertificationApplicationDetail = vi.fn();
const fetchApplicationAssignment = vi.fn();
const fetchApplicationReviewStatus = vi.fn();

vi.mock("@/lib/api-governance", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-governance")>();
  return {
    ...actual,
    fetchStaffCertificationApplications: () => fetchStaffCertificationApplications(),
    fetchStaffCertificationApplicationDetail: (id: string) =>
      fetchStaffCertificationApplicationDetail(id),
    submitDecision: vi.fn(),
  };
});

vi.mock("@/lib/api-staff-cert-assignment", () => ({
  fetchApplicationAssignment: (id: string) => fetchApplicationAssignment(id),
}));

vi.mock("@/lib/api-staff-cert-begin-review", () => ({
  fetchApplicationReviewStatus: (id: string) => fetchApplicationReviewStatus(id),
}));

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useOutletContext: () => ({
      user: { name: "Director", email: "dir@test", role: "director" },
      effectivePermissions: null,
    }),
  };
});

vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (s: { accessToken: string | null; user: { userId: string } | null }) => unknown) =>
    selector({
      accessToken: "mock-token",
      user: { userId: "b5100000-0000-4000-8000-000000000099" },
    }),
}));

vi.mock("@/lib/jwt-payload", () => ({
  extractRealmRolesFromToken: () => ["STAFF_DIR"],
}));

const STAFF_LIST_ITEM = {
  applicationId: "a5100001-0000-4000-8000-000000000001",
  userId: "",
  candidateReference: "cand-b5100000",
  courseId: "c5100001-0000-4000-8000-000000000001",
  schemeTitle: "Certified Widget Professional",
  status: "SUBMITTED" as const,
  workExperience: "Scope preview",
  updatedAt: "2026-03-01T10:00:00.000Z",
};

const STAFF_DETAIL_ITEM = {
  ...STAFF_LIST_ITEM,
  workExperience: "Ten years in widgets",
  desiredScopeText: "Widget scope",
  accommodationRequested: true,
  educationSummary: "Biografija dostavljena · Diploma dostavljena",
};

describe("CertificationDashboard staff queue (P1-B5-1b)", () => {
  const i18n = createConforaI18n({ lng: "en", fallbackLng: "en" });

  beforeEach(() => {
    fetchStaffCertificationApplications.mockReset();
    fetchStaffCertificationApplicationDetail.mockReset();
    fetchApplicationAssignment.mockReset();
    fetchApplicationReviewStatus.mockReset();
    fetchApplicationAssignment.mockResolvedValue({
      contractVersion: "1.0.0",
      applicationId: "a5100001-0000-4000-8000-000000000001",
      applicationStatus: "SUBMITTED",
      current: null,
      history: [],
    });
    fetchApplicationReviewStatus.mockResolvedValue({
      contractVersion: "1.0.0",
      applicationId: "a5100001-0000-4000-8000-000000000001",
      applicationStatus: "SUBMITTED",
      reviewState: "NOT_STARTED",
      assignmentStatus: null,
      assigneeReference: null,
      reviewStartedAt: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  function wrap(ui: ReactNode) {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return (
      <QueryClientProvider client={qc}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>{ui}</MemoryRouter>
        </I18nextProvider>
      </QueryClientProvider>
    );
  }

  it("renders loading state while queue fetch is pending", () => {
    fetchStaffCertificationApplications.mockReturnValue(new Promise(() => undefined));

    render(wrap(<CertificationDashboard />));

    expect(screen.getByText(/Učitavanje prijava/i)).toBeTruthy();
  });

  it("renders empty queue state", async () => {
    fetchStaffCertificationApplications.mockResolvedValue([]);

    render(wrap(<CertificationDashboard />));

    expect(await screen.findByText(/Red prijava je prazan/i)).toBeTruthy();
  });

  it("renders queue cards with candidateReference instead of raw userId", async () => {
    fetchStaffCertificationApplications.mockResolvedValue([STAFF_LIST_ITEM]);

    render(wrap(<CertificationDashboard />));

    expect(await screen.findByText(/Certified Widget Professional/i)).toBeTruthy();
    expect(screen.getByText(/Kandidat: cand-b5100000/i)).toBeTruthy();
    expect(screen.queryByText(/Korisnik:/i)).toBeNull();
  });

  it("loads staff detail on card open and shows accommodation indicator", async () => {
    fetchStaffCertificationApplications.mockResolvedValue([STAFF_LIST_ITEM]);
    fetchStaffCertificationApplicationDetail.mockResolvedValue(STAFF_DETAIL_ITEM);

    render(wrap(<CertificationDashboard />));

    const card = await screen.findByText(/Certified Widget Professional/i);
    fireEvent.click(card.closest("button")!);

    expect(await screen.findByText(/Ten years in widgets/i)).toBeTruthy();
    expect(
      await screen.findByText(/Prilagođavanje ispitivanja zatraženo/i),
    ).toBeTruthy();
    expect(fetchStaffCertificationApplicationDetail).toHaveBeenCalledWith(
      "a5100001-0000-4000-8000-000000000001",
    );
  });

  it("loads assignment panel for STAFF_DIR and shows assign action", async () => {
    fetchStaffCertificationApplications.mockResolvedValue([STAFF_LIST_ITEM]);
    fetchStaffCertificationApplicationDetail.mockResolvedValue(STAFF_DETAIL_ITEM);

    render(wrap(<CertificationDashboard />));

    const card = await screen.findByText(/Certified Widget Professional/i);
    fireEvent.click(card.closest("button")!);

    expect(await screen.findByText(/Reviewer assignment|Dodjela recenzenta/i)).toBeTruthy();
    expect(await screen.findByRole("button", { name: /Assign reviewer|Dodijeli recenzenta/i })).toBeTruthy();
    expect(fetchApplicationAssignment).toHaveBeenCalledWith(
      "a5100001-0000-4000-8000-000000000001",
    );
  });

  it("loads begin-review panel for STAFF_DIR and fetches review status", async () => {
    fetchStaffCertificationApplications.mockResolvedValue([STAFF_LIST_ITEM]);
    fetchStaffCertificationApplicationDetail.mockResolvedValue(STAFF_DETAIL_ITEM);

    render(wrap(<CertificationDashboard />));

    const card = await screen.findByText(/Certified Widget Professional/i);
    fireEvent.click(card.closest("button")!);

    expect(await screen.findByText(/Application review|Recenzija prijave/i)).toBeTruthy();
    expect(fetchApplicationReviewStatus).toHaveBeenCalledWith(
      "a5100001-0000-4000-8000-000000000001",
    );
  });

  it("shows detail error state when staff detail fetch fails", async () => {
    fetchStaffCertificationApplications.mockResolvedValue([STAFF_LIST_ITEM]);
    fetchStaffCertificationApplicationDetail.mockRejectedValue(new Error("not found"));

    render(wrap(<CertificationDashboard />));

    const card = await screen.findByText(/Certified Widget Professional/i);
    fireEvent.click(card.closest("button")!);

    expect(await screen.findByText(/Detalj prijave nije dostupan/i)).toBeTruthy();
  });
});
