# CONFORA REPO HEALTH 44 — Tracked Packages Inventory

Nine tracked package roots under `packages/**`. No `dist` / `node_modules` / `.turbo` files are tracked (present on disk but gitignored).

| Package | Tracked files | package.json | src / content | tests | dist/nm/turbo tracked | Status |
|---------|--------------:|:------------:|:--------------|:-----:|:---------------------:|--------|
| `packages/config` | 13 | yes | eslint/ts/prettier/csp (no `src/`) | eslint rule test | no | **CLOSED** |
| `packages/shared-types` | 8 | yes | `src/` | yes | no | **CLOSED** |
| `packages/shared-kernel` | 9 | yes | `src/` | yes | no | **CLOSED** |
| `packages/audit-client` | 5 | yes | `src/` | yes | no | **CLOSED** |
| `packages/sdk` | 5 | yes | `src/` (+ generated schema) | no | no | **CLOSED** |
| `packages/ui` | 11 | yes | `src/` | no | no | **CLOSED** |
| `packages/notification-templates` | 15 | yes | `src/` + 3 EN MJML | yes | no | **CLOSED** (HR deferred) |
| `packages/i18n` | 50 | yes | `src/` + locales | yes | no | **CLOSED** |
| `packages/ai-prompts` | 10 | yes | `src/` + 5 prompt JSON | yes | no | **CLOSED** |

## Tracked AI pattern search (`git grep`)

Only hits: `packages/ai-prompts` (loader definitions + tests). **No** tracked `apps/api` callers for `getPromptBundleV1` / `AiPurpose` / non-closed purposes.
