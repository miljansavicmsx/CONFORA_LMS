import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { canReadStaffIdentityQueue } from "@/lib/staff-identity-review-access";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Manual ID review route — ID verifier (write) or Director read-only oversight (D-04). */
export function IdentityReviewGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const roles = useAuthStore((s) => s.roles);

  const allowed = useMemo(
    () =>
      canReadStaffIdentityQueue({
        roleFromProfile: user.role,
        jwtRoles: [...roles],
      }),
    [roles, user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
