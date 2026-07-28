# Validation plan for later R0-7 tasks

1. Clean clone / worktree from integration tip only.
2. `pnpm install --frozen-lockfile` must succeed (R0-7B).
3. Spin ephemeral pgvector with quoted health-cmd; prove `pg_isready` (R0-7C).
4. Run tracked a11y entrypoints without local untracked files (R0-7D).
5. Run quality canonical lane; assert legacy lanes excluded (R0-7E).
6. Confirm `deploy-backend` still workflow_dispatch-only; zero prod deploys.
7. Confirm OQ-3/4/5/6/7 and C-03 unchanged by CI reconstruction.
8. Independent review before R0-7F enforcement.
