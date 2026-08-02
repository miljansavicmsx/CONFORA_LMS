# Changed operational files (max 6)

1. `.github/workflows/accessibility.yml` — accessibility job reconstructed; permissions contents:read
2. `frontend-app/package.json` — add `@axe-core/playwright: 4.12.1`
3. `frontend-app/package-lock.json` — regenerated (was gitignored; force-added)
4. `frontend-app/playwright.config.ts` — PLAYWRIGHT_A11Y_BASELINE mode
5. `frontend-app/tests/accessibility/accessibility.spec.ts` — public route axe suite
6. `frontend-app/tests/accessibility/wcag-tags.ts` — tag constants

No other operational paths modified.
