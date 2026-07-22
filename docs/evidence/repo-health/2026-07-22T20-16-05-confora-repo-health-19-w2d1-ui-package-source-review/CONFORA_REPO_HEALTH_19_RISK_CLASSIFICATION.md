# CONFORA-REPO-HEALTH-19 — Risk classification

| Path | Class | Rationale |
|------|-------|-----------|
| `packages/ui/tokens.ts` | **IMPORT_CANDIDATE** | Pure design tokens; no network/auth; no user copy |
| `packages/ui/src/styles.css` | **IMPORT_CANDIDATE** | Tailwind entry; expected package CSS input |
| `packages/ui/src/button.tsx` | **IMPORT_CANDIDATE** | Presentational button; type-only React import |
| `packages/ui/src/skip-to-main-link.tsx` | **IMPORT_CANDIDATE** | A11y skip link; defaults overridable; fragment href only |
| `packages/ui/src/ai-disclosure.tsx` | **REWORK_REQUIRED** | Hardcoded English disclosure strings vs CONFORA i18n rule |
| `packages/ui/src/index.ts` | **REWORK_REQUIRED** | Barrel re-exports `AiDisclosure`; hold until disclosure reworked or export split |

| Class | Paths |
|-------|-------|
| IMPORT_CANDIDATE | tokens, styles, button, skip-to-main-link |
| REWORK_REQUIRED | ai-disclosure, index |
| DEFER | _(none in UI scope)_ |
| DO_NOT_IMPORT | out-of-scope packages (see DO_NOT_IMPORT.md) |

## Dependency note

No forbidden out-of-scope package imports found. Only `react` type imports + relative `./` barrel paths.
