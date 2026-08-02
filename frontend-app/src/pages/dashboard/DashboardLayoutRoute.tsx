import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";

import { OffCanvasPanel } from "@/components/OffCanvasPanel";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { getCurrentUser, getCurrentUserPermissions } from "@/lib/api/auth-client";
import { api } from "@/lib/api";
import { formatRoleLabel } from "@/lib/format-role-label";
import { headerQuickActionsForRole } from "@/lib/header-quick-actions";
import { extractTenantLabelFromToken } from "@/lib/jwt-payload";
import {
  isNestAuthPilotActive,
  shouldRedirectPilotDashboardPath,
} from "@/lib/nest-auth-pilot";
import type { MePermissionsPayload } from "@/lib/permissions";
import { useAuthStore } from "@/stores/authStore";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

type MeUser = {
  readonly name: string;
  readonly email: string;
  readonly role: string;
};

/** Samo `import.meta.env.DEV` + VITE_SKIP_AUTH_GUARD=true — UI bez Cognita/tokena (lokalno). */
const devSkipAuthGuard =
  import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH_GUARD === "true";

function DashboardShellSkeleton(): JSX.Element {
  return (
    <div className="dark min-h-screen bg-surface-primary px-4 py-6 text-text-primary">
      <div
        className="mx-auto max-w-6xl animate-pulse space-y-6"
        aria-busy
        aria-label="Učitavanje radnog prostora"
      >
        <div className="h-14 rounded-lg bg-surface-secondary/80" />
        <div className="h-36 rounded-2xl bg-surface-secondary/80" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-28 rounded-xl bg-surface-secondary/80" />
          <div className="h-28 rounded-xl bg-surface-secondary/80" />
          <div className="h-28 rounded-xl bg-surface-secondary/80" />
        </div>
      </div>
    </div>
  );
}

function applyProfileToSession(profile: {
  email: string;
  full_name?: string;
  role: string;
  userId?: string;
}): MeUser {
  const email = String(profile.email ?? "").trim();
  const fromProfile = String(profile.full_name ?? "").trim();
  const name = fromProfile || email || "Korisnik";
  const role = String(profile.role ?? "learner").trim() || "learner";
  useAuthStore.getState().setUser({
    ...(profile.userId ? { userId: profile.userId, id: profile.userId } : {}),
    email,
    role,
    ...(fromProfile ? { full_name: fromProfile } : {}),
  });
  return { name, email, role };
}

export function DashboardLayoutRoute(): JSX.Element | null {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const pilotActive = isNestAuthPilotActive();

  const [user, setUser] = useState<MeUser | null>(null);
  const [effectivePermissions, setEffectivePermissions] = useState<MePermissionsPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "forbidden" | "ready">("loading");
  const [authHydrated, setAuthHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  const tenantLabel = useMemo(() => extractTenantLabelFromToken(accessToken), [accessToken]);
  const headerQuickActions = useMemo(
    () => (user && !pilotActive ? [...headerQuickActionsForRole(user.role)] : []),
    [user, pilotActive],
  );
  const headerRoleBadge = user ? formatRoleLabel(user.role) : undefined;

  useEffect(() => {
    if (authHydrated) {
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true));
    if (useAuthStore.persist.hasHydrated()) {
      setAuthHydrated(true);
    }
    return unsub;
  }, [authHydrated]);

  useEffect(() => {
    if (!authHydrated) {
      return;
    }

    if (devSkipAuthGuard) {
      const dev = { name: "Dev korisnik", email: "dev@example.com", role: "admin" };
      setUser(dev);
      setEffectivePermissions(null);
      useAuthStore.getState().setUser({
        email: dev.email,
        full_name: dev.name,
        role: dev.role,
      });
      setStatus("ready");
      return;
    }

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      navigate("/login", { replace: true, state: { from: pathname } });
      setStatus("forbidden");
      return;
    }

    let cancelled = false;

    const failSession = (): void => {
      if (cancelled) {
        return;
      }
      useAuthStore.getState().logout();
      navigate("/login?reason=session", { replace: true });
      setStatus("forbidden");
    };

    if (pilotActive) {
      void (async () => {
        const profileResult = await getCurrentUser(token);
        if (cancelled) {
          return;
        }
        if (profileResult.kind === "error") {
          failSession();
          return;
        }
        const meUser = applyProfileToSession(profileResult.data);
        setUser(meUser);

        const permResult = await getCurrentUserPermissions(token);
        if (!cancelled) {
          setEffectivePermissions(permResult.kind === "ok" ? permResult.data : null);
          setStatus("ready");
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    void api
      .get<Record<string, unknown>>("/auth/me")
      .then(async (r) => {
        if (cancelled) {
          return;
        }
        const d = r.data;
        const email = String(d.email ?? "");
        const fromProfile = String(d.full_name ?? d.fullName ?? "").trim();
        const name = fromProfile || email || "Korisnik";
        const role = String(d.role ?? "learner").trim() || "learner";
        const meUser = { name, email, role };
        setUser(meUser);
        useAuthStore.getState().setUser({
          userId: String(d.userId ?? d.user_id ?? ""),
          email,
          role,
          ...(fromProfile ? { full_name: fromProfile } : {}),
        });
        let snap: MePermissionsPayload | null = null;
        try {
          const pr = await api.get<MePermissionsPayload>("/api/auth/me/permissions");
          snap = pr.data;
        } catch {
          snap = null;
        }
        if (!cancelled) {
          setEffectivePermissions(snap);
          setStatus("ready");
        }
      })
      .catch(() => {
        failSession();
      });

    return () => {
      cancelled = true;
    };
  }, [authHydrated, navigate, pathname, pilotActive]);

  const onLogout = useCallback(() => {
    useAuthStore.getState().logout();
    navigate("/login", { replace: true });
  }, [navigate]);

  if (status === "forbidden") {
    return null;
  }

  if (!authHydrated || status !== "ready" || !user) {
    return <DashboardShellSkeleton />;
  }

  if (pilotActive && shouldRedirectPilotDashboardPath(pathname)) {
    return <Navigate to="/dashboard" replace state={{ pilotRouteBlocked: true }} />;
  }

  return (
    <>
      <DashboardLayout
        user={user}
        notificationCount={0}
        onLogout={onLogout}
        {...(headerRoleBadge !== undefined ? { headerRoleBadge } : {})}
        {...(typeof tenantLabel === "string" && tenantLabel.length > 0 ? { headerTenantLabel: tenantLabel } : {})}
        headerQuickActions={headerQuickActions}
        effectivePermissions={effectivePermissions}
      >
        <Outlet context={{ user, effectivePermissions } satisfies DashboardOutletContext} />
      </DashboardLayout>
      <OffCanvasPanel />
    </>
  );
}
