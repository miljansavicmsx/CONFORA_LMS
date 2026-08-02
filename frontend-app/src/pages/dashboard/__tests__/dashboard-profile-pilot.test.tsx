import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import DashboardProfilePage from "../DashboardProfilePage";
import { fetchMyRegistryProfile } from "@/lib/api-user-registry";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/lib/api-user-registry", () => ({
  fetchMyRegistryProfile: vi.fn(),
  patchMyRegistryProfile: vi.fn(),
}));

const fetchMyRegistryProfileMock = vi.mocked(fetchMyRegistryProfile);

function renderProfile(user = { name: "Pilot", email: "pilot@test.com", role: "learner" }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/dashboard/profil"]}>
        <Routes>
          <Route path="/dashboard/profil" element={<Outlet context={{ user, effectivePermissions: null }} />}>
            <Route index element={<DashboardProfilePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("DashboardProfilePage pilot mode", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "true");
    vi.stubEnv("VITE_AUTH_PROVIDER", "nest");
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hides registry-profile edit form during pilot", () => {
    renderProfile();
    expect(screen.queryByLabelText(/Telefon/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /Spremi proširene podatke/i })).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("nest_auth_pilot_registry_unavailable");
  });

  it("shows registry section heading when pilot inactive", async () => {
    vi.stubEnv("VITE_NEST_AUTH_PILOT_ENABLED", "false");
    vi.stubEnv("VITE_AUTH_PROVIDER", "legacy");
    fetchMyRegistryProfileMock.mockResolvedValue({
      phone: "",
      nationalId: "",
      jobTitle: "",
      educationLevel: "",
      identityVerificationStatus: "PENDING",
    } as never);
    renderProfile({ name: "Legacy", email: "legacy@test.com", role: "learner" });
    expect(await screen.findByText(/Prošireni podaci/i)).toBeTruthy();
  });
});
