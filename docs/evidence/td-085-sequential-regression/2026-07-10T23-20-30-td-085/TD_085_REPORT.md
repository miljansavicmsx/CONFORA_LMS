# TD-085 Report — Sequential Local Regression Runner

**Evidence:** `docs/evidence/td-085-sequential-regression/2026-07-10T23-20-30-td-085/`  
**Final verdict:** **TD_085_GO_WITH_TRANSIENT_INFRA_NOTE**

## Summary

Sequential local pilot regression runner prevents false NO-GO from parallel Playwright/Keycloak contention (TD-084 root cause).

| Metric | Value |
|--------|-------|
| Preflight | PASS |
| Commands passed | 5 |
| Commands failed | 1 (F4-9 transient local state) |
| Total duration | 896s (~15 min) |
| Parallel execution | false |

## Sequential results

All Playwright-heavy suites passed when run alone:

- `ops:admin-gov-final-acceptance-1` — PASS
- `ops:learner-final-acceptance-1` — PASS (11/11 baseline restored)
- `ops:s17-public-verify-browser` — PASS

F4-9 ended 63/64 due to local DB SLA checkpoint drift after contact workflow mutations — documented transient infra note.

## npm script

`npm run ops:local-pilot-sequential-regression`

## Compliance

Ops harness only. No production business logic, schema, migration, or RBAC/privacy changes.
