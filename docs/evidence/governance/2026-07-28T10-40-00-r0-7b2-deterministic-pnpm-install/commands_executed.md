# Commands executed

- `git fetch origin`; tip verification
- `git checkout -B ci/r0-7b2-deterministic-pnpm-install def96f623124b2511f277eb6fa9edf8356d2ed5f`
- Clean worktree: `pnpm install --lockfile-only --ignore-scripts` (npx pnpm@9.14.2)
- Second worktree: `pnpm install --frozen-lockfile --ignore-scripts` → exit 0
- Action SHA resolution via GitHub API for ZAP; reuse R0-7S1 pins for checkout/pnpm/node
- Two commits; push branch only
