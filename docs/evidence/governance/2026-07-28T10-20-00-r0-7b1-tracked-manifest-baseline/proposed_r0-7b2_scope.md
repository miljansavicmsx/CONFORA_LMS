# Proposed R0-7B2 changed-file allowlist

| Candidate | Why | Intended change | Mandatory? | Security impact | Rollback | Validation |
|-----------|-----|-----------------|------------|-----------------|----------|------------|
| `pnpm-lock.yaml` | Importer/manifest drift; frozen install fails | Regenerate from tracked manifests only @ pnpm 9.14.2 | **Yes** | Removes stale untracked importers; supply-chain surface changes with resolution churn | Revert file | Clean `pnpm install --frozen-lockfile` |
| `package.json` (root) | Only if `packageManager` wrong | No change expected (`pnpm@9.14.2` already correct) | **No** (not required) | N/A | N/A | Compare to tip |
| `pnpm-workspace.yaml` | Only if owner adds `frontend-app` | Optional `frontend-app` entry | **Owner-approved only** | Expands workspace membership | Revert file | `pnpm m ls` includes frontend-app |
| `.github/workflows/confora-qa.yml` | Floating `version: 9` | Set `9.14.2`; SHA-pin actions (OD-R07-8) | **Recommended** | Reduces mutable Action/version risk | Revert workflow | Workflow parses; version grep |
| `.github/workflows/ci.yml` | Floating Action tags while version already 9.14.2 | SHA-pin when touched | **Optional / if touched** | Same | Revert | grep pins |

## Recommended maximum changed-file count

**3** (lockfile + `confora-qa.yml` + optional Action-pin touch of one additional workflow).

**4** only if owner approves `pnpm-workspace.yaml` change for `frontend-app`.

Do not automatically approve every candidate. Application, Docker, database, and untracked manifests are **out of scope**.
