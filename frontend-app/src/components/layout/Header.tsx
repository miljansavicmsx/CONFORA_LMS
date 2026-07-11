import { motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";
import { A11Y_NS } from "@confora/i18n";
import { Fragment, useCallback, useEffect, useState, type JSX } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConforaLogo } from "@/components/ui/ConforaLogo";
import { GlobalCommandCenter } from "@/components/command-center/GlobalCommandCenter";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useOptionalWorkspaceContext } from "@/contexts/WorkspaceContext";
import { APP_WORKSPACE_LABELS } from "@/lib/app-workspace";
import { cn } from "@/lib/utils";

export type HeaderBreadcrumbItem = {
  readonly label: string;
  readonly href?: string;
};

export type HeaderNotification = {
  readonly id: string;
  readonly title: string;
  readonly time: string;
};

export type HeaderUser = {
  readonly name: string;
  readonly email?: string;
  readonly avatarUrl?: string | null;
};

export type HeaderQuickAction = {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
};

export type HeaderProps = {
  readonly breadcrumbItems: readonly HeaderBreadcrumbItem[];
  readonly user: HeaderUser;
  readonly notificationCount?: number;
  readonly notifications?: readonly HeaderNotification[];
  readonly commandOpen: boolean;
  readonly onCommandOpenChange: (open: boolean) => void;
  readonly onLogout?: () => void;
  /** Mobilni drawer (sidebar) — prikazuje hamburger lijevo. */
  readonly onMobileNavOpen?: () => void;
  /** Prikaz uloge korisnika (ljudski jezik). */
  readonly roleBadge?: string;
  /** Organizacija / tenant iz JWT-a (samo prikaz). */
  readonly tenantLabel?: string;
  /** Brzi linkovi u zaglavlju (desktop). */
  readonly quickActions?: readonly HeaderQuickAction[];
};

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/u).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  const a = parts[0]?.[0];
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return `${a ?? ""}${b ?? ""}`.toUpperCase() || "?";
}

function useCommandPaletteShortcut(setOpen: (v: boolean) => void): void {
  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);
}

export function Header({
  breadcrumbItems,
  user,
  notificationCount = 0,
  notifications = [],
  commandOpen,
  onCommandOpenChange,
  onLogout,
  onMobileNavOpen,
  roleBadge,
  tenantLabel,
  quickActions = [],
}: HeaderProps): JSX.Element {
  const { t } = useTranslation(A11Y_NS);
  const navigate = useNavigate();
  const wsCtx = useOptionalWorkspaceContext();
  const commandWorkspace = wsCtx?.workspace ?? "learning";
  useCommandPaletteShortcut(onCommandOpenChange);

  const handleLogout = useCallback(() => {
    if (onLogout) {
      onLogout();
    } else {
      navigate("/login");
    }
  }, [navigate, onLogout]);

  const [notifOpen, setNotifOpen] = useState(false);
  const isApple =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/u.test(navigator.platform ?? navigator.userAgent);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 flex h-[60px] shrink-0 items-center gap-3 border-b border-border/50",
          "bg-surface-primary/80 px-3 backdrop-blur-xl sm:px-4",
        )}
      >
        {onMobileNavOpen ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-text-secondary hover:bg-surface-secondary hover:text-text-primary lg:hidden"
            aria-label={t("open_menu")}
            data-testid="mobile-menu-open"
            onClick={onMobileNavOpen}
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : null}

        <div className="flex min-w-0 flex-1 items-center gap-3">
          {wsCtx && wsCtx.available.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 shrink-0 gap-1 rounded-lg px-2 text-text-primary hover:bg-surface-secondary"
                  aria-haspopup="menu"
                  aria-label="Odabir radnog prostora CONFORA"
                >
                  <span className="max-w-[10rem] truncate text-sm font-semibold tracking-tight">CONFORA</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 border-border/50 bg-surface-secondary text-text-primary">
                <DropdownMenuLabel className="text-xs text-text-muted">Radni prostor</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                {wsCtx.available.map((id) => (
                  <DropdownMenuItem
                    key={id}
                    className={cn("cursor-pointer focus:bg-brand/10", wsCtx.workspace === id && "bg-brand/10")}
                    onSelect={() => wsCtx.setWorkspace(id)}
                  >
                    {APP_WORKSPACE_LABELS[id]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/dashboard"
              aria-label="CONFORA — nadzorna ploča"
              className="shrink-0 rounded-md opacity-95 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <ConforaLogo size="sm" presentational />
            </Link>
          )}

          <nav
            className="hidden min-w-0 flex-1 items-center gap-2 text-sm text-text-secondary sm:flex"
            aria-label="Putanja"
          >
            {breadcrumbItems.map((item, i) => (
              <Fragment key={`${item.label}-${i}`}>
                {i > 0 ? (
                  <span className="text-text-muted" aria-hidden>
                    &gt;
                  </span>
                ) : null}
                {item.href ? (
                  <Link
                    to={item.href}
                    className="truncate transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-text-primary">{item.label}</span>
                )}
              </Fragment>
            ))}
          </nav>

          <div className="flex min-w-0 flex-1 sm:hidden">
            <span className="truncate text-sm font-medium text-text-primary">
              {breadcrumbItems[breadcrumbItems.length - 1]?.label ?? "CONFORA"}
            </span>
          </div>
        </div>

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
          {roleBadge || tenantLabel ? (
            <div className="hidden max-w-[min(40vw,12rem)] flex-col items-end gap-0.5 text-right md:flex lg:max-w-[14rem]">
              <span className="truncate text-xs font-medium text-text-primary">{user.name}</span>
              <div className="flex flex-wrap items-center justify-end gap-1">
                {roleBadge ? (
                  <Badge variant="outline" className="border-border/50 px-1.5 py-0 text-[10px] font-medium">
                    {roleBadge}
                  </Badge>
                ) : null}
                {tenantLabel ? (
                  <Badge variant="outline" className="max-w-full truncate border-border/50 px-1.5 py-0 text-[10px] font-normal text-text-muted">
                    {tenantLabel}
                  </Badge>
                ) : null}
              </div>
            </div>
          ) : null}

          {quickActions.length > 0 ? (
            <div className="hidden gap-0.5 lg:flex" aria-label="Brze akcije">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <Button
                    key={`${a.href}-${a.label}`}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-text-secondary hover:bg-surface-secondary hover:text-brand"
                    asChild
                    title={a.label}
                  >
                    <Link to={a.href} aria-label={a.label}>
                      <Icon className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                );
              })}
            </div>
          ) : null}

          <LanguageSwitcher compact className="hidden sm:flex" data-testid="header-language-switcher" />

          <div className="relative hidden sm:block">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onCommandOpenChange(true)}
              className="h-9 gap-2 rounded-lg border border-border/50 bg-surface-secondary/50 px-3 text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              aria-label={t("search")}
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden text-sm md:inline">Pretraži…</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border/50 bg-surface-primary px-1.5 font-mono text-[10px] font-medium text-text-muted md:inline-flex">
                {isApple ? (
                  <>
                    <span className="text-xs">⌘</span>K
                  </>
                ) : (
                  <>Ctrl+K</>
                )}
              </kbd>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-text-secondary hover:bg-surface-secondary hover:text-text-primary sm:hidden"
            aria-label={t("search")}
            onClick={() => onCommandOpenChange(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                aria-label="Obavještenja"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 ? (
                  <motion.span
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white shadow-sm"
                  >
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </motion.span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 border-border/50 bg-surface-secondary text-text-primary"
            >
              <DropdownMenuLabel>Obavještenja</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              {notifications.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-text-secondary">
                  Nema novih obavještenja.
                </p>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex cursor-default flex-col items-start gap-0.5 focus:bg-brand/10"
                  >
                    <span className="font-medium">{n.title}</span>
                    <span className="text-xs text-text-muted">{n.time}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full ring-2 ring-brand/30 hover:ring-brand/50"
                aria-label={t("user_menu")}
              >
                <Avatar className="h-8 w-8">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                  <AvatarFallback className="bg-brand/15 text-[10px] font-semibold text-brand">
                    {userInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 border-border/50 bg-surface-secondary text-text-primary"
            >
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{user.name}</p>
                {user.email ? (
                  <p className="truncate text-xs text-text-secondary">{user.email}</p>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem asChild className="focus:bg-brand/10">
                <Link to="/dashboard/profil" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-brand/10">
                <Link to="/dashboard/postavke" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Postavke
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Odjava
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <GlobalCommandCenter
        open={commandOpen}
        onOpenChange={onCommandOpenChange}
        workspace={commandWorkspace}
        isoCtx={wsCtx?.isoCtx ?? { role: "learner", cognitoGroups: [], permissionsSnapshot: null }}
      />
    </>
  );
}
