import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateAppealsCommitteeAccess } from "@/lib/appeals-committee-access";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Žalbe / support — appeals_committee, admin ili sys_admin (ISO §11). */
export function AppealsCommitteeGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();

  const allowed = useMemo(
    () => evaluateAppealsCommitteeAccess({ roleFromProfile: user.role }),
    [user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
