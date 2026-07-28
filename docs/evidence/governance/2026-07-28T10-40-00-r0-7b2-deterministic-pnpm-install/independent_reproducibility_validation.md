# Independent reproducibility validation

## Experiment

Isolated temporary Git worktree from reviewed tip `8120874aefbf0baa17525657e43e52e205a24284`.

| Check | Result |
|-------|--------|
| Untracked files before install | Empty |
| Node | `v24.13.1` (host) |
| Corepack | `0.34.6` (host) |
| Effective pnpm | `9.14.2` via `npx --yes pnpm@9.14.2` |
| Command | `pnpm install --frozen-lockfile --ignore-scripts` |
| Exit code | `0` |
| Lockfile SHA-256 before/after | Identical → byte stability **PASS** |
| Lifecycle scripts | Not executed |

## Classification

`FROZEN_INSTALL_IGNORE_SCRIPTS_VERIFIED`

Lifecycle-enabled install: `NOT_RUN`.
