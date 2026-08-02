import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { extractRealmRolesFromToken } from "@/lib/jwt-payload";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

const ALLOWED = new Set(["STAFF_DIR", "STAFF_SYSADM", "STAFF_AUD", "STAFF_TRAINADM"]);

export function AdminReportsGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const accessToken = useAuthStore((s) => s.accessToken);

  const allowed = useMemo(() => {
    const jwtRoles = extractRealmRolesFromToken(accessToken);
    if (jwtRoles.some((r) => ALLOWED.has(r))) return true;
    return user.role ? ALLOWED.has(user.role) : false;
  }, [accessToken, user.role]);

  if (!allowed) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
