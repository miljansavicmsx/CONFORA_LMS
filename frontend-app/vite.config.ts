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
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
