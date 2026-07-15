# A-02-R2 Root Cause

**A-02-R1 verdict:** `A02_R1_PARTIAL_STAFF_MFA3_RERUN_BLOCKED_OR_PARTIAL`

## Dual-use fixture defect

`scripts/ops/run-staff-mfa-3-enforcement-closure.mjs` used `pilot.staff.mfa.external@confora.test` as both:

1. an external-facing MFA-enrolled staff member (A-01-R4 cohort), and  
2. the no-MFA negative control for staff-route denial.

Implementation deleted OTP credentials from that user (`deleteOtpCredentials`) before the without-MFA probe.

## Secondary invariant mismatch after smoke cleanup

After A-02-R1 removed `pilot_smoke_mfa_verified` from enrolled staff, STAFF-MFA-3 still required `smokeSeparationOk` to see `mfa_verified=true` via smoke bypass on `pilot.staff@confora.test`, causing script `NO_GO` even when without-MFA denial still worked.

## `enrollTotpCredential` overwrite risk

The same script overwrote OTP on `pilot.mfa.staff@confora.test` via Keycloak partialImport for route-proof — mutating an external-ready enrolled user.

## Impact

- OTP for EXTERNAL dropped from 5/5 → 4/5 after A-02-R1 STAFF-MFA-3 rerun  
- Security-condition hygiene and automated closure became contradictory  

## Remediation direction

Separate local-only fixtures for no-MFA denial and MFA route-proof; treat the five external-ready users as OTP read-only; fail hard on destructive fixture regressions.
