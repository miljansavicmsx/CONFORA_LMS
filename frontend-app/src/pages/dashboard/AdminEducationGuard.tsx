import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateAdminEducationAccess } from "@/lib/admin-education-access";
import { extractRealmRolesFromToken } from "@/lib/jwt-payload";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Nest-aligned education authoring UI — STAFF_TRAINADM / sysadmin / director / committee readers. */
export function AdminEducationGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const accessToken = useAuthStore((s) => s.accessToken);

  const allowed = useMemo(
    () =>
      evaluateAdminEducationAccess({
        jwtRoles: extractRealmRolesFromToken(accessToken),
        roleFromProfile: user.role,
      }),
    [accessToken, user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
