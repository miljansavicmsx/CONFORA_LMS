# Dependency drift analysis

## Root importer vs tracked root manifest

| Direction | Packages |
|-----------|----------|
| In lockfile importer, not in tracked `package.json` | `jsqr`, `pngjs` |
| In tracked `package.json`, not in lockfile importer | _(none)_ |

This matches the CI `ERR_PNPM_OUTDATED_LOCKFILE` failure reason observed on PR #4 and reproduced in the clean worktree.

## Recommendation

Unless a tracked consumer requires them, R0-7B2 regeneration should **drop** root `jsqr`/`pngjs` rather than adding them to root `package.json`.

## Workspace contamination drift

Lockfile retains importers for five paths with no tracked manifests. Clean-worktree regeneration under OD-R07-1 is expected to remove those importers.

## frontend-app gap

Tracked `frontend-app/package.json` has **no** lockfile importer and is **outside** workspace globs — separate from root specifier drift.
