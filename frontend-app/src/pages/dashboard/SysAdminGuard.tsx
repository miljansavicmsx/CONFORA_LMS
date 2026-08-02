import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateSysAdminAccess } from "@/lib/sys-admin-access";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/**
 * Samo korisnici s profilnom ulogom `sys_admin` (DynamoDB / `/auth/me`).
 */
export function SysAdminGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();

  const allowed = useMemo(
    () => evaluateSysAdminAccess({ roleFromProfile: user.role }),
    [user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
