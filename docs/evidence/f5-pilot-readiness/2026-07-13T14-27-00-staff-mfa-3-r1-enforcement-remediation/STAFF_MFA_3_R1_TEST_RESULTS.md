# STAFF-MFA-3-R1 Test Results

## Remediation closure run

**Command:** `npm run ops:staff-mfa-3-enforcement-closure`  
**Evidence:** `docs/evidence/f5-pilot-readiness/2026-07-13T14-24-16-staff-mfa-3-enforcement-closure/`

| Check | Result |
|-------|--------|
| MFA invariants (API probes) | PASS |
| `regression_guard_status` | **PASS** |
| `privileged_route_without_mfa_status` | DENIED_403 |
| `privileged_route_with_mfa_status` | PARTIAL (OTP cred + pwd blocked; no automated amr grant) |
| `targeted_tests_status` | PASS |
| `final_verdict` | **STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF** |

## Sequential regression

**Command:** `npm run ops:local-pilot-sequential-regression`  
**Evidence:** `docs/evidence/td-085-sequential-regression/2026-07-13T14-26-35-td-085/`

| Step | Status |
|------|--------|
| f4_audit | PASS |
| f5_3 | PASS |
| s17 | PASS |
| admin_gov | PASS |
| learner | PASS |
| f4_9 | PASS |

**Verdict:** `TD_085_GO_LOCAL_BASELINE_CONFIRMED`  
**sequential_regression_status:** PASS

## Unit tests (unchanged, still valid)

| Test | Result |
|------|--------|
| `apps/api/src/auth/guards/mfa.guard.spec.ts` | 2/2 PASS |
| `packages/shared-types/src/auth.mfa.spec.ts` | 4/4 PASS |
