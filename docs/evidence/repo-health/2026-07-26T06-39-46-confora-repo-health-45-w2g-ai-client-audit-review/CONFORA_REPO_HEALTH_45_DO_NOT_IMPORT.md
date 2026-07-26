# CONFORA REPO HEALTH 45 — DO NOT IMPORT

## Files

| path | bytes | reason |
|------|------:|--------|
| `packages/ai-client/src/index.js` | 4,599 | compiled JS emitted into `src/`; not gitignored; can shadow `index.ts` during ESM/tsx resolution |
| `packages/ai-client/src/index.d.ts` | 5,000 | compiled declarations emitted into `src/`; duplicates the public surface of `index.ts` |
| `packages/ai-client/src/index.js.map` | 3,991 | source map for generated output |
| `packages/ai-client/tsconfig.build.tsbuildinfo` | 40,905 | incremental build state; already ignored via `*.tsbuildinfo` |

## Directories

| path | files | bytes | ignore rule |
|------|------:|------:|-------------|
| `packages/ai-client/dist` | 3 | 11,416 | `.gitignore:58 packages/**/dist/` |
| `packages/ai-client/node_modules` | 15 | 20,245 | `.gitignore:3 **/node_modules/` |
| `packages/ai-client/.turbo` | 4 | 739 | `.gitignore:35 .turbo/` |

## Standing exclusions reaffirmed (unchanged by RH45)

- `packages/notification-templates/templates/events/audit.integrity.failed/v1/hr.mjml`
- `packages/notification-templates/templates/events/report.mr_monthly_digest/v1/hr.mjml`
- `packages/notification-templates/templates/standard/v1/hr.mjml`
- `apps/api/dist/**`, `apps/api/coverage/**` and all other generated/stale artifacts (RH43A / RH44)

## Handling rule

Nothing in this list was deleted, moved, or cleaned by RH45 — the task is audit-only and the constraints forbid touching generated or untracked files. These paths must simply be **omitted from staging**, which requires explicit file-list adds (see the minimal-import-candidate report). Removing the stray `src/` build output, or extending `.gitignore` to cover `packages/*/src/**/*.js`-style emissions, should be handled as a separate hygiene task with its own evidence.
