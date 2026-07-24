# CONFORA-REPO-HEALTH-27 — Escaping Rework Requirements

Applies to future W2D2R implementation of `events.ts` (and any helper modules it splits into).

## Mandatory

1. **Remove unsafe raw interpolation** — current `split/join` of `{{k}}` with untrusted `v` is forbidden for MJML/HTML.
2. **Context-aware escaping**
   - **HTML text** escape for values placed in `<mj-text>` / text nodes (`&`, `<`, `>`, `"`, `'` at minimum).
   - **Attribute** escape if any attribute placeholders are introduced later.
   - **URL** allowlist + encoding if URL placeholders are introduced (none today — keep closed unless designed).
   - **Plain-text / subject** path separate from MJML/HTML (no HTML entity requirements for subjects, but still sanitize control chars / header injection).
3. **Variable allowlist** per event/template — today shells only allow `heading`, `bodyText`, `footer`.
4. **Reject unknown variables** (or document and enforce “ignore unknown” with tests) — prefer fail-closed reject for production path.
5. **Separate subject rendering from body rendering** — different sanitizers; do not run subject through MJML interpolate.
6. **No** provider/delivery, recipient resolution, workflow decisions, or tenant routing in this module.
7. **FS strategy:** keep reads lazy (on call, not import); document Node-only; consider explicit `loadBundledEmailTemplate` entry that cannot be pulled into browser bundles.

## Acceptance tests required before import

- Escapes `<script>`, `</mj-text>`, `{{` nested attempts in vars.
- Rejects unknown keys when fail-closed.
- Subject path does not HTML-escape incorrectly but blocks CR/LF injection.
- Locale fallback behavior auditable (see i18n requirements).
