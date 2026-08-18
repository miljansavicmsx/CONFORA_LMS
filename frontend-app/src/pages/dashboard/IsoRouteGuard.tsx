import type { JSX, ReactNode } from "react";
import { Navigate } from "react-router";

import type { IsoNavContext } from "@/lib/iso-navigation-access";
import { useAuthStore } from "@/stores/authStore";

/** UI routing guard only. It does not grant or claim server-side authorization. */
export function IsoRouteGuard({ allow, children }: { readonly allow: (context: IsoNavContext) => boolean; readonly children: ReactNode }): JSX.Element {
  const authenticated = useAuthStore((state) => state.isAuthenticated && Boolean(state.accessToken));
  const role = useAuthStore((state) => state.user?.role ?? "");
  const cognitoGroups = useAuthStore((state) => state.cognitoGroups);
  if (!authenticated) return <Navigate to="/login?reason=session" replace />;
  if (!allow({ role, cognitoGroups })) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
