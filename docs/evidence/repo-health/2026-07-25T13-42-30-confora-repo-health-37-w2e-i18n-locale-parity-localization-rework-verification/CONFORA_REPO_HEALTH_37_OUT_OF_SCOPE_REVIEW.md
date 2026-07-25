# CONFORA-REPO-HEALTH-37 — Out of Scope Review

## Tracked modifications outside expected 14 files

`git diff --name-only HEAD` against out-of-scope paths → **empty**.

| Path pattern | Modified? |
|--------------|-----------|
| `packages/i18n/src/**` | **no** |
| `packages/i18n/package.json` / `test/**` | **no** |
| root `package.json` | **no** |
| `pnpm-lock.yaml` / `pnpm-workspace.yaml` | **no** |
| `apps/**` | **no** (pre-existing untracked trees only) |
| `packages/ui/**` | **no** |
| `packages/notification-templates/**` tracked | **no** |
| `packages/database/**`, `auth/**`, `ai-*/**`, `audit/**`, `sdk/**`, `config/**` | **no** |

## notification-templates / HR MJML

Still only the 3 deferred untracked `hr.mjml` files. **Not imported.**

## Staging

`git diff --cached --name-only` empty after verification.

`out_of_scope_files_modified: []`  
`packages_i18n_src_modified: false` · `package_json_modified: false` · `lockfile_modified: false` · `workspace_modified: false` · `notification_templates_modified: false` · `hr_mjml_imported: false`
