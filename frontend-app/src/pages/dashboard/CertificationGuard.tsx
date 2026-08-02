import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateCertificationDashboardAccess } from "@/lib/certification-committee-access";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Odluke certifikacije — cert odbor, editori, sys_admin (NE tech_committee). */
export function CertificationGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const cognitoGroups = useAuthStore((s) => s.cognitoGroups);

  const allowed = useMemo(
    () =>
      evaluateCertificationDashboardAccess({
        cognitoGroups,
        roleFromProfile: user.role,
      }),
    [cognitoGroups, user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
