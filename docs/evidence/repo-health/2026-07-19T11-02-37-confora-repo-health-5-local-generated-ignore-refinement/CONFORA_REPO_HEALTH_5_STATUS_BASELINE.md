# CONFORA-REPO-HEALTH-5 — Status baseline

| Field | Value |
|-------|-------|
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| HEAD | `a0b6d77` (`chore(repo): add workspace meta configuration`) |
| Dirty tracked files | 0 |
| Status entries | 1656 (1655 at audit start; +RH5 evidence package) |
| Untracked entries | 1656 |
| Prior RH1–RH4 | completed; workspace meta tracked; hardened `.gitignore` present |

## Source roots still heavily untracked (must NOT be ignored)

| Path | Untracked status entries (approx) |
|------|----------------------------------:|
| `apps/api/src` | 110 |
| `frontend-app/src` | 394 |
| `scripts/ops` | 199 |
| `packages` | 21 |
| `docs/evidence` | 411 |

These remain **source/evidence candidates** for future curated tracking — not ignore targets.
