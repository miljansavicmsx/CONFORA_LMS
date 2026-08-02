import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { cspPreviewPlugin } from "./vite-csp-preview.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
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
    // R0-7D2R: file: packages live outside frontend-app/; pin shared deps to this app's node_modules.
    dedupe: ["react", "react-dom", "i18next", "react-i18next"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Resolve local file: packages from source (JS dist not required in clean checkout).
      "@confora/i18n/react": path.resolve(__dirname, "../packages/i18n/src/react.tsx"),
      "@confora/i18n": path.resolve(__dirname, "../packages/i18n/src/index.ts"),
      "@confora/ui/styles.css": path.resolve(
        __dirname,
        "../packages/ui/dist/styles.css",
      ),
      "@confora/ui": path.resolve(__dirname, "../packages/ui/src/index.ts"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      i18next: path.resolve(__dirname, "node_modules/i18next"),
      "react-i18next": path.resolve(__dirname, "node_modules/react-i18next"),
    },
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
});
