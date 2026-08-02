import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateAuditLogViewerAccess } from "@/lib/audit-log-viewer-access";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** sys_admin ili director (usklađeno s `/api/admin/audit/logs`). */
export function AuditLogViewerGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();

  const allowed = useMemo(
    () => evaluateAuditLogViewerAccess({ roleFromProfile: user.role }),
    [user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
