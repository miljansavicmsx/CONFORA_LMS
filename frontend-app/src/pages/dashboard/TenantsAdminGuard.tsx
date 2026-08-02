import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateTenantDirectoryAccess } from "@/lib/tenant-directory-access";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** ``admin`` ili ``sys_admin`` — pregled tenant / pilot health (ne cijela sys konzola). */
export function TenantsAdminGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();

  const allowed = useMemo(
    () => evaluateTenantDirectoryAccess({ roleFromProfile: user.role }),
    [user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
