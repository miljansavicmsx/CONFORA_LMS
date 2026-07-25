# CONFORA-REPO-HEALTH-39 — Do Not Import

## Always exclude

| Path / area | Reason |
|-------------|--------|
| `packages/ai-prompts/dist/**` | Compiled output |
| `packages/ai-prompts/node_modules/**` | Vendored |
| `packages/ai-prompts/.turbo/**` | Build cache |
| `*.js` / `*.js.map` / `*.d.ts` under package if generated | Build artifacts |

## Until rework

| Path | Reason |
|------|--------|
| `packages/ai-prompts/src/index.ts` (current form) | Eager `readFileSync` at import; `fillTemplate` without allowlist / leftover checks |

## Out of this wave

HR MJML, i18n/ui/notification-templates source, database/auth/AI-client/audit/sdk/config, apps, root package.json/lock/workspace edits, broad `git add`.

## This audit

Nothing staged · `git add .` not used · package not imported.
