# TD-085 Report — Sequential Local Regression Runner

**Evidence:** `docs/evidence/td-085-sequential-regression/2026-07-15T13-32-47-td-085/`  
**Final verdict:** **TD_085_NO_GO_RBAC_PRIVACY_OR_GOVERNANCE_REGRESSION**

## Summary

Sequential local pilot regression runner prevents false NO-GO from parallel Playwright/Keycloak contention (TD-084 root cause).

| Metric | Value |
|--------|-------|
| Preflight | PASS |
| Commands passed | 1 |
| Commands failed | 5 |
| Commands blocked | 0 |
| Commands skipped | 0 |
| Total duration | 1354s |
| Parallel execution | false |

## npm script

`npm run ops:local-pilot-sequential-regression`

## Compliance

No production business logic, schema, migration, or RBAC/privacy changes. Ops harness only.
