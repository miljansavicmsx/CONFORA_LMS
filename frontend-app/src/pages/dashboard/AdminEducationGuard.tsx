import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateAdminEducationAccess } from "@/lib/admin-education-access";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Nest-aligned education authoring UI — STAFF_TRAINADM / sysadmin / director / committee readers. */
export function AdminEducationGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const roles = useAuthStore((s) => s.roles);

  const allowed = useMemo(
    () =>
      evaluateAdminEducationAccess({
        jwtRoles: [...roles],
        roleFromProfile: user.role,
      }),
    [roles, user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
