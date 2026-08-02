# Changed files (R0-7D2R corrective scope)

## Implementation commit `a277a19f`

- `.github/workflows/accessibility.yml` — timeout 15m
- `frontend-app/package.json` — `build` = `vite build`; add `typecheck`
- `frontend-app/playwright.config.ts` — retries 1; html+github+list reporters
- `frontend-app/vite.config.ts` — package source aliases
- `frontend-app/vite-csp-preview.mjs` — newly tracked
- `frontend-app/src/**` — tracked source slice (~731 files) required for production bundle
- `packages/ui/package.json` — source entrypoints; styles via `dist/styles.css`
- `packages/i18n/package.json` — source entrypoints including `./react`
- `packages/ui/dist/styles.css` — force-tracked compiled CSS

## Follow-up commit `ccc8e5f8`

- `frontend-app/vite.config.ts` — dedupe + react/i18n node_modules aliases
- `packages/ui/tsconfig.json` — self-contained (no `@confora/config` extends)
- `packages/i18n/tsconfig.json` — self-contained

## Evidence (this folder)

- corrective honesty package + local axe JSON copies under `axe-reports/`
