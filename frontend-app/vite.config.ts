import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { cspPreviewPlugin } from "./vite-csp-preview.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function testLocalMissingModuleAliases(): Array<{ find: RegExp; replacement: string }> {
  // DR4-08: Vitest/E2E-local aliases for modules absent from the tracked tree.
  // A real source file always wins. Production builds do not set this mode.
  const stubs = path.resolve(__dirname, "./e2e/csp-dashboard-runtime/stubs");
  const absent = (srcRelative: string, stubFile: string) => {
    const base = path.resolve(__dirname, "src", srcRelative);
    const present = [".ts", ".tsx", "/index.ts", "/index.tsx"].some((suffix) =>
      existsSync(`${base}${suffix}`),
    );
    if (present) {
      return [];
    }
    const escaped = srcRelative.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return [
      {
        find: new RegExp(`^@/${escaped}$`),
        replacement: path.join(stubs, stubFile),
      },
    ];
  };
  return [
    ...absent("components/ui/tooltip", "tooltip.tsx"),
    ...absent("contexts/WorkspaceContext", "WorkspaceContext.tsx"),
    ...absent("lib/jwt-payload", "jwt-payload.ts"),
    ...absent("lib/permissions", "permissions.ts"),
    ...absent("lib/api-reports", "api-reports.ts"),
    ...absent("lib/api-grievances", "api-grievances.ts"),
    ...absent("lib/api-recertification", "api-recertification.ts"),
    ...absent("lib/api-staff-cert-registry", "api-staff-cert-registry.ts"),
    ...absent("lib/admin-education-api", "admin-education-api.ts"),
    ...absent("components/education/EducationCharts", "EducationCharts.tsx"),
    ...absent("pages/dashboard/AdminEducationGuard", "AdminEducationGuard.tsx"),
    ...absent("pages/dashboard/IdentityReviewGuard", "IdentityReviewGuard.tsx"),
    ...absent("pages/admin/IdentityReviewPage", "IdentityReviewPage.tsx"),
  ];
}

export default defineConfig(({ command, mode }) => {
  const smokeAliasesRequested = process.env.PLAYWRIGHT_F4_SMOKE === "1";
  if (command === "build" && mode === "production" && smokeAliasesRequested) {
    throw new Error(
      "Refusing production build: PLAYWRIGHT_F4_SMOKE aliases absent modules to test stubs.",
    );
  }
  const vitestLocal =
    mode === "test" ||
    process.env.VITEST === "true" ||
    process.env.VITEST === "1" ||
    (smokeAliasesRequested && mode !== "production");

  return {
    plugins: [react(), cspPreviewPlugin()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes("node_modules")) {
              return;
            }
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            if (id.includes("@tiptap")) {
              return "vendor-tiptap";
            }
            if (id.includes("video.js") || id.includes("videojs")) {
              return "vendor-video";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("react-dom") || id.includes("/react/")) {
              return "vendor-react";
            }
            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: [
        ...(vitestLocal ? testLocalMissingModuleAliases() : []),
        {
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
      ],
    },
    server: {
      port: 3001,
      host: true,
    },
    test: {
      environment: "jsdom",
      globals: false,
      include: ["src/**/*.test.{ts,tsx}"],
      exclude: ["e2e/**", "**/*.spec.ts"],
      setupFiles: [
        "./src/test/vitest-resize-observer.ts",
        "./src/test/vitest-axios-adapter.ts",
        "./src/test/vitest-fetch-guard.ts",
      ],
    },
  };
});
