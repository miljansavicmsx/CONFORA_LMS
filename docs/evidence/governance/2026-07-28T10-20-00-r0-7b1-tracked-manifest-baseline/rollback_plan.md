# Rollback plan

## R0-7B1

Evidence-only branch. Rollback = do not merge; delete remote branch if abandoned.

## R0-7B2 (future)

1. Revert the lockfile commit(s) on the integration branch.
2. If workflows were changed, revert those commits independently.
3. Re-run clean `pnpm install --frozen-lockfile` to confirm return to prior failing or prior state as intended.
4. Do not force-push shared integration history.
