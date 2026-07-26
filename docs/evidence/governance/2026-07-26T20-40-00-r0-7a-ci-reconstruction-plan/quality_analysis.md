# Quality job analysis

Job: `quality` in `ci.yml`.

## Current failure

Fails at **Install** (`pnpm install --frozen-lockfile`) — RC-R07-1.

## Downstream steps never executed on PR #3

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm --filter @confora/api` jest e2e
5. PAdES / pdfcpu smoke under `apps/api`
6. `pnpm build`

## Post-install forecast (architecture-aware)

| Target | Forecast after lockfile fix |
|--------|-----------------------------|
| Tracked packages with package.json | May lint/typecheck if scripts exist |
| `apps/api` | Likely still fails build/e2e — incomplete (20 files, no `main.ts`) OQ-3 |
| `apps/web` / `apps/admin` | Not in clean clone — turbo may skip or fail if workspace expects them |
| Lockfile importers for untracked apps | Install may still pull phantom workspace members depending on recovery method |

## Lane split recommendation

- **Canonical lane:** tracked packages + declared SoT components only
- **Transitional lane:** `frontend-app` operational bridge
- **Legacy lane:** FastAPI / untracked — excluded until OD
