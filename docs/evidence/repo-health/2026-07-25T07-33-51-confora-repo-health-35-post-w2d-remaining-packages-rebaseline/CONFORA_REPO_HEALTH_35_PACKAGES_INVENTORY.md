# CONFORA-REPO-HEALTH-35 — Packages Inventory

Closed inventory of `packages/*` at HEAD `e8873390`.

| Package | Tracked | Untracked | Modified | package.json | src | tests | build/dist/generated on disk | README/docs |
|---------|--------:|----------:|---------:|:------------:|:---:|:-----:|:----------------------------:|:-----------:|
| `ai-client` | 0 | 8* | 0 | yes | yes | 1 on disk | yes (`dist`/compiled in `src`) | no |
| `ai-governance` | 0 | 1 | 0 | no | no | 0 | no | README |
| `ai-prompts` | 0 | 9 | 0 | yes | yes | 0 | yes (`dist`) | no |
| `audit` | 0 | 1 | 0 | no | no | 0 | no | README |
| `audit-client` | 5 | 0 | 0 | yes | yes | 1 | yes | no |
| `auth` | 0 | 1 | 0 | no | no | 0 | no | README |
| `config` | 13 | 0 | 0 | yes | tooling | 1 | yes | no |
| `database` | 0 | 75* | 0 | yes | yes | 3 on disk | yes | no |
| `i18n` | 50 | 0 | 0 | yes | yes | 1 | yes | no |
| `notification-templates` | 15 | 3 (HR MJML) | 0 | yes | yes | 4 | yes | no |
| `sdk` | 5 | 0 | 0 | yes | yes | 0 | yes | no |
| `shared-kernel` | 9 | 0 | 0 | yes | yes | 1 | yes | README |
| `shared-types` | 8 | 0 | 0 | yes | yes | 2 | yes | no |
| `types` | 0 | 1 | 0 | no | no | 0 | no | README |
| `ui` | 11 | 0 | 0 | yes | yes | 0 | yes | no |

\* Untracked counts exclude `node_modules` / typical noise where filtered by `git status --untracked-files=all` on package path; `database` sample shows migrations+schema (~75 paths).

## Totals

- Packages: **15**
- Closed (prior waves): **7**
- Remaining for classification: **8**
- `packages_inventory_completed: true`
