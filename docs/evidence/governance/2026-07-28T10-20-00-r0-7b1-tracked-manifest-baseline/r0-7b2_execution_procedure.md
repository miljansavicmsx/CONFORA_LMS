# R0-7B2 execution procedure (required)

1. Create clean temporary worktree from approved base (post–R0-7B1 merge tip, expected descendant of `adbbbb998c592f1f88dc062a3fdd9fb31ffebdb4`).
2. Verify `git status --porcelain` is empty (zero untracked).
3. Activate pnpm **exactly** `9.14.2` (`npx pnpm@9.14.2` or Corepack prepare/activate); record `pnpm -v`.
4. Prove tracked manifest inventory matches R0-7B1 (13 manifests; no untracked package.json present).
5. Regenerate lockfile only in that environment, preferred first stage:

   `pnpm install --lockfile-only --ignore-scripts`

6. Copy back **only** approved files to the implementation branch.
7. Verify no untracked importer remains in the new lockfile (`apps/admin|web|worker|examiner`, `packages/database` absent unless tracked).
8. In a **second** clean worktree, run `pnpm install --frozen-lockfile` and require success.
9. Inspect `git diff` — only allowlisted paths.
10. Independently compare lockfile importers to tracked manifests.
11. Execute downstream commands only after frozen install succeeds.

Do not regenerate from the developer working tree containing untracked manifests.
