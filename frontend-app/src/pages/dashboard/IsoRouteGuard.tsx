import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import type { IsoNavContext } from "@/lib/iso-navigation-access";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

export function IsoRouteGuard({
  children,
  allow,
}: {
  readonly children: ReactNode;
  readonly allow: (ctx: IsoNavContext) => boolean;
}): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const cognitoGroups = useAuthStore((s) => s.cognitoGroups);

  const ctx: IsoNavContext = useMemo(
    () => ({ role: user.role, cognitoGroups }),
    [user.role, cognitoGroups],
  );

  const ok = allow(ctx);

  if (!ok) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
