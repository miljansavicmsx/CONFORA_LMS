# CONFORA-REPO-HEALTH-36 — Large / Compiled / Generated Review

Scope: **tracked** `packages/i18n/**`.

| Check | Result |
|-------|--------|
| Binaries | **none** tracked |
| Compiled JS (`*.js`) | **none** tracked |
| Source maps (`*.js.map` / `*.d.ts.map`) | **none** tracked |
| Type decls (`*.d.ts`) | **none** tracked |
| Vendored dependencies | **none** tracked |
| Generated locale dump artifacts | **none** — 40 hand-authored JSON only |

## On-disk (untracked, correctly excluded from git)

`dist/` (compiled `*.js` + `*.d.ts` + maps), `node_modules/`, `.turbo/turbo-build.log`, `tsconfig.build.tsbuildinfo` — all present on disk but **not** in `git ls-files`. No action; correctly ignored.

`large_binary_committed: false` · `compiled_artifacts_present: false`
