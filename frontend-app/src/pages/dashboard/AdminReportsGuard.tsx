import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateAdminReportsAccess } from "@/lib/admin-reports-access";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/**
 * T026 Admin Reports guard — exact P08 four-role authority.
 * Existing route `/dashboard/admin/reports` remains wired in App.tsx (no App.tsx delta).
 */
export function AdminReportsGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();

  const allowed = useMemo(
    () => evaluateAdminReportsAccess({ roleFromProfile: user.role }),
    [user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
