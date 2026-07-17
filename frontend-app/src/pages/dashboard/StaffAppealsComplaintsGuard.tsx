import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateStaffAppealsComplaintsAccess } from "@/lib/staff-appeals-complaints-access";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Staff appeals/complaints resolution — not available to learners. */
export function StaffAppealsComplaintsGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();

  const allowed = useMemo(
    () => evaluateStaffAppealsComplaintsAccess({ roleFromProfile: user.role }),
    [user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
