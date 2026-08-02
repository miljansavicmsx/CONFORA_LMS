import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateUserRegistryAccess } from "@/lib/user-registry-access";
import { extractRealmRolesFromToken } from "@/lib/jwt-payload";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** admin (tenant ograničenje na API-u) ili sys_admin. */
export function UserRegistryGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const accessToken = useAuthStore((s) => s.accessToken);

  const allowed = useMemo(
    () =>
      evaluateUserRegistryAccess({
        roleFromProfile: user.role,
        jwtRoles: extractRealmRolesFromToken(accessToken),
      }),
    [accessToken, user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
