# Clean worktree experiment

**Evidence class:** clean-worktree experiment.

## Setup

- Temporary worktree from `adbbbb998c592f1f88dc062a3fdd9fb31ffebdb4`
- Path: `%TEMP%/confora-r0-7b1-clean-wt`
- Untracked file count after checkout: **0**
- No local untracked files copied

## Versions recorded

| Tool | Value |
|------|--------|
| Node | `v24.13.1` |
| Corepack | `0.34.6` |
| Host `pnpm -v` after `corepack prepare pnpm@9.14.2 --activate` | still `9.15.0` on this host PATH |
| `npx pnpm@9.14.2 -v` | `9.14.2` |

## Non-mutating discovery

`pnpm m ls --depth -1` listed **12** workspace projects:

- `confora` (root)
- `@confora/api`
- 10 tracked `@confora/*` packages under `packages/*`

`frontend-app` / `confora-frontend-app` **not** listed (outside workspace globs).

## Frozen install

Command: `pnpm install --frozen-lockfile`

Result: **FAIL** exit 1 — `ERR_PNPM_OUTDATED_LOCKFILE`

Failure reason matches root specifier drift (`jsqr`, `pngjs` in lockfile only).

## Safe mechanisms available for R0-7B2

From `pnpm install --help`:

- `--lockfile-only` — update lockfile without downloading packages
- `--ignore-scripts` — skip lifecycle scripts
- `--frozen-lockfile` — validation after regeneration

**Recommendation:** stage with `pnpm install --lockfile-only --ignore-scripts` using pnpm `9.14.2`, then validate with clean `pnpm install --frozen-lockfile`.

## Cleanup

Temporary worktree removed via `git worktree remove --force`. No generated lockfile persisted into the primary tree.
