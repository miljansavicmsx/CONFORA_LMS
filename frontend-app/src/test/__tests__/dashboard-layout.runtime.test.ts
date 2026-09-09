import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { MemoryRouter } from "react-router";

vi.mock("@/components/layout/Header", () => ({
  Header: (props: { onMobileNavOpen?: () => void; user: { name: string } }) =>
    createElement(
      "header",
      { "data-testid": "mock-header" },
      createElement(
        "button",
        { type: "button", "data-testid": "open-mobile", onClick: props.onMobileNavOpen },
        "open",
      ),
      props.user.name,
    ),
}));

vi.mock("@/components/layout/Sidebar", () => ({
  SIDEBAR_WIDTH_COLLAPSED: 72,
  SIDEBAR_WIDTH_EXPANDED: 280,
  Sidebar: (props: { collapsed: boolean; onToggleCollapse: () => void }) =>
    createElement(
      "div",
      { "data-testid": "mock-sidebar", "data-collapsed": String(props.collapsed) },
      createElement(
        "button",
        { type: "button", "data-testid": "toggle", onClick: props.onToggleCollapse },
        "toggle",
      ),
    ),
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children?: ReactNode }) => createElement("div", { "data-testid": "mock-tooltip-provider" }, children),
}));

vi.mock("@/contexts/WorkspaceContext", () => ({
  WorkspaceProvider: ({ children }: { children?: ReactNode }) => createElement("div", { "data-testid": "mock-workspace-provider" }, children),
  useWorkspaceContext: () => ({ workspace: "learning" as const }),
}));

vi.mock("@/lib/jwt-payload", () => ({
  extractRealmRolesFromToken: () => [] as string[],
}));

vi.mock("@/lib/permissions", () => ({
  // type-only in production; keep value mock for resolver safety
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock("@confora/ui", () => ({
  SkipToMainLink: ({ label }: { label: string }) => createElement("a", { href: "#main-content" }, label),
}));

vi.mock("@/lib/nest-auth-pilot", () => ({
  isNestAuthPilotActive: () => false,
  buildRoleAwarePilotMobileNav: () => [],
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: null }),
}));

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useDashboardLayoutStore } from "@/stores/dashboard-layout-store";

function renderLayout(): HTMLElement {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const child = createElement("main", { id: "main-content", "data-testid": "child" }, "child");
  act(() => {
    root.render(
      createElement(
        MemoryRouter,
        { initialEntries: ["/dashboard"] },
        createElement(DashboardLayout, {
          user: { name: "Runtime User", role: "learner" },
          children: child,
        }),
      ),
    );
  });
  (host as HTMLElement & { __root?: ReturnType<typeof createRoot> }).__root = root;
  return host;
}

function unmount(host: HTMLElement): void {
  const root = (host as HTMLElement & { __root?: ReturnType<typeof createRoot> }).__root;
  act(() => {
    root?.unmount();
  });
  host.remove();
}

describe("dashboard-layout component runtime", () => {
  beforeEach(() => {
    useDashboardLayoutStore.setState({
      sidebarCollapsed: false,
      drawerOpen: false,
      searchOpen: false,
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: String(query).includes("min-width: 1024px"),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
        onchange: null,
      }),
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("mounts actual DashboardLayout with expanded desktop classes and no inline style", () => {
    useDashboardLayoutStore.setState({ sidebarCollapsed: false });
    const host = renderLayout();
    const shell = host.querySelector('[data-testid="dashboard-content-shell"]');
    const aside = host.querySelector('[data-testid="dashboard-desktop-aside"]');
    expect(shell).not.toBeNull();
    expect(aside).not.toBeNull();
    expect(shell!.className).toContain("lg:ml-[280px]");
    expect(aside!.className).toContain("w-[280px]");
    expect(shell!.getAttribute("style")).toBeNull();
    expect(aside!.getAttribute("style")).toBeNull();
    expect(host.querySelector('[data-testid="mock-sidebar"]')?.getAttribute("data-collapsed")).toBe(
      "false",
    );
    expect(host.querySelector('[data-testid="child"]')?.textContent).toBe("child");
    unmount(host);
  });

  it("renders collapsed desktop classes without inline style", () => {
    useDashboardLayoutStore.setState({ sidebarCollapsed: true });
    const host = renderLayout();
    const shell = host.querySelector('[data-testid="dashboard-content-shell"]');
    const aside = host.querySelector('[data-testid="dashboard-desktop-aside"]');
    expect(shell!.className).toContain("lg:ml-[72px]");
    expect(aside!.className).toContain("w-[72px]");
    expect(shell!.getAttribute("style")).toBeNull();
    expect(aside!.getAttribute("style")).toBeNull();
    expect(host.querySelector('[data-testid="mock-sidebar"]')?.getAttribute("data-collapsed")).toBe(
      "true",
    );
    unmount(host);
  });

  it("renders mobile drawer without inline transform styles", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: () => ({
        matches: false,
        media: "",
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
        onchange: null,
      }),
    });
    useDashboardLayoutStore.setState({ drawerOpen: true, sidebarCollapsed: false });
    const host = renderLayout();
    const drawer = host.querySelector('[data-testid="dashboard-mobile-drawer"]');
    expect(drawer).not.toBeNull();
    expect(drawer!.getAttribute("style")).toBeNull();
    expect(host.querySelector('nav[aria-label="Mobilna navigacija"]')).not.toBeNull();
    unmount(host);
  });
});
