# CONFORA-REPO-HEALTH-20 — Residual guardrails

## SkipToMainLink i18n residual

| Item | Detail |
|------|--------|
| Default | `label = 'Skip to main content'` |
| Override | `label` and/or `children` props |
| Acceptable because | Product can pass translated strings |
| Guardrail | Product consumers **must** pass translated `label`/`children` — do not ship English default in CONFORA UI |

| Field | Value |
|-------|-------|
| `skip_link_i18n_residual_guardrail` | `label_or_children_must_be_passed_by_product_consumers` |

## Still excluded (must remain)

| Path | Status |
|------|--------|
| `packages/ui/src/ai-disclosure.tsx` | untracked — REWORK_REQUIRED (hardcoded English) |
| `packages/ui/src/index.ts` | untracked — barrel NO-GO until disclosure rework |
| `packages/notification-templates/**` | untracked / deferred |

## Package surface note

W2D-1 is a **partial** UI source import. Public barrel `@confora/ui` (`.`) is incomplete until `index.ts` + disclosure are approved later. `./tokens` and CSS pipeline remain available via already-tracked package.json exports.
