# Tracked manifest inventory

**Evidence class:** tracked repository fact (via `git ls-files` / `git rev-parse HEAD:path`).

Directory existence is not evidence of tracking.

## Config files

| Path | Tracked | Blob / note |
|------|---------|-------------|
| `package.json` (root) | yes | see table |
| `pnpm-workspace.yaml` | yes | `3ff5faaaf5f139c707e338e7e89e51606e9e0ace` |
| `pnpm-lock.yaml` | yes | `75c0d9bdaed9f2aece619204c3b8a8445d0c159d` |
| `.npmrc` | **no** | not in Git index |
| `.nvmrc` / `.node-version` | **no** | not observed tracked |

## Root package-manager declaration

| Field | Value |
|-------|--------|
| `packageManager` | `pnpm@9.14.2` |
| `engines` | `{'node': '>=20.10.0', 'pnpm': '>=9.14.2'}` |

## Tracked package.json (13)

| Path | Blob (prefix) | Name | Version | Private | Workspace matched | Lock importer |
|------|---------------|------|---------|---------|-------------------|---------------|
| `apps/api/package.json` | `fb92367af3bb…` | `@confora/api` | `0.0.0` | `True` | `True` | `True` |
| `frontend-app/package.json` | `ce6c016adb07…` | `confora-frontend-app` | `0.0.0` | `True` | `False` | `False` |
| `package.json` | `f31de62719b0…` | `confora` | `0.0.0` | `True` | `None` | `True` |
| `packages/ai-client/package.json` | `a615e1f1cb9a…` | `@confora/ai-client` | `0.0.0` | `True` | `True` | `True` |
| `packages/ai-prompts/package.json` | `f91eb36c1f69…` | `@confora/ai-prompts` | `0.0.0` | `True` | `True` | `True` |
| `packages/audit-client/package.json` | `09d13fb42399…` | `@confora/audit-client` | `0.0.0` | `True` | `True` | `True` |
| `packages/config/package.json` | `ae08af40eb01…` | `@confora/config` | `0.0.0` | `True` | `True` | `True` |
| `packages/i18n/package.json` | `f02f74f891cf…` | `@confora/i18n` | `0.0.0` | `True` | `True` | `True` |
| `packages/notification-templates/package.json` | `ff6e029d6dc9…` | `@confora/notification-templates` | `0.0.0` | `True` | `True` | `True` |
| `packages/sdk/package.json` | `130d42773eaa…` | `@confora/sdk` | `0.0.0` | `True` | `True` | `True` |
| `packages/shared-kernel/package.json` | `f140daecaf1c…` | `@confora/shared-kernel` | `0.0.0` | `True` | `True` | `True` |
| `packages/shared-types/package.json` | `bb02ef7e1a93…` | `@confora/shared-types` | `0.0.0` | `True` | `True` | `True` |
| `packages/ui/package.json` | `7db7c7f89f36…` | `@confora/ui` | `0.0.0` | `True` | `True` | `True` |

## Notes

- `frontend-app` is tracked and named `confora-frontend-app` but is **not** matched by `apps/*` or `packages/*`.
- Clean-worktree `pnpm m ls` listed **12** workspace projects (root + `apps/api` + 10 `packages/*`), excluding `frontend-app`.
