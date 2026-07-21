# CONFORA-REPO-HEALTH-13 — Bulk import guard

## Current pushed commit (`12ae6a67`)

| Check | Result |
|-------|--------|
| File count | **7** |
| Max blob size | 3449 bytes (`eslint.config.mjs`) |
| Null-byte / binary blobs | **none** |
| Forbidden path classes | **none** |

## Accidental bulk local commit (not in current history)

| Field | Value |
|-------|-------|
| Orphaned hash (reflog) | `0150f90c` |
| Same subject line | `chore(repo): add shared config tooling` |
| Approx files | **105505** |
| Reachable from HEAD? | **no** (git `merge-base --is-ancestor` exit 1) |
| Reachable from origin branch? | **no** |
| Present in branch `git log`? | **no** (count 0) |
| Reflog sequence | commit `0150f90c` → `reset` to `origin/...` (`213a9853`) → controlled recommit `12ae6a67` |

### Bulk commit category samples (orphan only — not pushed)

| Prefix | Approx files in `0150f90c` |
|--------|---------------------------:|
| `docs/evidence/ui-shell/` | 7213 |
| `apps/` | 899 |
| `frontend-app/` | 787 |
| `scripts/` | 250 |
| `tests/` | 58 |
| `terraform/` | 4 |
| `packages/config/` | 7 |
| Also noted in `--stat` head | root `.docx` binary |

## Guard verdict

| Field | Value |
|-------|-------|
| `accidental_bulk_commit_in_current_history` | **false** |
| `large_binary_committed` (in W2C-1) | **false** |
| `docs_evidence_ui_shell_imported` (W2C-1) | **false** |
| `terraform_imported` (W2C-1) | **false** |
