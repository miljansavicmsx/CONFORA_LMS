# CONFORA-REPO-HEALTH-9 — Status after W2A

| Field | Value |
|-------|-------|
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| HEAD | `26ae4f9` |
| Dirty tracked | **0** |
| Status entries | **1630** |
| RH8 baseline (pre-W2A audit) | 1626 |
| Delta | **+4** |

## Why status count can increase after tracking manifests

Git porcelain often collapses a fully untracked directory into **one** `?? packages/…` line (or few lines). After W2A tracks selected files inside those packages:

1. Tracked manifests disappear from status (good).
2. Sibling untracked paths (`src/`, `templates/`, `database/`, AI stubs, remaining `config` tooling, etc.) become **individually visible**.
3. Net porcelain line count can **rise** even though fewer files remain untracked overall.

Current evidence of expansion:

- **24** porcelain lines still under `packages/` (e.g. `?? packages/shared-kernel/src/`, `?? packages/database/`, `?? packages/ai-client/`, …)
- **132** untracked files still under `packages/` via `git ls-files --others --exclude-standard`

So +4 status entries vs RH8 is expected directory-expansion noise, not a sign that W2A imported source.

| Field | Value |
|-------|-------|
| `status_count_increase_explained` | **true** |
