# A-02-R2 Report — STAFF-MFA-3 Fixture Remediation

**Final verdict:** `A02_R2_NO_GO_SECURITY_REGRESSION`

**Branch:** `fix/ca-h01-frontend-f4-cutover`

## Why this verdict

MFA fixture remediation **succeeded** (OTP 5/5 preserved; dedicated no-MFA fixture; STAFF-MFA-3 script `STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF` with denials holding). However, required TD-085 sequential regression returned `TD_085_NO_GO_RBAC_PRIVACY_OR_GOVERNANCE_REGRESSION` (driven by S17 privacy/governance NO_GO and other command FAILs). Full A-02-R2 security-condition GO is therefore **not** allowed.

`A02_R2_PARTIAL_KEYCLOAK_DIRECT_GRANT_LIMITATION_ONLY` was considered for the with-MFA PARTIAL path alone, but TD-085 FAIL after an explicit run blocks promoting residual-only PARTIAL to a delegate-ready posture.

## Files changed

- `scripts/ops/run-staff-mfa-3-enforcement-closure.mjs` — fixture split + OTP guards

## OTP before / after STAFF-MFA-3

| Phase | OTP enrolled (external-ready) | Smoke users |
|-------|-------------------------------|-------------|
| Before | 5 | [] |
| After | 5 | [] |

## No-MFA fixture

`pilot.staff.no-mfa@confora.test` — separate from the five; OTP absent; used for DENIED_403 proof.

## STAFF-MFA-3 / TD-085

| Gate | Status |
|------|--------|
| STAFF-MFA-3 | PASS → `docs/evidence/f5-pilot-readiness/2026-07-15T13-29-35-staff-mfa-3-enforcement-closure/` |
| Staff without MFA | DENIED_403 |
| With MFA route | PARTIAL (KC direct-grant) |
| TD-085 | FAIL → `docs/evidence/td-085-sequential-regression/2026-07-15T13-32-47-td-085/` |

## Recommended next action

1. Investigate/fix S17 (and related TD-085 failures) without changing MFA fixture protections.  
2. Re-run TD-085 to PASS.  
3. Then package A-02-R2bis / resume security delegate review (still **unsigned** until human action).
