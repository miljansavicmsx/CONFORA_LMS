# TD-085 Report — Sequential Local Regression Runner

**Evidence:** `docs/evidence/td-085-sequential-regression/2026-07-15T14-31-08-td-085/`  
**Final verdict:** **TD_085_GO_WITH_TRANSIENT_INFRA_NOTE**

## Summary

Sequential local pilot regression runner prevents false NO-GO from parallel Playwright/Keycloak contention (TD-084 root cause).

| Metric | Value |
|--------|-------|
| Preflight | PASS |
| Commands passed | 4 |
| Commands failed | 2 |
| Commands blocked | 0 |
| Commands skipped | 0 |
| Total duration | 387s |
| Parallel execution | false |

## npm script

`npm run ops:local-pilot-sequential-regression`

## Compliance

No production business logic, schema, migration, or RBAC/privacy changes. Ops harness only.
