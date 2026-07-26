# Tracked path validation

Method: `git ls-files` counts at tip `c6110f41`. Directory existence alone is
**not** treated as operational evidence.

## Critical gaps

| Path | Tracked count | Local exists | Impact |
|------|---------------|--------------|--------|
| `packages/database` | 0 | yes | database + compliance jobs cannot run on clean clone |
| `scripts/a11y/**` | 0 | yes | accessibility post-steps MODULE_NOT_FOUND |
| `tests/e2e/**` | 0 | yes | Playwright compliance/a11y suites missing |
| `tools/a11y/contrast-check.ts` | 0 | yes | `pnpm a11y:contrast` broken on clean clone |
| `apps/web`, `apps/admin` | 0 | yes | a11y + docker assume Next apps |
| `backend/**` | 0 | yes | legacy workflows + a11y compose + deploy gate |
| `infra/docker/Dockerfile.*` | 0 | yes | docker smoke builds impossible even if unskipped |
| `frontend-app/package-lock.json` | 0 | yes | `npm ci` in a11y/RC fails without lockfile |
| `scripts/ops/run-f4-8g-*.mjs` | 0 | yes | F4 gate references untracked scripts |
| `apps/api` | 20 | yes | incomplete (no `main.ts`) — post-install quality risk |
| `frontend-app` | 108 | yes | operational bridge — preferred a11y target |
| `docker-compose.a11y-ci.yml` | 1 | yes | tracked but mounts untracked backend |

Machine-readable: `tracked_path_validation.json`.
