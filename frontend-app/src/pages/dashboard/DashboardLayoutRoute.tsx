import type { JSX } from "react";
import { Navigate, Outlet } from "react-router";

import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Client routing guard only; protected server resources enforce their own authorization. */
export function DashboardLayoutRoute(): JSX.Element {
  const authenticated = useAuthStore((state) => state.isAuthenticated && Boolean(state.accessToken));
  const user = useAuthStore((state) => state.user);
  if (!authenticated) return <Navigate to="/login?reason=session" replace />;
  const context: DashboardOutletContext = { user: user ?? {} };
  return <Outlet context={context} />;
}
