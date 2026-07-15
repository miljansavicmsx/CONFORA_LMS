# STAFF-MFA-3 Test Results

## API / MFA probes

See `mfa-proof/route-probes.json` and `STAFF_MFA_3_API_CLAIM_PROBES.md`.

| Probe | Result |
|-------|--------|
| External user without MFA → staff routes | PASS (403) |
| MFA-complete user → staff overview | FAIL/PARTIAL |
| Nest /auth/mfa/verify | PARTIAL |
| MFA claim (mfa_verified or amr otp) | PARTIAL |
| Learner → staff route | PASS (denied) |
| Public verification no-auth | PASS |
| Smoke bypass separation | PASS |

## Unit tests (targeted)

Run separately: `apps/api/src/auth/guards/mfa.guard.spec.ts`, `packages/shared-types` auth helpers.

## Regression suite

See `STAFF_MFA_3_REGRESSION_RESULTS.md`.

**Targeted tests status:** PASS
