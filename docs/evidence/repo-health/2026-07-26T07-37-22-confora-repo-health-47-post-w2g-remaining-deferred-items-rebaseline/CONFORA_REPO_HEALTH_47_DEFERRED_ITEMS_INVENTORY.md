# CONFORA REPO HEALTH 47 — Deferred Items Inventory

## Generated artifacts (DO_NOT_IMPORT)

| path | reason |
|------|--------|
| `packages/ai-client/src/index.d.ts` | compiled declaration emitted into `src/`; not gitignored; can shadow `index.ts` |
| `packages/ai-client/src/index.js` | compiled JS emitted into `src/`; not gitignored |
| `packages/ai-client/src/index.js.map` | source map |

Status: untracked, confirmed not staged. These must be excluded from any add; a hygiene task should remove them or widen `.gitignore`.

## HR MJML (DEFER — localization rework pending)

| path |
|------|
| `packages/notification-templates/templates/events/audit.integrity.failed/v1/hr.mjml` |
| `packages/notification-templates/templates/events/report.mr_monthly_digest/v1/hr.mjml` |
| `packages/notification-templates/templates/standard/v1/hr.mjml` |

`git status --porcelain --untracked-files=all` on `packages/notification-templates` returns exactly these 3 files — no other untracked content in that package.

## Thin stub roots (DEFER — README-only, no package shape)

| root | untracked files | package.json | src |
|------|:---------------:|:------------:|:---:|
| `packages/ai-governance` | 1 (`README.md`) | no | no |
| `packages/audit` | 1 (`README.md`) | no | no |
| `packages/auth` | 1 (`README.md`) | no | no |
| `packages/types` | 1 (`README.md`) | no | no |

These are placeholder roots with only a README; no importable source. Low risk, defer until real source exists. Note: closed packages already cover the equivalent concerns via `audit-client`, `shared-types`, etc.

## Summary

- **DO_NOT_IMPORT:** 3 ai-client generated artifacts (+ any `dist`/`node_modules`/`.turbo`).
- **DEFER:** 3 HR MJML + 4 README stub roots.
- No deferred item is staged; nothing changed by RH47.
