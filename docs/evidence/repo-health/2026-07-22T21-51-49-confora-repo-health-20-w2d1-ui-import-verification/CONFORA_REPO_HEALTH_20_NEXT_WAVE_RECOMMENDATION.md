# CONFORA-REPO-HEALTH-20 — Next wave recommendation

## Recommended next action

`REVIEW_UI_DISCLOSURE_I18N_REWORK_BEFORE_BARREL_IMPORT_OR_START_NOTIFICATION_TEMPLATE_REVIEW`

## Prefer either

1. **RH21 / W2D-1R** — UI disclosure i18n rework review (then barrel `index.ts` only after GO), **or**
2. **W2D-2** — notification templates source review

## Explicit non-recommendation

- Do **not** import `packages/ui/src/index.ts` until `ai-disclosure.tsx` is reworked for i18n (or exports are split).
- Do **not** import `ai-disclosure.tsx` as-is.
- Do **not** broad-add `packages/ui/` or notification templates.
