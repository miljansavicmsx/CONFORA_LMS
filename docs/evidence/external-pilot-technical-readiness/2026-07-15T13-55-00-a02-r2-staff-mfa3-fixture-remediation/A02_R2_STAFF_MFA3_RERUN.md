# A-02-R2 STAFF-MFA-3 Rerun

**Status:** PASS (script `STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF`)

**Evidence:** `docs/evidence/f5-pilot-readiness/2026-07-15T13-29-35-staff-mfa-3-enforcement-closure/`

## Results

| Check | Result |
|-------|--------|
| External-ready OTP before | 5/5 |
| External-ready OTP after | 5/5 |
| Smoke on external-ready after | none |
| No-MFA fixture | `pilot.staff.no-mfa@confora.test` (separate; no OTP) |
| Staff without MFA denied | **DENIED_403** |
| Learner denial | PASS |
| Privileged with MFA route | **PARTIAL** (Keycloak direct-grant TOTP/`amr` limitation) |
| MFA invariant / regression guard | PASS |
| Full regression suite (within STAFF-MFA-3) | PASS (f5-3 live fail marked non-blocking for MFA invariant) |

## Keycloak direct-grant limitation

`keycloak_direct_grant_totp_limitation: true` — with-MFA Nest route proof remains PARTIAL; not treated as MFA weaken while denials and OTP preservation hold.
