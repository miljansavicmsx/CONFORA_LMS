# Validation plan (R0-7B1 and R0-7B2)

## R0-7B1 (this task)

- [x] Integration tip `adbbbb99…`
- [x] PR #4 merged
- [x] Tracked working tree clean
- [x] Tracked/untracked inventories complete
- [x] Clean worktree frozen install fails as expected
- [x] Temporary worktree removed
- [x] No lockfile/manifest/workflow mutation
- [x] Evidence JSON parses

## R0-7B2 (future)

- Clean worktree zero untracked
- pnpm 9.14.2 proven
- Lockfile regenerates without untracked importers
- Frozen install succeeds on clean clone
- Diff limited to allowlist
- Workflow pnpm versions standardized / SHA-pinned if touched
- No deploy-backend runs; production unauthorized
