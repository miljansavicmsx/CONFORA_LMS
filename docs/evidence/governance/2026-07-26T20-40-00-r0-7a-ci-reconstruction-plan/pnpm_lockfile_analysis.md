# PNPM and lockfile analysis (RC-R07-1)

## Observed CI error (PR #3 quality / accessibility)

`ERR_PNPM_OUTDATED_LOCKFILE` — frozen install refused because
`pnpm-lock.yaml` is not up to date with root `package.json`.

## Versions

| Source | Value |
|--------|-------|
| `package.json` packageManager | `pnpm@9.14.2` |
| CI `pnpm/action-setup` (ci.yml, accessibility.yml) | `9.14.2` |
| `confora-qa.yml` | `version: 9` (floating minor — defect) |
| Local agent host `pnpm -v` (non-authoritative) | `9.15.0` |
| Local agent host `node -v` (non-authoritative) | `v24.13.1` |
| CI Node | `20` |

## Root specifier mismatch (reproduced from tracked files)

Root `package.json` `devDependencies` keys (**12**):
`@commitlint/cli`, `@commitlint/config-conventional`, `@confora/config`,
`chrome-launcher`, `eslint`, `husky`, `lighthouse`, `lint-staged`, `prettier`,
`tsx`, `turbo`, `typescript`.

Lockfile `importers:.` **also** lists `jsqr` and `pngjs` which are **absent**
from tracked root `package.json`. CI failure reason text matches this drift.

## Workspace / importer contamination

`pnpm-workspace.yaml` includes `apps/*` and `packages/*`.

Lockfile importers include untracked package manifests:

- `apps/admin`, `apps/web`, `apps/worker`, `apps/examiner`
- `packages/database`

Tracked `package.json` files: **13** (root + `apps/api` + `frontend-app` + 10
packages excluding database).

**Conclusion:** the tracked lockfile cannot be assumed reproducible from a
clean clone of tracked manifests alone. Frozen-lockfile failure is **correct**
behavior protecting CI from silent drift.

## Minimum safe recovery boundary (R0-7B)

1. Align pnpm to declared `9.14.2` in all workflows.
2. Inventory tracked manifests only.
3. Regenerate lockfile from clean checkout of tracked files (no local untracked
   package.json influence), or surgically remove stale importers/specifiers
   with owner-approved method.
4. Prove `pnpm install --frozen-lockfile` on clean clone.
5. No application feature changes.

Do **not** regenerate the lockfile in R0-7A.
