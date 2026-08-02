# Package and generated-output strategy

## Forbidden carry-overs from rejected branch

- `packages/ui/dist/styles.css` (generated Tailwind emit)
- Any other `packages/*/dist/**`
- Vite `frontend-app/dist/**`
- Playwright/axe report trees in git (evidence copies under `docs/evidence/**` are documentation, not runtime package output)

## Required approach

### JavaScript / TypeScript packages

`PACKAGE_SOURCE_RESOLVE_NO_COMMITTED_DIST_JS`

- Keep `@confora/i18n` and `@confora/ui` consumable from **tracked `src/`** for the a11y Vite entry (exports or Vite aliases).
- Do not commit compiled `.js` / `.d.ts` / source maps.

### CSS

`EPHEMERAL_OR_APP_TAILWIND_CSS` (pick one in implementation; both avoid committing dist):

**Preferred A — ephemeral CI emit (gitignored):**

```text
npx tailwindcss -i packages/ui/src/styles.css -o packages/ui/dist/styles.css --minify
# dist/ gitignored; vite alias may point at that path for the job only
vite build -c vite.a11y.config.ts
```

**Preferred B — app Tailwind content scan:**

- Do not import package `dist/styles.css`.
- Ensure `packages/ui/src/**/*.{ts,tsx}` is in frontend-app Tailwind `content`.
- Rely on `frontend-app/src/index.css` `@tailwind` layers already present.

Raw `packages/ui/src/styles.css` is only `@tailwind` directives — it is **source**, not generated output, and may remain tracked (already is at D1).

## Peer / workspace note

Package `tsconfig` must not require installing `@confora/config` for the a11y Vite transform. Future impl may keep self-contained package tsconfigs **or** ensure config is resolvable without pnpm workspace — without copying rejected-branch history.
