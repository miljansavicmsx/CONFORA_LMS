import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { cspPreviewPlugin } from "../../vite-csp-preview.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "../..");
const stubs = path.join(__dirname, "stubs");

/**
 * Bounded CSP runtime harness config.
 * Imports the real DashboardLayout while stubbing Header/Sidebar and the four
 * missing module boundaries as test-local aliases (not production shims).
 */
export default defineConfig({
  root: __dirname,
  plugins: [react(), cspPreviewPlugin()],
  resolve: {
    alias: [
      {
        find: /^@\/components\/layout\/Header$/,
        replacement: path.join(stubs, "Header.tsx"),
      },
      {
        find: /^@\/components\/layout\/Sidebar$/,
        replacement: path.join(stubs, "Sidebar.tsx"),
      },
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
      {
        find: "@",
        replacement: path.join(frontendRoot, "src"),
      },
    ],
  },
  build: {
    outDir: path.join(frontendRoot, ".csp-dashboard-runtime-dist"),
    emptyOutDir: true,
  },
  server: {
    port: 4175,
    strictPort: true,
  },
  preview: {
    port: 4175,
    strictPort: true,
    host: "127.0.0.1",
  },
});
