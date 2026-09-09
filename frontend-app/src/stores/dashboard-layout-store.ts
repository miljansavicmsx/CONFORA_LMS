import { create } from "zustand";

export type DashboardLayoutState = {
  sidebarCollapsed: boolean;
  drawerOpen: boolean;
  searchOpen: boolean;
  toggleSidebarCollapsed: () => void;
  setDrawerOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
};

/**
 * Layout chrome store for DashboardLayout (collapsed sidebar / mobile drawer / command).
 * Bounded Zustand state only — no auth, tenant, network, or certification behavior.
 */
export const useDashboardLayoutStore = create<DashboardLayoutState>((set) => ({
  sidebarCollapsed: false,
  drawerOpen: false,
  searchOpen: false,
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
