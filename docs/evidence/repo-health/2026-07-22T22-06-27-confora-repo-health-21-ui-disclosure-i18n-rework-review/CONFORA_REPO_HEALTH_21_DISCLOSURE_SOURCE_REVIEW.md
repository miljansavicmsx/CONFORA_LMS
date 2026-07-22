# CONFORA-REPO-HEALTH-21 — Disclosure Source Review

**File:** `packages/ui/src/ai-disclosure.tsx`  
**Status:** untracked · **Class:** `REWORK_REQUIRED`  
**Bytes:** 1238 · **SHA-256:** `7dda3a96d72fd138d84fe7669ec51bb6f91a84126684383110e45b53e30379b0`

## Structure

- React presentational function component `AiDisclosure`.
- Props: `HTMLAttributes<HTMLDivElement>` + `variant?: 'pill' | 'banner'` (default `'pill'`).
- Renders a `<div role="note" data-ai-disclosure="true">` with decorative `<span aria-hidden>AI</span>` and a text `<span>`.
- Styling via Tailwind-style `cf-*` utility class strings only.
- Dependency: `import type { HTMLAttributes } from 'react'` (type-only).

## User-facing copy (hardcoded English)

| Location | String | Risk |
|----------|--------|------|
| Decorative mark | `AI` | Low as mark; still English brand token in DOM; `aria-hidden` |
| Pill variant | `AI-assisted` | **Product UI English** — mandatory i18n violation if shipped as default |
| Banner variant | `This feature uses artificial intelligence. Outputs are suggestions — verify before relying on them.` | **Product UI English** — mandatory i18n violation |

JSDoc comment (English, not rendered): references ISO §6.5 disclosure intent — documentation only.

## i18n risk

- No props for `label` / `children` / translation keys.
- Defaults force English product strings into every consumer locale.
- Violates CONFORA frontend rule: no hardcoded UI text; use translation files / passed props.
- Contrast with already-imported `SkipToMainLink`, which accepts `label`/`children` (English default only as residual guardrail for consumers).

## AI disclosure / transparency

**Positive**

- Explicit visible disclosure surface (`role="note"`, `data-ai-disclosure`).
- Banner text frames outputs as suggestions and asks verification.
- Does **not** state that AI issues certificates or makes final certification decisions.

**Gaps / risks**

- Does not state that **human oversight is mandatory**.
- Does not state that AI **does not** make certification / competence decisions.
- Soft “verify before relying” could be read as general product advice, not ISO 17024 / AI-governance human-in-the-loop obligation.
- Decorative “AI” mark alone is insufficient disclosure for screen-reader users of pill if text were empty; currently pill text is hardcoded English (i18n issue, not a11y empty).

## Runtime / security (source-level)

| Check | Finding |
|-------|---------|
| Network / fetch | none |
| Secrets / env | none |
| Auth / RBAC / tenant | none |
| Direct DOM APIs | none (`document`, `innerHTML`, etc.) |
| `dangerouslySetInnerHTML` | none |
| XSS | text nodes are string literals; `{...rest}` can pass consumer attrs — standard React pattern, not XSS by itself |
| Business decisions | none |

## Imports / dependencies

- React types only.
- No `@confora/*` package imports.
- No coupling to apps / frontend-app / auth / certification modules.

## Verdict on current source

**Do not import.** Treat as `REWORK_REQUIRED` until i18n props (or keys) and stronger human-oversight wording are defined and implemented in a future W2D-1R task.
