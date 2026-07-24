# CONFORA-REPO-HEALTH-24 — i18n Review

| Check | Result |
|-------|--------|
| `AiDisclosure` mandatory English visible product copy | **none** — PASS |
| `AiDisclosure` text via props/children | **required** — PASS |
| `SkipToMainLink` English default | **residual guardrail only** |
| Product must pass translated `label`/`children` for SkipToMainLink | **documented residual** |

## Residual (non-blocking for package integrity PASS)

`SkipToMainLink` default: `label = 'Skip to main content'`.

- Overridable via `label` or `children` (`children ?? label`).
- Product apps **must** pass translated strings in production locales.
- Guardrail code: `product_consumers_must_pass_translated_label_or_children`

## Design-token English labels

`tokens.ts` contains English `label` fields (e.g. `"Primary text"`) for design-system metadata / contrast tooling — **not** end-user UI strings rendered by `@confora/ui` components. Not counted as i18n blocking for product UI.

**i18n blocking findings:** **0**
