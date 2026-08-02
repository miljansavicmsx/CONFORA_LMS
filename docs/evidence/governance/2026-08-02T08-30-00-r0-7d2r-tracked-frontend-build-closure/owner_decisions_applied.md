# Owner decisions applied (R0-7D2R)

- `TRACKED_FRONTEND_BUILD_CLOSURE_BEFORE_ACCESSIBILITY_EXECUTION`
- Do not amend/rebase/reset preserved R0-7D2 ancestry commits
- Do not skip build, ignore missing modules, replace app with synthetic pages, or weaken axe assertions
- Do not open a Draft PR in this task
- MEDIUM closure:
  - Playwright CI retries = 1 (was 2)
  - HTML reporter guaranteed alongside github/list
  - accessibility job `timeout-minutes: 15` (was 20)
- Package closure:
  - `@confora/ui` / `@confora/i18n` package entrypoints point at tracked TypeScript source
  - `packages/ui/dist/styles.css` force-tracked (compiled CSS required by `@confora/ui/styles.css`)
  - package tsconfigs self-contained (no runtime dependency on installing `@confora/config` for Vite)
  - Vite aliases pin react/i18n deps into `frontend-app/node_modules`
- Build script: `vite build` is the production bundle gate; `typecheck` / `lint:all` remain separate `tsc -b` scripts (known type debt not hidden inside skipped build)
