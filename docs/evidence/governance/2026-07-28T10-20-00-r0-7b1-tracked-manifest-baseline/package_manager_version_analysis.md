# Package-manager version analysis

| Source | Value | Class |
|--------|-------|-------|
| Root `packageManager` | `pnpm@9.14.2` | tracked repository fact — **PINNED_CORRECT** |
| Root `engines.pnpm` | `>=9.14.2` | allows newer; Corepack still pins via `packageManager` |
| Local agent Node | `v24.13.1` | local condition (non-authoritative) |
| Local agent Corepack | `0.34.6` | local condition |
| Local default `pnpm -v` | `9.15.0` | local condition — **PINNED_DIFFERENT** vs declared |
| `npx pnpm@9.14.2 -v` | `9.14.2` | confirms target available |

## Corepack expectation

R0-7B2 must activate **exactly** `pnpm@9.14.2` (e.g. `corepack enable` + `corepack prepare pnpm@9.14.2 --activate`, or `npx pnpm@9.14.2`) inside the clean worktree. Do not trust a host-global `9.15.0`.

## Workflow classification

See `workflow_pnpm_inventory.md`.
