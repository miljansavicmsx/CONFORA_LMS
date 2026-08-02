import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateCurriculumItemBankAccess } from "@/lib/content-editor-access";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Kurikulum, item bank, roleplay — tech_committee, sys_admin, uobičajeni editori. */
export function CurriculumGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const cognitoGroups = useAuthStore((s) => s.cognitoGroups);

  const allowed = useMemo(
    () =>
      evaluateCurriculumItemBankAccess({
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
