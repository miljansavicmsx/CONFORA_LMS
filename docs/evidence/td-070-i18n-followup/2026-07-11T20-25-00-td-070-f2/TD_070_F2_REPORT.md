# TD-070-F2 Report — Controlled App-wide i18n Extraction

**Verdict:** `TD_070_F2_GO_WITH_REMAINING_DEFERRED_LOW_RISK_STRINGS`

## Summary
Extended `@confora/i18n` with three new namespaces (`navigation`, `dashboard`, `common`) and expanded `shell`, `a11y`, and `candidatePortal.wallet`. Wired sidebar navigation, shell chrome, dashboard pilot strings, and learner wallet core copy to i18n without changing routes, RBAC, API contracts, or `data-testid` selectors.

## Evidence
- Folder: `docs/evidence/td-070-i18n-followup/2026-07-11T20-25-00-td-070-f2/`
- Artifacts: DISCOVERY, NAMESPACE_PLAN, EXTRACTION_SUMMARY, TEST_RESULTS, REGRESSION_RESULTS, `summary.json`

## Namespaces
| Added | Updated |
|-------|---------|
| `navigation`, `dashboard`, `common` | `shell`, `a11y`, `candidatePortal` |

## Tests
- i18n: **128/128** PASS
- Frontend targeted: **24/24** PASS (F2 + F1 switcher + sidebar RBAC + wallet label unit tests)

## Sequential regression
**BLOCKED** — local stack not running (`TD_085_BLOCKED_STACK_OR_ENV`). Not claimed as PASS.

## Deferred (low risk)
Learner dashboard enterprise cards, legacy dashboard role panels, finance page, breadcrumb runtime wiring, mobile pilot nav strings, admin-gov staff labels.

## Next step
Start local pilot stack and re-run `npm run ops:local-pilot-sequential-regression` to confirm TD_085 baseline after F2.
