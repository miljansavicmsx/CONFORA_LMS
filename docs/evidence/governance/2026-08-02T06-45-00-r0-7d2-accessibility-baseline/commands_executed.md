# Commands executed

- git fetch; branch ci/r0-7d2-accessibility-baseline from f9b4a392
- git worktree add clean temp; npm install in frontend-app (no prior lock)
- npm view @axe-core/playwright@4.12.1 peerDependencies
- Playwright test --list with PLAYWRIGHT_A11Y_BASELINE=1
- Force-add frontend-app/package-lock.json despite root gitignore
