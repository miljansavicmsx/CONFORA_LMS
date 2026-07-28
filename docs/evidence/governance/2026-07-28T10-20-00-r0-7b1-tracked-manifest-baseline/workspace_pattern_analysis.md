# Workspace-pattern analysis

**Source:** tracked `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## Glob membership

| Glob | Tracked matches (clean clone) | Local untracked matches |
|------|-------------------------------|-------------------------|
| `apps/*` | `apps/api` only | `apps/admin`, `apps/web`, `apps/worker`, `apps/examiner` |
| `packages/*` | 10 tracked packages (excl. database) | `packages/database` |

## Clean clone vs local tree

| Environment | Workspace projects observed |
|-------------|----------------------------|
| Clean worktree @ `adbbbb99` | **12** (root + api + 10 packages) |
| Developer tree with untracked apps | Would also discover untracked `apps/*` and `packages/database` if present |

**Conclusion:** clean clone and dirty local trees produce **different** workspace membership when untracked manifests exist under `apps/*` or `packages/*`.

## Does workspace config itself must change in R0-7B2?

| Option | Mandatory? | Notes |
|--------|------------|-------|
| Leave globs unchanged | Default | Clean-worktree regeneration alone excludes untracked dirs — **no workspace-policy change required** to drop untracked importers |
| Add `frontend-app` | **Owner decision** | OD-R07-3 names `frontend-app` as a11y authority but it is outside globs today |

Excluding untracked directories requires **only clean-worktree regeneration**, not a workspace-policy change.

R0-7B1 does **not** modify workspace patterns.
