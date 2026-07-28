# Lifecycle script assessment

Tracked root `prepare` script runs `husky`.

Risk: mutates local git hooks inside the worktree.

Decision: **do not run** normal `pnpm install --frozen-lockfile` without `--ignore-scripts` for R0-7B2 GO.

Claim limitation: lifecycle-complete installation **not** certified.
