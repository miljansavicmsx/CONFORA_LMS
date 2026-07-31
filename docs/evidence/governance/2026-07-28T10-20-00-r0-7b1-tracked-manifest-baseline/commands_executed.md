# Commands executed (R0-7B1)

Non-exhaustive operational log:

- `git fetch origin`
- `git rev-parse origin/fix/ca-h01-frontend-f4-cutover` → `adbbbb998c592f1f88dc062a3fdd9fb31ffebdb4`
- `gh api .../pulls/4` → merged
- `git checkout -B governance/r0-7b1-tracked-manifest-baseline adbbbb998c592f1f88dc062a3fdd9fb31ffebdb4`
- `git ls-files '**/package.json' 'package.json'`
- Filesystem scan for untracked `package.json`
- `git check-ignore -v` on candidate untracked manifests
- Python lockfile/manifest inventory parser (temporary helper; not committed)
- `git worktree add --detach %TEMP%/confora-r0-7b1-clean-wt adbbbb998c592f1f88dc062a3fdd9fb31ffebdb4`
- `pnpm m ls --depth -1`
- `pnpm install --frozen-lockfile` (expected fail)
- `pnpm install --help` (lockfile-only / ignore-scripts)
- `npx pnpm@9.14.2 -v` → 9.14.2
- `git worktree remove --force`
- Evidence authoring; single evidence-only commit; push branch

No `pnpm install` without frozen mode was used to rewrite the primary-tree lockfile.
