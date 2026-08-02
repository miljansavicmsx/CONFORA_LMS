import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { isCertificationCandidate } from "@/lib/iso-navigation-access";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Samo kandidat (learner) — hub bez pristupa odborskim kanbanima. */
export function CandidateCertificationGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const cognitoGroups = useAuthStore((s) => s.cognitoGroups);

  const allowed = useMemo(
    () => isCertificationCandidate({ role: user.role, cognitoGroups }),
    [user.role, cognitoGroups],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
