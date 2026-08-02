import type { JSX, ReactNode } from "react";
import { Navigate } from "react-router";

import { isInactivePilotNavPath } from "@/lib/inactive-feature-visibility";
import { isNestAuthPilotActive } from "@/lib/nest-auth-pilot";

export function LearnRoutePilotGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  if (isNestAuthPilotActive() && isInactivePilotNavPath("/learn")) {
    return <Navigate to="/dashboard/inactive-demo" replace state={{ from: "/learn" }} />;
  }
  return <>{children}</>;
}
