import { useEffect, type JSX } from "react";
import { DASHBOARD_NS } from "@confora/i18n";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet } from "react-router";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Client routing guard only; protected server resources enforce their own authorization. */
export function DashboardLayoutRoute(): JSX.Element {
  const { t } = useTranslation(DASHBOARD_NS);
  const status = useAuthStore((state) => state.status);
  const lostReason = useAuthStore((state) => state.lostReason);
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    if (useAuthStore.getState().status === "unknown") {
      void useAuthStore.getState().restore();
    }
  }, []);
  if (status === "unknown") return <p className="p-8" role="status">{t("loading")}</p>;
  if (status !== "authenticated") {
    const reason = lostReason === "expired" ? "expired" : "session";
    return <Navigate to={`/login?reason=${reason}`} replace />;
  }
  const context: DashboardOutletContext = { user: user ?? {} };
  const name = user?.name?.trim() || user?.email?.trim() || t("greeting.anonymous");
  return (
    <DashboardLayout
      user={{
        name,
        ...(user?.email ? { email: user.email } : {}),
        ...(user?.role ? { role: user.role } : {}),
      }}
      onLogout={() => void useAuthStore.getState().logout()}
    >
      <Outlet context={context} />
    </DashboardLayout>
  );
}
