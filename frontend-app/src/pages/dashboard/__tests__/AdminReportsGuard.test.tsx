/**
 * EXPERIMENTAL KEEP14 corrections — disposable FIX_PROBE only.
 */
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Outlet, Route, Routes } from "react-router";
import { cleanup, render, screen } from "@testing-library/react";
import type { JSX } from "react";

import { AdminReportsGuard } from "@/pages/dashboard/AdminReportsGuard";
import type { DashboardOutletContext } from "@/pages/dashboard/dashboard-outlet-context";

function OutletShim({ context }: { readonly context: DashboardOutletContext }): JSX.Element {
  return <Outlet context={context} />;
}

function renderWithOutlet(role: string): void {
  const ctx: DashboardOutletContext = { user: { role } };
  render(
    <MemoryRouter initialEntries={["/dashboard/admin/reports"]}>
      <Routes>
        <Route path="/" element={<OutletShim context={ctx} />}>
          <Route
            path="dashboard/admin/reports"
            element={
              <AdminReportsGuard>
                <div data-testid="reports-allowed">allowed</div>
              </AdminReportsGuard>
            }
          />
        </Route>
        <Route path="/unauthorized" element={<div data-testid="reports-denied">denied</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminReportsGuard (T026)", () => {
  afterEach(() => {
    cleanup();
  });

  it.each(["STAFF_DIR", "STAFF_SYSADM", "STAFF_AUD", "QUALITY_MANAGER", "director", "sys_admin"] as const)(
    "allows %s",
    (role) => {
      renderWithOutlet(role);
      expect(screen.getByTestId("reports-allowed")).toBeTruthy();
    },
  );

  it.each([
    "USR_CAND",
    "USR_CERT",
    "COM_CERT",
    "ISSUANCE_OFFICER",
    "LIFECYCLE_OFFICER",
    "TRAINADM",
    "admin",
    "learner",
  ] as const)("denies %s", (role) => {
    renderWithOutlet(role);
    expect(screen.getByTestId("reports-denied")).toBeTruthy();
  });
});
