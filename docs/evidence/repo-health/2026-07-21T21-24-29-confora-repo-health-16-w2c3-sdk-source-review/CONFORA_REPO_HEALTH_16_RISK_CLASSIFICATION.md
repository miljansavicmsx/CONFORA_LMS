# CONFORA-REPO-HEALTH-16 — Risk classification

| Path | Class | Notes |
|------|-------|-------|
| `packages/sdk/src/generated/schema.ts` | **W2C-3 safe now** | Generated-slot stub only; empty `paths`; comment points to future `pnpm --filter @confora/sdk generate` |
| `packages/sdk/src/index.ts` | **review before import** → include in W2C-3 | Handwritten transport placeholder; `baseUrl` from caller config; relative endpoint `/openapi/json`; **no** Authorization/token provider |
| Defer within package | **none** | |

## Attention themes

| Theme | Finding |
|-------|---------|
| API client transport | Single `fetch` to `${baseUrl}/openapi/json` |
| Endpoint paths | Relative `/openapi/json` only — not a production domain hardcode |
| Auth header / token provider | **absent** |
| Generated vs handwritten | Stub schema (generated slot) + handwritten index |
| Test fixtures | none present |
| Hardcoded base URLs | **none** (`z.string().url()` on config) |
| Token/JWT/password/api_key wording | **none** in candidates |

## Out of scope (not proposed)

ui, notification-templates, database, auth, AI, apps, frontend-app, scripts/ops, terraform, docs/evidence bulk.
