import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { cspPreviewPlugin } from "./vite-csp-preview.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function testLocalMissingModuleAliases(): Array<{ find: RegExp; replacement: string }> {
  // DR4-08: Vitest/E2E-local aliases for modules absent at e8cd567.
  // Never create production shims at these src paths.
  const stubs = path.resolve(__dirname, "./e2e/csp-dashboard-runtime/stubs");
  return [
    {
      find: /^@\/components\/ui\/tooltip$/,
      replacement: path.join(stubs, "tooltip.tsx"),
    },
    {
      find: /^@\/contexts\/WorkspaceContext$/,
      replacement: path.join(stubs, "WorkspaceContext.tsx"),
    },
    {
      find: /^@\/lib\/jwt-payload$/,
      replacement: path.join(stubs, "jwt-payload.ts"),
    },
    {
      find: /^@\/lib\/permissions$/,
      replacement: path.join(stubs, "permissions.ts"),
    },
  ];
}

export default defineConfig(({ mode }) => {
  const vitestLocal =
    mode === "test" || process.env.VITEST === "true" || process.env.VITEST === "1";

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
