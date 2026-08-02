/// <reference types="vite/client" />
import { ConforaI18nProvider } from "@confora/i18n/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import AppA11y from "@/App.a11y";
import "@confora/ui/styles.css";
import "@/index.css";
import { resolveInitialUiLocale } from "@/lib/locale-preference";
import { warnNestAuthPilotMisconfiguration } from "@/lib/nest-auth-pilot";

warnNestAuthPilotMisconfiguration();

const appLocale = resolveInitialUiLocale();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root nije pronađen.");
}

createRoot(rootEl).render(
  <StrictMode>
    <ConforaI18nProvider lng={appLocale} fallbackLng="en">
      <QueryClientProvider client={queryClient}>
        <AppA11y />
      </QueryClientProvider>
    </ConforaI18nProvider>
  </StrictMode>,
);
