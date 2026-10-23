import { type JSX, type ReactNode, useMemo } from "react";
import { Navigate, useOutletContext } from "react-router";

import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

const STAFF = new Set(["COM_TECH", "SME", "EXAMINER"]);

/** Item bank and blueprint. Sysadmin is not an exam-bank role (OD-PP-07). */
export function ExamStaffGuard({ children }: { readonly children: ReactNode }): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const sessionRoles = useAuthStore((state) => state.roles);
  const allowed = useMemo(() => {
    const roles = sessionRoles.map((role) => role.toUpperCase());
    if (roles.includes("STAFF_SYSADM")) {
      return false;
    }
    if (roles.some((role) => STAFF.has(role))) {
      return true;
    }
    const profile = String(user.role ?? "").trim().toLowerCase();
    return profile === "technical_committee" || profile === "com_tech" || profile === "sme" || profile === "examiner";
  }, [sessionRoles, user.role]);

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
