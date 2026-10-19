import { useEffect, useState, type JSX } from "react";
import { DASHBOARD_NS } from "@confora/i18n";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet } from "react-router";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

/** Client routing guard only; protected server resources enforce their own authorization. */
export function DashboardLayoutRoute(): JSX.Element {
  const { t } = useTranslation(DASHBOARD_NS);
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);
  const authenticated = useAuthStore((state) => state.isAuthenticated && Boolean(state.accessToken));
  const user = useAuthStore((state) => state.user);
  if (!hydrated) return <p className="p-8" role="status">{t("loading")}</p>;
  if (!authenticated) return <Navigate to="/login?reason=session" replace />;
  const context: DashboardOutletContext = { user: user ?? {} };
  const name = user?.name?.trim() || user?.email?.trim() || t("greeting.anonymous");
  return (
    <DashboardLayout
      user={{
        name,
        ...(user?.email ? { email: user.email } : {}),
        ...(user?.role ? { role: user.role } : {}),
      }}
      onLogout={() => useAuthStore.getState().logout()}
    >
      <Outlet context={context} />
    </DashboardLayout>
  );
}
