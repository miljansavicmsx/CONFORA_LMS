# Validation (R0-7D2R)

## Clean worktree prove chain

Environment: detached worktree at tip `ccc8e5f8773288e54b80b6c7ac829f0d0af8abaa` (and equivalent patched tree for axe).

1. `npm ci` — exit 0
2. `npm run build` (`vite build`) — exit 0
3. `npm run preview -- --host 127.0.0.1 --port 5173` — ready
4. HTTP 200 for `/`, `/login`, `/verify`, `/contact`, `/pricing`, `/faq`
5. `PLAYWRIGHT_A11Y_BASELINE=1 npx playwright test --list` — 6 tests discovered
6. `npx playwright install chromium` + `npx playwright test` — axe executed
7. HTML report generated (`playwright-report/index.html` observed true)
8. Preview process cleaned up

## Axe violation inventory (truthful; not zero)

| Route | Violation rules | Violation count | Node count (approx) |
|-------|-----------------|-----------------|---------------------|
| `/` | color-contrast | 1 | 4 |
| `/login` | color-contrast | 1 | 2 |
| `/verify` | aria-hidden-focus, color-contrast | 2 | 32 |
| `/contact` | color-contrast | 1 | 5 |
| `/pricing` | color-contrast, select-name | 2 | 8 |
| `/faq` | color-contrast | 1 | 1 |

Primary contrast finding: `text-text-secondary` / muted slate text (~#94a3b8) on light surfaces fails WCAG AA 4.5:1.

## Claims

| Claim | Status |
|-------|--------|
| `TRACKED_FRONTEND_BUILD_CLOSES` | YES (clean `npm ci` + `npm run build`) |
| `ACCESSIBILITY_WORKFLOW_EXECUTES` (local) | YES |
| `BROWSER_AXE_CHECKS_PASS` | NO (violations present; assertions correctly failed) |
| `ACCESSIBILITY_REPORT_PUBLISHED` (local JSON) | YES (`axe-reports/`) |
| GitHub-hosted accessibility job | NOT CLAIMED |

## Follow-on

- Design-token / public-route contrast remediation → R0-7D3 (or owner-directed)
- `select-name` on `/pricing`, `aria-hidden-focus` on `/verify` → fix in same contrast track or dedicated a11y fix slice
- `npm run typecheck` (`tsc -b`) still has known debt; not part of the production `build` gate after R0-7D2R
