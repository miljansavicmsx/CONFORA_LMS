import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { evaluateCertificationApplicationsQueueAccess } from "@/lib/certification-staff-queue-access";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/**
 * Red prijava osobe za certifikaciju — bez Cognito zamjenskih grupa i bez tech_committee
 * (`require_certification_applications_queue`).
 */
export function CertificationApplicationsQueueGuard({
  children,
}: {
  readonly children: ReactNode;
}): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();

  const allowed = useMemo(
    () => evaluateCertificationApplicationsQueueAccess({ roleFromProfile: user.role }),
    [user.role],
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
