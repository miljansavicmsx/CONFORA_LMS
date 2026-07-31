# Lockfile generation procedure

1. Temporary worktree from `def96f623124b2511f277eb6fa9edf8356d2ed5f` (tracked-only; status empty).
2. Activated pnpm via `npx pnpm@9.14.2` → `9.14.2`.
3. Command:

   `pnpm install --lockfile-only --ignore-scripts`

4. Exit code **0**.
5. Diff inspected: only `pnpm-lock.yaml` modified in worktree.
6. Copied lockfile to implementation branch; worktree later removed.
