# CONFORA-REPO-HEALTH-1 — Generated / Heavy Local Trees

Audit measured approximate file counts and sizes for common generated folders. **No deletion performed.**

## Likely generated / dependency / cache

| Path | Present | Approx files | Approx size | Already ignored? |
|------|:-------:|-------------:|------------:|:----------------:|
| `node_modules/` | Yes | 90,621 | ~2,005.9 MB | Yes (`**/node_modules/`) |
| `frontend-app/node_modules/` | Yes | 30,000 | ~352.5 MB | Yes |
| `apps/api/node_modules/` | Yes | 63 | ~0.1 MB | Yes |
| `apps/web/node_modules/` | Yes | 33 | ~0 MB | Yes |
| `frontend-app/dist/` | Yes | 80 | ~3.8 MB | Yes (`frontend-app/dist/`) |
| `apps/api/dist/` | Yes | 1,681 | ~7.7 MB | Partial — root `dist/` rule may not cover `apps/api/dist` depending on pattern; **treat as generate** |
| `.turbo/` | Yes | 492 | ~0.8 MB | Yes (`.turbo/`) |
| `.tools/` | Yes | 663 | ~602 MB | **No** — gap |
| `.local-backups/` | Yes | 1 | ~1.5 MB | **No** — gap |
| `backend/.venv/` | Yes | (venv tree) | large possible | Not covered by root ignore explicitly |
| `dist/` (repo root) | No | — | — | Yes |
| `build/` | No | — | — | Yes |
| `.cache/` | No | — | — | Not listed; propose add |
| `coverage/` | No | — | — | Yes (`coverage/`) |
| `playwright-report/` | No | — | — | Yes |
| `test-results/` | No (root) | — | — | Yes |
| `frontend-app/test-results/` | Yes | 1 | ~0 | Yes |
| `logs/` | No | — | — | Yes |
| `tmp/` | No | — | — | Yes |
| `frontend-app/.vite/` | No | — | — | Yes |

## Contribution to the 6.22 GB workspace

Largest observed contributors in this audit:

1. Root `node_modules` (~2.0 GB)
2. `.tools` (~0.6 GB)
3. `frontend-app/node_modules` (~0.35 GB)
4. Remaining monorepo source, evidence, backups, venvs, dist outputs

## Guidance

- Safe to regenerate: `node_modules`, `dist`, `.turbo`, Playwright reports/results, coverage.
- `.tools` / DynamoDB Local: re-downloadable tooling; keep ignored.
- `.local-backups`: local disaster recovery only; never commit SQL dumps.
- Do **not** delete evidence under `docs/evidence/`.
