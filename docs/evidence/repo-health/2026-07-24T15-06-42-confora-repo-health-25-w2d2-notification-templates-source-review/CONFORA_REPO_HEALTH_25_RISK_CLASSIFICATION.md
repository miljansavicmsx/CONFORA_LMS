# CONFORA-REPO-HEALTH-25 — Risk Classification

| Path | Class | Rationale |
|------|-------|-----------|
| `src/event-keys.ts` | **IMPORT_CANDIDATE** | Pure constants; browser-safe; SoD-friendly event taxonomy |
| `src/events.ts` | **REWORK_REQUIRED** | Node `fs`, unescaped interpolate, EN subjects for all locales |
| `src/index.ts` | **REWORK_REQUIRED** | Barrels unsafe Node loader into package root |
| `templates/**/*.mjml` (all 6) | **DEFER** | Shells structurally OK; wait for safe loader + real HR copy |

No candidate classified **DO_NOT_IMPORT** for absolute malice; package-external do-not-import list still applies.
