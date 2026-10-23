import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Certification decision queue. Only the certification committee records a decision. */
export function ExamCommitteeGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const sessionRoles = useAuthStore((state) => state.roles);
  const allowed = useMemo(() => {
    const roles = sessionRoles.map((role) => role.toUpperCase());
    if (roles.includes("STAFF_SYSADM")) {
      return false;
    }
    if (roles.includes("COM_CERT")) {
      return true;
    }
    const profile = String(user.role ?? "").trim().toLowerCase();
    return profile === "com_cert" || profile === "certification_committee" || profile === "cert_committee";
  }, [sessionRoles, user.role]);

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
