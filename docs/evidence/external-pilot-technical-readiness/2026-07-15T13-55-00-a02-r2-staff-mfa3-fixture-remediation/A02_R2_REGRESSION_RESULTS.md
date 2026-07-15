# A-02-R2 Regression Results

## Targeted MFA unit tests

| Suite | Result |
|-------|--------|
| `apps/api` `src/auth/guards/mfa.guard.spec.ts` | PASS (2 tests) |
| `@confora/shared-types` `src/auth.mfa.spec.ts` | PASS (4 tests) |

## STAFF-MFA-3 embedded regressions

See `docs/evidence/f5-pilot-readiness/2026-07-15T13-29-35-staff-mfa-3-enforcement-closure/STAFF_MFA_3_REGRESSION_RESULTS.md`  
MFA invariant guard: **PASS**

## TD-085 sequential regression

**Command:** `npm run ops:local-pilot-sequential-regression`  
**Evidence:** `docs/evidence/td-085-sequential-regression/2026-07-15T13-32-47-td-085/`  
**Verdict:** `TD_085_NO_GO_RBAC_PRIVACY_OR_GOVERNANCE_REGRESSION`

| Command | Status | Notes |
|---------|--------|-------|
| audit:f4-frontend-api | PASS | — |
| ops:f5-3-data-readiness | FAIL | transient infra signal |
| ops:s17-public-verify-browser | FAIL | child: `S17_PUBLIC_VERIFY_BROWSER_NO_GO_PRIVACY_OR_GOVERNANCE_REGRESSION` |
| ops:admin-gov-final-acceptance-1 | FAIL | blocked functional / transient |
| ops:learner-final-acceptance-1 | FAIL | — |
| ops:f4-9-smoke | FAIL | transient |

First TD-085 attempt (`2026-07-15T13-30-13-td-085`) was `TD_085_BLOCKED_STACK_OR_ENV` (frontend :3001 down); rerun after starting `@confora/admin` remediates preflight but does not clear S17/governance FAIL.

## Impact on A-02-R2

TD-085 FAIL blocks claiming full security-condition GO for delegate sign-off, even though STAFF-MFA-3 MFA fixture/OTP preservation invariants passed.
