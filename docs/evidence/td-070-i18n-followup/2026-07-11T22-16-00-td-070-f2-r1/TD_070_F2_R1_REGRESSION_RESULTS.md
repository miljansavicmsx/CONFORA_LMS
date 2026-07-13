# TD-070-F2-R1 Sequential Regression Results

**Command:** `npm run ops:local-pilot-sequential-regression`  
**Evidence:** `docs/evidence/td-085-sequential-regression/2026-07-11T22-15-13-td-085/`  
**Duration:** 516 seconds  
**Date:** 2026-07-11

## Results

| Step | Status |
|------|--------|
| Preflight | PASS |
| f4_audit | PASS |
| f5_3 | PASS |
| s17 | PASS |
| **admin_gov** | **PASS** |
| **learner** | **PASS** |
| f4_9 | PASS |

```
commands_passed: 6
commands_failed: 0
commands_blocked: 0
commands_skipped: 0
```

**Final verdict:** `TD_085_GO_LOCAL_BASELINE_CONFIRMED`

## Comparison to pre-fix run

| Suite | Pre-fix (21:20) | Post-fix (22:15) |
|-------|-----------------|------------------|
| admin_gov | FAIL | PASS |
| learner | FAIL | PASS |
| Sequential | `TD_085_NO_GO_FUNCTIONAL_REGRESSION` | `TD_085_GO_LOCAL_BASELINE_CONFIRMED` |
