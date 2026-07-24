# CONFORA-REPO-HEALTH-22 — Disclosure i18n Review

**File:** `packages/ui/src/ai-disclosure.tsx`

## Checklist

| Requirement | Result |
|-------------|--------|
| No mandatory English default `"AI-assisted"` | **PASS** — string absent |
| No mandatory English banner paragraph | **PASS** — prior banner string absent |
| No hardcoded visible product text | **PASS** — JSX text nodes are `{mark}` / `{visible}` only |
| Visible text via props and/or children | **PASS** — discriminated union requires `message` and/or `children` |
| Children takes precedence | **PASS** — `const visible = children ?? message` |
| Optional mark consumer-supplied | **PASS** — `mark?: string`; omitted by default |
| Decorative mark `aria-hidden` | **PASS** — when `mark` provided |
| Pill variant supported | **PASS** — `variant?: 'pill' \| 'banner'`; default `'pill'` (layout only) |
| Banner variant supported | **PASS** |
| Presentational only | **PASS** |
| React type-only imports | **PASS** — `import type { HTMLAttributes, ReactNode }` |

## Residual notes (non-blocking)

- Default `variant = 'pill'` and `className = ''` are layout/API defaults, not product English.
- Product apps remain responsible for locale strings that meet AI-governance meaning (documented in JSDoc).
- Residual product guardrail (same class as SkipToMainLink): consumers must pass translated `message`/`children`.

## Verdict

**i18n rework verified.** Mandatory English product defaults removed.
