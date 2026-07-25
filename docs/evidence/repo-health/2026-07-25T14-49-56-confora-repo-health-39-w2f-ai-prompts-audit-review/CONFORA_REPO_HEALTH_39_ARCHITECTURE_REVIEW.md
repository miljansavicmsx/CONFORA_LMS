# CONFORA-REPO-HEALTH-39 — Architecture Review

| Question | Answer |
|----------|--------|
| Requires root `package.json` change? | **no** — already `workspace:*` from `apps/api` |
| Requires lockfile change? | **no** — `@confora/ai-prompts` already in `pnpm-lock.yaml` |
| Requires workspace change? | **no** — `packages/*` already covered |
| Requires DB/migration? | **no** |
| Requires auth/RBAC/tenant middleware change? | **no** |
| Requires app/runtime integration for *import*? | **no** (api already depends; import is tracking existing untracked package) |
| Public barrel risk | `index.ts` exports `getPromptBundleV1` + `fillTemplate` + `PromptBundle` — acceptable after loader rework; no provider/recipient/tenant APIs |
| Generated/compiled import? | **must not** import `dist/`, `node_modules/`, `.turbo/` |

## Import sequencing note

Prompt JSON + manifests are content-safe **IMPORT_CANDIDATE**s, but a usable first wave should include a **rewritten** `src/index.ts` (lazy load + safer `fillTemplate`). Importing prompts without a safe loader leaves the package incomplete for consumers.
