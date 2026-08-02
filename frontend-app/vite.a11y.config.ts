import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Emit `index.html` so Vite preview SPA fallback serves `/`, `/login`, `/verify`. */
function a11yIndexHtmlPlugin(): Plugin {
  return {
    name: "confora-a11y-index-html",
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist-a11y");
      const from = path.join(outDir, "index.a11y.html");
      const to = path.join(outDir, "index.html");
      if (fs.existsSync(from)) {
        fs.copyFileSync(from, to);
      }
    },
  };
}

/**
 * R0-7D2S2 — accessibility public baseline Vite config.
 * Does not modify or replace the production vite.config.ts entry.
 */
export default defineConfig({
  plugins: [react(), a11yIndexHtmlPlugin()],
  appType: "spa",
  build: {
    outDir: "dist-a11y",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "index.a11y.html"),
    },
  },
  resolve: {
    dedupe: ["react", "react-dom", "i18next", "react-i18next"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Source resolve without rewriting package.json contracts (owner: no package-contract rewrites).
      "@confora/i18n/react": path.resolve(__dirname, "../packages/i18n/src/react.tsx"),
      "@confora/i18n": path.resolve(__dirname, "../packages/i18n/src/index.ts"),
      "@confora/ui/styles.css": path.resolve(__dirname, "../packages/ui/dist/styles.css"),
      "@confora/ui": path.resolve(__dirname, "../packages/ui/src/index.ts"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      i18next: path.resolve(__dirname, "node_modules/i18next"),
      "react-i18next": path.resolve(__dirname, "node_modules/react-i18next"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 5173,
    host: true,
  },
});
