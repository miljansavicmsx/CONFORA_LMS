# Validation

- Peer dependency of `@axe-core/playwright@4.12.1`: `playwright-core` (satisfied via `@playwright/test`)
- Direct axe-core not required
- Lockfile regenerated without copying prior untracked local lockfile
- Playwright `--list` with PLAYWRIGHT_A11Y_BASELINE=1 discovers 6 public-route tests
- Accessibility job references no tools/a11y, scripts/a11y, tests/e2e, or demo passwords
- pnpm-workspace.yaml unchanged (frontend-app excluded)
- packages/database tracked count remains 0
