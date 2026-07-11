import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { A11Y_NS, SHELL_NS } from "@confora/i18n";
import { useMemo, type JSX } from "react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConforaLogo } from "@/components/ui/ConforaLogo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buildSidebarSectionDefs } from "@/components/layout/sidebar-sections";
import { localizeSidebarSections } from "@/components/layout/localize-sidebar-sections";
import type { SidebarNavItem, SidebarUser } from "@/components/layout/sidebar-nav-types";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import type { MePermissionsPayload } from "@/lib/permissions";
import { extractRealmRolesFromToken } from "@/lib/jwt-payload";
import { buildRoleAwarePilotSidebarSections, isNestAuthPilotActive } from "@/lib/nest-auth-pilot";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Link, NavLink } from "react-router";

export type { SidebarNavItem, SidebarUser } from "@/components/layout/sidebar-nav-types";

export type SidebarProps = {
  readonly collapsed: boolean;
  readonly showCollapse: boolean;
  readonly user: SidebarUser;
  /** Broj aktivnih kurseva za badge kod „Moji kursevi“. */
  readonly activeCoursesCount?: number;
  readonly onNavigate?: () => void;
  readonly onToggleCollapse: () => void;
  /** Snapshot s ``GET /api/auth/me/permissions`` (opcionalno). */
  readonly effectivePermissions?: MePermissionsPayload | null;
};

const WIDTH_EXPANDED = 280;
const WIDTH_COLLAPSED = 72;

export const SIDEBAR_WIDTH_EXPANDED = WIDTH_EXPANDED;
export const SIDEBAR_WIDTH_COLLAPSED = WIDTH_COLLAPSED;

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/u).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  const a = parts[0]?.[0];
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return `${a ?? ""}${b ?? ""}`.toUpperCase() || "?";
}

function NavItemRow({
  item,
  collapsed,
  onNavigate,
  badge,
}: {
  readonly item: SidebarNavItem;
  readonly collapsed: boolean;
  readonly onNavigate?: () => void;
  readonly badge?: number;
}): JSX.Element {
  const Icon = item.icon;
  const showBadge = typeof badge === "number" && badge > 0;

  const linkInner = (
    <>
      <motion.span
        className="relative flex shrink-0"
        whileHover={{ scale: 1.06 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
      >
        <Icon
          className={cn(
            "h-6 w-6 transition-colors",
            item.ai
              ? "text-violet-400 group-hover:text-violet-300"
              : "text-text-secondary group-hover:text-brand",
          )}
          aria-hidden
        />
        {showBadge && collapsed ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-solid px-0.5 text-[9px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </motion.span>
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18 }}
            className="min-w-0 flex-1 truncate text-left"
          >
            {item.label}
          </motion.span>
        ) : null}
      </AnimatePresence>
      {showBadge && !collapsed ? (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand/20 px-1.5 text-[10px] font-semibold text-brand">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </>
  );

  const baseClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group relative flex w-full items-center gap-3 rounded-lg border-l-2 border-transparent py-2.5 text-sm font-medium transition-colors",
      collapsed ? "justify-center px-0" : "px-3",
      item.ai
        ? isActive
          ? "border-violet-500 bg-violet-500/15 text-violet-200"
          : "bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
        : isActive
          ? "border-brand bg-brand/10 text-brand"
          : "bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
      isActive && !item.ai && "[&_svg]:text-brand",
    );

  const navLink = (
    <NavLink
      to={item.to}
      end={item.end ?? false}
      onClick={onNavigate}
      className={baseClass}
      title={collapsed ? item.label : undefined}
    >
      {linkInner}
    </NavLink>
  );

  if (!collapsed) {
    return navLink;
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{navLink}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {item.label}
        {showBadge ? ` (${badge})` : ""}
      </TooltipContent>
    </Tooltip>
  );
}

function SectionLabel({ collapsed, children }: { collapsed: boolean; children: string }): JSX.Element | null {
  if (collapsed) {
    return null;
  }
  return (
    <p className="mb-2 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted first:mt-0">
      {children}
    </p>
  );
}

export function Sidebar({
  collapsed,
  showCollapse,
  user,
  activeCoursesCount = 0,
  onNavigate,
  onToggleCollapse,
  effectivePermissions,
}: SidebarProps): JSX.Element {
  const { t: tA11y } = useTranslation(A11Y_NS);
  const { t: tShell } = useTranslation(SHELL_NS);
  const narrow = collapsed;
  const profileUser = useAuthStore((s) => s.user);
  const cognitoGroups = useAuthStore((s) => s.cognitoGroups);
  const accessToken = useAuthStore((s) => s.accessToken);

  const isoCtx = useMemo(
    () => ({
      role: profileUser?.role ?? "",
      cognitoGroups,
      ...(effectivePermissions !== undefined ? { permissionsSnapshot: effectivePermissions } : {}),
    }),
    [profileUser?.role, cognitoGroups, effectivePermissions],
  );

  const { workspace } = useWorkspaceContext();

  const jwtRoles = useMemo(() => extractRealmRolesFromToken(accessToken), [accessToken]);

  const { t: tNav } = useTranslation("navigation");

  const sections = useMemo(() => {
    const defs = isNestAuthPilotActive()
      ? buildRoleAwarePilotSidebarSections(isoCtx, workspace, {
          roleFromProfile: profileUser?.role ?? user.role ?? "learner",
          jwtRoles,
        })
      : buildSidebarSectionDefs(isoCtx, workspace);
    return localizeSidebarSections(defs, tNav);
  }, [isoCtx, workspace, profileUser?.role, user.role, jwtRoles, tNav]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-full min-h-0 flex-col border-r border-border/50 bg-surface-primary">
        <div className="shrink-0 border-b border-border/50">
          <div
            className={cn(
              "flex h-16 items-center px-2",
              narrow ? "justify-center" : "justify-start gap-1 px-3",
            )}
          >
            <Link
              to="/dashboard"
              onClick={onNavigate}
              className={cn(
                "flex min-w-0 items-center rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand/50",
                narrow ? "justify-center p-1" : "px-0.5 py-1",
              )}
              aria-label={tA11y("dashboard_home")}
            >
              <ConforaLogo
                mode={narrow ? "icon" : "full"}
                size={narrow ? "sm" : "md"}
                presentational
                className="max-w-[200px]"
              />
            </Link>
          </div>
          {!narrow ? (
            <div className="border-t border-border/30 px-3 py-2">
              <span className="inline-flex max-w-full rounded-full border border-brand/25 bg-brand/10 px-2.5 py-1 text-[10px] font-medium text-brand backdrop-blur-sm">
                {tShell("sidebar.badge")}
              </span>
            </div>
          ) : null}
        </div>

        <nav
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-2"
          aria-label={tA11y("main_navigation")}
        >
          {sections.map((sec, secIdx) => (
            <section key={`sidebar-sec-${secIdx}`}>
              <SectionLabel collapsed={narrow}>{sec.title}</SectionLabel>
              {sec.items.map((item, idx) => {
                const badge =
                  item.to === "/dashboard/courses" ? activeCoursesCount : undefined;
                const key = `${sec.title}-${idx}-${item.to}-${item.label}`;
                return (
                  <div key={key} className="mb-0.5">
                    <NavItemRow
                      item={item}
                      collapsed={narrow}
                      {...(onNavigate !== undefined ? { onNavigate } : {})}
                      {...(badge !== undefined ? { badge } : {})}
                    />
                  </div>
                );
              })}
            </section>
          ))}

          {showCollapse ? (
            <div className={cn("mt-auto shrink-0 pt-3", narrow && "flex justify-center")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-9 w-9 border border-border/50 bg-surface-secondary/80 text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                    aria-label={narrow ? tA11y("expand_sidebar") : tA11y("collapse_sidebar")}
                  >
                    {narrow ? (
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    ) : (
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{narrow ? tShell("sidebar.expand") : tShell("sidebar.collapse")}</TooltipContent>
              </Tooltip>
            </div>
          ) : null}
        </nav>

        <Separator className="shrink-0 bg-border/50" />

        <div
          className={cn(
            "flex shrink-0 items-center gap-3 p-3",
            narrow ? "flex-col justify-center" : "",
          )}
        >
          <Avatar
            className={cn(
              "h-10 w-10 shrink-0 border-2 border-brand/70",
              narrow && "h-9 w-9",
            )}
          >
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-brand/15 text-xs font-semibold text-brand">
              {userInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          {!narrow ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
              {user.title ? (
                <p className="truncate text-xs text-text-secondary">{user.title}</p>
              ) : user.email ? (
                <p className="truncate text-xs text-text-secondary">{user.email}</p>
              ) : null}
            </div>
          ) : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/dashboard/postavke"
                onClick={onNavigate}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-secondary hover:text-brand",
                  narrow && "mt-1",
                )}
                aria-label={tShell("sidebar.settings")}
              >
                <Settings className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{tShell("sidebar.settings")}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
