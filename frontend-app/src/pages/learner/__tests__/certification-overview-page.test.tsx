/**
 * @vitest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  cleanup();
});

import * as api from "@/lib/api-certification-entry";
import CertificationOverviewPage, {
  CERTIFICATION_TIMELINE_STEPS_HR,
  CertificationProcessTimeline,
  maySubmitCertificationApplication,
} from "@/pages/learner/CertificationOverviewPage";
import { useAuthStore } from "@/stores/authStore";

vi.mock("@/stores/authStore");

function renderWithProviders(ui: ReactElement): ReturnType<typeof render> {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CertificationProcessTimeline", () => {
  it("prikazuje sedam koraka procesa", () => {
    expect(CERTIFICATION_TIMELINE_STEPS_HR).toHaveLength(7);
    render(
      <MemoryRouter>
        <CertificationProcessTimeline />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Završena obuka/i)).toBeTruthy();
    expect(screen.getByText(/Javna verifikacija/i)).toBeTruthy();
  });
});

describe("maySubmitCertificationApplication", () => {
  it("odbija prijavu bez položenog ispita", () => {
    expect(
      maySubmitCertificationApplication({
        courseId: "c1",
        courseTitle: "T",
        eligible: true,
        leadsToCertification: true,
        hasPassedExam: false,
        hasExamPassCertificate: true,
        blockingReasons: [],
        existingApplication: null,
        entryHref: "/x",
      }),
    ).toBe(false);
  });

  it("dopušta prijavu kad su ispunjeni preduvjeti i nema blokirajuće prijave", () => {
    expect(
      maySubmitCertificationApplication({
        courseId: "c1",
        courseTitle: "T",
        eligible: true,
        leadsToCertification: true,
        hasPassedExam: true,
        hasExamPassCertificate: true,
        blockingReasons: [],
        existingApplication: null,
        entryHref: "/x",
      }),
    ).toBe(true);
  });
});

describe("CertificationOverviewPage", () => {
  beforeEach(() => {
    vi.mocked(useAuthStore).mockReset();
    vi.clearAllMocks();
  });

  it("kandidat bez položenog ispita ne vidi CTA Podnesi prijavu", async () => {
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({
        user: { email: "a@ex.com", role: "learner" },
        cognitoGroups: [],
      } as never),
    );
    vi.spyOn(api, "fetchCandidateCertificationPathways").mockResolvedValue([
      {
        courseId: "c-no",
        courseTitle: "Program",
        eligible: false,
        leadsToCertification: true,
        hasPassedExam: false,
        hasExamPassCertificate: false,
        blockingReasons: ["Nema evidencije o položenom ispitu"],
        existingApplication: null,
        entryHref: "/dashboard/certification/entry/c-no",
      },
    ]);

    renderWithProviders(<CertificationOverviewPage />);

    expect(await screen.findByText(/Tvoji statusi programa/i)).toBeTruthy();
    expect(screen.queryByRole("link", { name: /^Podnesi prijavu$/i })).toBeNull();
  });

  it("kandidat sa ispunjenim preduvjetima vidi CTA Podnesi prijavu", async () => {
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({
        user: { email: "b@ex.com", role: "learner" },
        cognitoGroups: [],
      } as never),
    );
    vi.spyOn(api, "fetchCandidateCertificationPathways").mockResolvedValue([
      {
        courseId: "c-ok",
        courseTitle: "Lead program",
        eligible: true,
        leadsToCertification: true,
        hasPassedExam: true,
        hasExamPassCertificate: true,
        blockingReasons: [],
        existingApplication: null,
        entryHref: "/dashboard/certification/entry/c-ok",
      },
    ]);

    renderWithProviders(<CertificationOverviewPage />);

    const link = await screen.findByRole("link", { name: /^Podnesi prijavu$/i });
    expect(link.getAttribute("href")).toBe("/dashboard/certification/entry/c-ok");
  });

  it("cert_committee vidi red odbora, ne i kandidatske statuse programa", async () => {
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({
        user: { email: "m@ex.com", role: "cert_committee" },
        cognitoGroups: [],
      } as never),
    );

    renderWithProviders(<CertificationOverviewPage />);

    expect(await screen.findByRole("link", { name: /Red odbora za odluke/i })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /Tvoji statusi programa/i })).toBeNull();
  });
});
