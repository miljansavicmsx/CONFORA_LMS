import { buildContentSecurityPolicy } from '../packages/config/csp/build-csp.mjs';

/**
 * Inject a CSP nonce onto script tags that do not already declare one.
 * Only mutates HTML strings; callers must restrict to text/html responses.
 *
 * @param {string} html
 * @param {string} nonce
 * @returns {string}
 */
export function injectScriptNonces(html, nonce) {
  if (typeof html !== 'string' || typeof nonce !== 'string' || nonce.length === 0) {
    return html;
  }
  // Escape attribute value (nonce is hex from UUID; still escape quotes defensively).
  const safeNonce = nonce.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return html.replace(/<script\b([^>]*)>/gi, (full, attrs) => {
    if (/\bnonce\s*=/i.test(attrs)) {
      return full;
    }
    const trimmed = attrs.trim();
    const spacer = trimmed.length > 0 ? ' ' : '';
    return `<script${spacer}${trimmed} nonce="${safeNonce}">`;
  });
}

/**
 * Vite preview plugin — production-mode CSP for a11y+CSP CI (nonce + report-uri).
 * Default mode is enforce (remediates historical report-only default residual).
 * Rewrites text/html responses so the Vite entry script carries the same request nonce.
 */
export function cspPreviewPlugin() {
  return {
    name: 'confora-csp-preview',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const nonce = crypto.randomUUID().replace(/-/g, '');
        const apiOrigin = process.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
        const mode = process.env.CSP_MODE ?? 'enforce';
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

        const originalWrite =
          typeof res.write === 'function' ? res.write.bind(res) : null;
        const originalEnd = typeof res.end === 'function' ? res.end.bind(res) : null;
        if (!originalWrite || !originalEnd) {
          next();
          return;
        }
        /** @type {Buffer[]} */
        const chunks = [];
        let intercepting = false;

        const shouldRewrite = () => {
          const ct = String(res.getHeader('content-type') ?? '');
          return ct.toLowerCase().includes('text/html');
        };

        const flushRewritten = (encoding) => {
          const raw = Buffer.concat(chunks).toString(encoding || 'utf8');
          const rewritten = injectScriptNonces(raw, nonce);
          return Buffer.from(rewritten, encoding || 'utf8');
        };

        res.write = (chunk, encoding, cb) => {
          if (!intercepting) {
            intercepting = shouldRewrite();
          }
          if (!intercepting) {
            return originalWrite(chunk, encoding, cb);
          }
          if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding || 'utf8'));
          }
          if (typeof encoding === 'function') {
            encoding();
          } else if (typeof cb === 'function') {
            cb();
          }
          return true;
        };

        res.end = (chunk, encoding, cb) => {
          if (!intercepting) {
            intercepting = shouldRewrite();
          }
          if (!intercepting) {
            return originalEnd(chunk, encoding, cb);
          }
          if (chunk) {
            const enc = typeof encoding === 'string' ? encoding : 'utf8';
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, enc));
          }
          const enc = typeof encoding === 'string' ? encoding : 'utf8';
          const body = flushRewritten(enc);
          if (!res.headersSent) {
            res.setHeader('content-length', Buffer.byteLength(body));
          }
          const done = typeof encoding === 'function' ? encoding : cb;
          return originalEnd(body, undefined, done);
        };

        next();
      });
    },
  };
}
