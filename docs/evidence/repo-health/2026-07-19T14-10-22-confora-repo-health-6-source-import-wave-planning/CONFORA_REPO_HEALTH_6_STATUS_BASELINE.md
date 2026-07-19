# CONFORA-REPO-HEALTH-6 — Status baseline

| Field | Value |
|-------|-------|
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| HEAD | `6fc1152` (`chore(repo): ignore local generated repo-health artifacts`) |
| Dirty tracked files | 0 |
| Status entries (`git status --porcelain`) | **1646** |
| All status entries untracked | yes |
| Full untracked file count (`git ls-files --others --exclude-standard`) | **105561** |

## Why counts differ

| View | Count | Meaning |
|------|------:|---------|
| Porcelain status | 1646 | Directory-collapsed / path-group view |
| Expanded untracked files | 105561 | Every file; dominated by `docs/evidence` |

## Already tracked (partial)

| Root | Tracked files (approx) |
|------|-----------------------:|
| `apps/api` | 12 |
| `frontend-app` | 99 |
| `packages` | 51 |
| `scripts` | 31 |
| `docs` | 558 |

Workspace meta + hardened `.gitignore` + RH5 local-generated ignores are already in place. This task plans **source/evidence import waves only**.
