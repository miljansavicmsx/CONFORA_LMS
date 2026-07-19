# CONFORA-REPO-HEALTH-1 — Summary

| Item | Value |
|------|-------|
| Task | `CONFORA_REPO_HEALTH_1` |
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| HEAD (at audit) | `7e25072` |
| Evidence | `docs/evidence/repo-health/2026-07-19T05-53-16-confora-repo-health-1/` |
| Cleanup executed | **false** |
| Final verdict | `CONFORA_REPO_HEALTH_1_AUDIT_ONLY_READY_FOR_REVIEW` |

## Key counts

| Metric | Value | Notes |
|--------|------:|-------|
| Tracked files | **705** | `git ls-files` |
| `git status --porcelain` entries | **1682** | Operator baseline reported 1680; measured 1682 |
| Modified tracked | **8** | See tracked/untracked doc |
| Untracked status entries | **1674** | Includes directories/files shown by porcelain |
| Local folder files (reported) | **276,800** | Operator measurement |
| Local folder size (reported) | **6.22 GB** | Operator measurement |
| Git object store (reported) | **518.60 MiB** loose objects | Operator measurement |

## Biggest findings (one line each)

1. **Working tree is mostly untracked relative to the 705-file tracked set** — large `docs/`, `frontend-app/`, `scripts/`, `apps/` trees appear as `??`.
2. **Root `.gitignore` exists locally but is not tracked** (`git ls-files` does not know `.gitignore`) — clones may miss ignore rules.
3. **Heavy generated trees dominate disk**: root `node_modules` (~90k files / ~2.0 GB), `frontend-app/node_modules` (~30k / ~352 MB), `.tools` (~663 / ~602 MB).
4. **Local-only risk files present and untracked**: `tmp-keycloak-setup-output.txt`, `Screenshot 2026-07-14 213452qr.png`, inventory dumps `repo-status-snapshot.txt` / `repo-tracked-files.txt`.
5. **Evidence should remain** but needs retention policy — 70 top-level domains under `docs/evidence/`; 511 evidence files already tracked; 411 additional untracked evidence entries.

## Immediate recommendations (propose only)

1. Track and harden `.gitignore` (proposed patch in this package — **not applied**).
2. Never commit QR/screenshot/keycloak temp/env local files.
3. Review safe cleanup plan before deleting any local generated trees.
4. Decide intentional sync strategy for large untracked source trees vs tracked subset.
