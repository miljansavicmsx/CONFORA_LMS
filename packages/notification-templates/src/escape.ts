/**
 * Pure HTML / plain-text escaping for notification template variables.
 * No DOM, browser globals, network, process.env, or side effects.
 */

const HTML_ESCAPES: ReadonlyArray<readonly [RegExp, string]> = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#39;'],
];

/** Escape a string for insertion into HTML / MJML text nodes. */
export function escapeHtmlText(value: string): string {
  let out = String(value);
  for (const [pattern, replacement] of HTML_ESCAPES) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/**
 * Sanitize plain-text email subjects (header injection hardening).
 * Does not HTML-escape — subjects are not MJML/HTML body context.
 */
export function sanitizePlainTextSubject(value: string): string {
  return String(value).replace(/[\r\n\u0000]+/g, ' ').trim();
}
