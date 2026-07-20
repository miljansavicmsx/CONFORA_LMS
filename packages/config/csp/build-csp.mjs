/**
 * Shared nonce CSP builder (admin Next.js middleware + Vite preview).
 */

/**
 * @param {{
 *   nonce: string;
 *   apiOrigin: string;
 *   isProd: boolean;
 *   mode?: 'off' | 'report-only' | 'enforce';
 * }} opts
 */
export function buildContentSecurityPolicy({ nonce, apiOrigin, isProd, mode }) {
  const resolved = mode ?? (isProd ? 'enforce' : 'off');
  if (resolved === 'off') {
    return { headerName: null, value: null };
  }

  const scriptSrc = isProd
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com`
    : `'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://player.vimeo.com`;

  const styleSrc = isProd
    ? `'self' 'nonce-${nonce}' 'unsafe-inline'`
    : `'self' 'unsafe-inline'`;

  const reportUri = `${apiOrigin.replace(/\/$/, '')}/api/csp-report`;

  const value = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    `connect-src 'self' ${apiOrigin.replace(/\/$/, '')} https:`,
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `report-uri ${reportUri}`,
    `report-to csp-endpoint`,
  ].join('; ');

  const headerName =
    resolved === 'report-only' ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';

  return { headerName, value, reportUri };
}
