import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * 028D-2aS2R — reproducible validation config.
 * Integration `vite.config.ts` imports missing `vite-csp-preview.mjs`; this
 * scoped config avoids that dependency for complaint auth/client unit tests.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    include: [
      "src/lib/api/__tests__/auth-token-provider.test.ts",
      "src/lib/api/__tests__/complaints-client.test.ts",
    ],
  },
});
