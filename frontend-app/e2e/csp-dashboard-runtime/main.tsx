import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18n from "i18next";

import {
  DashboardLayout,
  DESKTOP_CONTENT_MARGIN_CLASS,
  DESKTOP_SIDEBAR_WIDTH_CLASS,
} from "@/layouts/DashboardLayout";
import { useDashboardLayoutStore } from "@/stores/dashboard-layout-store";

import layoutModuleUrl from "@/layouts/DashboardLayout.tsx?url";

declare global {
  interface Window {
    __ACTUAL_DASHBOARD_IMPORTED__?: boolean;
    __ACTUAL_DASHBOARD_MOUNTED__?: boolean;
    __DASHBOARD_IMPORT_URL__?: string;
    __DASHBOARD_MARGIN_CLASS_MAP__?: typeof DESKTOP_CONTENT_MARGIN_CLASS;
    __DASHBOARD_WIDTH_CLASS_MAP__?: typeof DESKTOP_SIDEBAR_WIDTH_CLASS;
    __setDashboardLayoutState__?: (partial: {
      sidebarCollapsed?: boolean;
      drawerOpen?: boolean;
    }) => void;
  }
}

async function boot(): Promise<void> {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: "en",
      resources: {
        en: {
          a11y: { skip_to_main: "Skip to main", close_menu: "Close menu" },
          translation: {},
        },
      },
      interpolation: { escapeValue: false },
    });
  }

  window.__ACTUAL_DASHBOARD_IMPORTED__ = true;
  window.__DASHBOARD_IMPORT_URL__ = layoutModuleUrl;
  window.__DASHBOARD_MARGIN_CLASS_MAP__ = DESKTOP_CONTENT_MARGIN_CLASS;
  window.__DASHBOARD_WIDTH_CLASS_MAP__ = DESKTOP_SIDEBAR_WIDTH_CLASS;
  window.__setDashboardLayoutState__ = (partial) => {
    useDashboardLayoutStore.setState(partial);
  };

  const rootEl = document.getElementById("root");
  if (!rootEl) {
    throw new Error("Missing #root");
  }

  createRoot(rootEl).render(
    createElement(
      I18nextProvider,
      { i18n },
      createElement(
        MemoryRouter,
        { initialEntries: ["/dashboard"] },
        createElement(DashboardLayout, {
          user: { name: "Runtime User", role: "learner" },
          children: createElement(
            "main",
            { id: "main-content", "data-testid": "dashboard-children" },
            "dashboard-child",
          ),
        }),
      ),
    ),
  );

  window.__ACTUAL_DASHBOARD_MOUNTED__ = true;
}

void boot();
