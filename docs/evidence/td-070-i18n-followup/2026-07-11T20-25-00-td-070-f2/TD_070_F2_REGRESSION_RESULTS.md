# TD-070-F2 Regression Results

## Command
```
npm run ops:local-pilot-sequential-regression
```

## Result: BLOCKED
Evidence: `docs/evidence/td-085-sequential-regression/2026-07-11T20-20-59-td-085/`

```
preflight_status: BLOCKED
commands_passed: 0
commands_blocked: 6
final_verdict: TD_085_BLOCKED_STACK_OR_ENV
```

Local Docker/API/frontend/Keycloak stack was not running at execution time. Blocked checks are **not** counted as PASS.

**sequential_regression_status: BLOCKED**

Re-run after starting the local pilot stack to confirm TD_085 baseline on top of F2 changes.
