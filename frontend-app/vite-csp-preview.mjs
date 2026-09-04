import { buildContentSecurityPolicy } from '../packages/config/csp/build-csp.mjs';

/**
 * Vite preview plugin — production-mode CSP for a11y+CSP CI (nonce + report-uri).
 */
export function cspPreviewPlugin() {
  return {
    name: 'confora-csp-preview',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const nonce = crypto.randomUUID().replace(/-/g, '');
        const apiOrigin = process.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
        const isProd = process.env.NODE_ENV === 'production';
        const mode = process.env.CSP_MODE ?? 'report-only';
        const { headerName, value } = buildContentSecurityPolicy({
          nonce,
          apiOrigin,
          isProd: true,
          mode,
        });
        if (headerName && value) {
          res.setHeader(headerName, value);
          res.setHeader('x-nonce', nonce);
        }
        next();
      });
    },
  };
}
