import { create } from "zustand";

export type DashboardLayoutState = {
  readonly sidebarCollapsed: boolean;
  readonly drawerOpen: boolean;
  readonly searchOpen: boolean;
  toggleSidebarCollapsed: () => void;
  setDrawerOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
};

export const useDashboardLayoutStore = create<DashboardLayoutState>((set) => ({
  sidebarCollapsed: false,
  drawerOpen: false,
  searchOpen: false,
  toggleSidebarCollapsed: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
