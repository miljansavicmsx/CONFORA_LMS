import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateGovernanceAccess } from "@/lib/governance-access";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Governance / rizici — NE tech_committee. */
export function GovernanceGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const cognitoGroups = useAuthStore((s) => s.cognitoGroups);

  const allowed = useMemo(
    () =>
      evaluateGovernanceAccess({
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
