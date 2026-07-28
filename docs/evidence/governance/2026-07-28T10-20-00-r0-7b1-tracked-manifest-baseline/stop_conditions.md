# Stop conditions (R0-7B2)

Stop implementation and escalate to owner if any occur:

1. Unexpected workspace membership (untracked package.json appears in clean worktree).
2. Lifecycle scripts with external side effects during lockfile-only stage despite `--ignore-scripts`.
3. Evidence that an untracked manifest influenced regeneration.
4. Unexpected package additions beyond tracked manifest closure.
5. Large unexplained transitive dependency churn without inventory justification.
6. Platform-specific lockfile divergence between CI Linux and regeneration host that cannot be reconciled.
7. Any application source, Docker, schema, or migration file change appears in the diff.
8. Generated files become tracked unintentionally.
9. deploy-backend runs or production authorization flips true.
10. OD-R07-2/3/4 violated (`packages/database`, wrong a11y target, FastAPI backend introduction).
