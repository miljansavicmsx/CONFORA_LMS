# CONFORA REPO HEALTH 40 — Modified Files Scope

## RH40 local rework delta (exact)

| File | Role |
|------|------|
| `packages/ai-prompts/src/index.ts` | Rewritten loader + fail-closed `fillTemplate` |
| `packages/ai-prompts/src/index.test.ts` | New fail-closed coverage (10 tests) |

- **modified_file_count:** 2  
- **modified_files_exact_match:** true  

## Confirmed untouched during RH40

| Area | Result |
|------|--------|
| Prompt JSON under `prompts/v1/*.json` | Not modified in RH40 |
| `packages/ai-prompts/package.json` | Untouched |
| `tsconfig.json` / `tsconfig.build.json` | Untouched |
| Root `package.json` / `pnpm-lock.yaml` / `pnpm-workspace.yaml` | Untouched |
| `apps/**` | Untouched |
| `packages/i18n/**`, `packages/ui/**` | Untouched |
| `packages/notification-templates/**` (beyond existing deferred HR MJML) | Untouched |
| database / auth / audit / SDK / config packages | Untouched |

## Untracked package inventory (context only)

Whole package folder remains untracked. Non-RH40 files present but not part of this rework delta:

- `package.json`, `tsconfig.json`, `tsconfig.build.json`
- five `prompts/v1/*.json` files

## DO_NOT_IMPORT artifacts

`dist/`, `node_modules/`, `.turbo/` — not modified/staged; remain **DO_NOT_IMPORT**.

## out_of_scope_files_modified

`[]`
