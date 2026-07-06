import { SkipToMainLink } from "@confora/ui";
import { A11Y_NS } from "@confora/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, BookOpenCheck, ClipboardList, LayoutDashboard, Medal } from "lucide-react";
import { useSyncExternalStore, type JSX } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router";

import { Header, type HeaderNotification, type HeaderQuickAction } from "@/components/layout/Header";
import {
  Sidebar,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from "@/components/layout/Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDashboardLayoutStore } from "@/stores/dashboard-layout-store";
import { WorkspaceProvider, useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { APP_WORKSPACE_LABELS } from "@/lib/app-workspace";
import type { MePermissionsPayload } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { extractRealmRolesFromToken } from "@/lib/jwt-payload";
import { buildRoleAwarePilotMobileNav, isNestAuthPilotActive } from "@/lib/nest-auth-pilot";
import { useAuthStore } from "@/stores/authStore";
import { breadcrumbsFromPathname } from "@/pages/dashboard/dashboard-breadcrumbs";

export type BreadcrumbItem = {
  readonly label: string;
  readonly href?: string;
};

export type DashboardUser = {
  readonly name: string;
  readonly email?: string;
  readonly avatarUrl?: string | null;
  /** Profesionalni naslov (npr. s LinkedIna) */
  readonly title?: string | null;
};

export type DashboardLayoutProps = {
  readonly children: React.ReactNode;
  readonly user: DashboardUser & { readonly role?: string };
  readonly notificationCount?: number;
  readonly notifications?: readonly HeaderNotification[];
  /** Broj aktivnih kurseva — badge na „Moji Kursevi“ u sidebaru. */
  readonly activeCoursesCount?: number;
  readonly onLogout?: () => void;
  readonly headerRoleBadge?: string;
  readonly headerTenantLabel?: string;
  readonly headerQuickActions?: readonly HeaderQuickAction[];
  readonly effectivePermissions?: MePermissionsPayload | null;
};

const MOBILE_NAV = [
  { to: "/dashboard", label: "Dashboard", short: "Dom", icon: LayoutDashboard, end: true },
  { to: "/dashboard/courses", label: "Kursevi", short: "Kur.", icon: BookOpen, end: true },
  { to: "/dashboard/exams", label: "Ispiti", short: "Isp.", icon: BookOpenCheck, end: false },
  { to: "/dashboard/certification/applications", label: "Prijave", short: "Prij.", icon: ClipboardList, end: false },
  { to: "/dashboard/certification/status", label: "Cert.", short: "Cer.", icon: Medal, end: false },
] as const;

function useMediaMinLg(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

function BottomNavBar({ role }: { readonly role?: string }): JSX.Element {
  const accessToken = useAuthStore((s) => s.accessToken);
  const jwtRoles = extractRealmRolesFromToken(accessToken);
  const navItems = isNestAuthPilotActive()
    ? buildRoleAwarePilotMobileNav({ roleFromProfile: role ?? "learner", jwtRoles })
    : MOBILE_NAV;
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch justify-around border-t border-border/50 bg-surface-primary px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.35)] lg:hidden"
      aria-label="Mobilna navigacija"
    >
      {navItems.map(({ to, label, short, icon: Icon, end }) => (
        <NavLink
          key={`${to}-${label}`}
          to={to}
          end={end}
          title={label}
          className={({ isActive }) =>
            cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium",
              isActive ? "text-brand" : "text-text-muted",
            )
          }
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          <span className="max-w-full truncate px-0.5">{short}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function DashboardLayoutInner({
  children,
  user,
  notificationCount = 0,
  notifications = [],
  activeCoursesCount = 0,
  onLogout,
  headerRoleBadge,
  headerTenantLabel,
  headerQuickActions,
  effectivePermissions,
}: DashboardLayoutProps): JSX.Element {
  const { t } = useTranslation(A11Y_NS);
  const { pathname } = useLocation();
  const { workspace } = useWorkspaceContext();
  const breadcrumbItems = breadcrumbsFromPathname(pathname, APP_WORKSPACE_LABELS[workspace]);
  const isLg = useMediaMinLg();
  const sidebarCollapsed = useDashboardLayoutStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useDashboardLayoutStore((s) => s.toggleSidebarCollapsed);
  const drawerOpen = useDashboardLayoutStore((s) => s.drawerOpen);
  const setDrawerOpen = useDashboardLayoutStore((s) => s.setDrawerOpen);
  const searchOpen = useDashboardLayoutStore((s) => s.searchOpen);
  const setSearchOpen = useDashboardLayoutStore((s) => s.setSearchOpen);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <TooltipProvider delayDuration={250}>
      <div className="dark min-h-screen bg-surface-primary text-text-primary">
      {/* Desktop sidebar */}
      <motion.aside
        layout
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed left-0 top-0 z-30 hidden h-screen overflow-hidden border-r border-border/50 lg:block"
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          showCollapse
          user={user}
          activeCoursesCount={activeCoursesCount}
          onToggleCollapse={toggleSidebarCollapsed}
          {...(effectivePermissions !== undefined ? { effectivePermissions } : {})}
        />
      </motion.aside>

      <AnimatePresence>
        {drawerOpen && !isLg ? (
          <>
            <motion.button
              type="button"
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              aria-label={t("close_menu")}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -SIDEBAR_WIDTH_EXPANDED }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_WIDTH_EXPANDED }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed left-0 top-0 z-50 h-full w-[280px] max-w-[85vw] border-r border-border/50 bg-surface-primary shadow-2xl lg:hidden"
            >
              <Sidebar
                collapsed={false}
                showCollapse={false}
                user={user}
                activeCoursesCount={activeCoursesCount}
                onNavigate={() => setDrawerOpen(false)}
                onToggleCollapse={toggleSidebarCollapsed}
                {...(effectivePermissions !== undefined ? { effectivePermissions } : {})}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div
        className="flex min-h-screen flex-col transition-[margin] duration-300 ease-out lg:mb-0"
        style={{
          marginLeft: isLg ? sidebarWidth : 0,
        }}
      >
        <SkipToMainLink label={t("skip_to_main")} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:inline-block focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand/50" />
        <Header
          breadcrumbItems={breadcrumbItems}
          user={user}
          notificationCount={notificationCount}
          notifications={notifications}
          commandOpen={searchOpen}
          onCommandOpenChange={setSearchOpen}
          {...(onLogout !== undefined ? { onLogout } : {})}
          onMobileNavOpen={() => setDrawerOpen(true)}
          {...(headerRoleBadge !== undefined ? { roleBadge: headerRoleBadge } : {})}
          {...(headerTenantLabel !== undefined ? { tenantLabel: headerTenantLabel } : {})}
          {...(headerQuickActions !== undefined && headerQuickActions.length > 0
            ? { quickActions: headerQuickActions }
            : {})}
        />

        <motion.div layout className="flex-1 px-4 py-6 pb-24 lg:px-6 lg:pb-8">
          {children}
        </motion.div>
      </div>

      <BottomNavBar role={user.role} />
      </div>
    </TooltipProvider>
  );
}

export function DashboardLayout(props: DashboardLayoutProps): JSX.Element {
  const role = props.user.role ?? "learner";
  return (
    <WorkspaceProvider role={role} permissionsSnapshot={props.effectivePermissions ?? null}>
      <DashboardLayoutInner {...props} />
    </WorkspaceProvider>
  );
}
