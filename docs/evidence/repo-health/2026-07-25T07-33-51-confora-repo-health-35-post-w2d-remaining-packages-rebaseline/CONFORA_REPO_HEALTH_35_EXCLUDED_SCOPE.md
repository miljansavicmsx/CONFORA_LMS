# CONFORA-REPO-HEALTH-35 — Excluded Scope

## Must not enter RH36 (or any immediate “next import”) without a dedicated wave

| Path / area | Reason |
|-------------|--------|
| `packages/notification-templates/templates/**/hr.mjml` (×3) | Deferred i18n authenticity (RH32–34) |
| `packages/database/**` | Migrations/schema — DEFER |
| `packages/ai-client/**` | Network/Bearer + compiled `src/*.js` — REVIEW_REQUIRED first |
| `packages/ai-prompts/**` | AI prompt governance — REVIEW_REQUIRED (after i18n integrity) |
| `packages/ai-governance/**` | README stub — DO_NOT_IMPORT |
| `packages/audit/**` | README stub — DO_NOT_IMPORT |
| `packages/auth/**` | README stub — DO_NOT_IMPORT |
| `packages/types/**` | README stub — DO_NOT_IMPORT |
| Closed packages (`config`, `shared-types`, `shared-kernel`, `audit-client`, `sdk`, `ui`, `notification-templates` src/EN MJML) | Already closed — no re-import |
| `apps/**`, `frontend-app/**`, terraform, scripts | Runtime integration out of shared-package wave |
| `package.json` / `pnpm-lock.yaml` / workspace / `.gitignore` edits | Forbidden for RH35; not required for RH36 i18n audit |
| `dist/`, `node_modules/`, `*.js.map`, `tsbuildinfo` | Generated/vendor — never import |

## Explicit excluded files list (summary.json)

See `excluded_files` in `summary.json` for the machine-readable list used by this rebaseline.
