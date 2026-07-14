# A-01-R1 — Gap Closure Status

**Task:** A01_R1_MANUAL_TOTP_ENROLLMENT_RECHECK  
**Date:** 2026-07-14  
**Vs A-01:** `2026-07-14T10-46-00-a01-manual-totp-enrollment-closure`

---

## Gap closure matrix

| Gap ID | Gap | A-01 status | A-01-R1 status | Closed? | Required manual action |
|--------|-----|-------------|----------------|:-------:|------------------------|
| G-01 | `pilot.mfa.staff@confora.test` missing | MISSING | **MISSING_USER** | **NO** | Recreate via `KEYCLOAK_BASE_URL=http://localhost:8081` + `keycloak-mfa-readiness.mjs`; assign CONFIGURE_TOTP; enroll authenticator; verify OTP credential type |
| G-02 | `pilot.staff.mfa.external@confora.test` missing | MISSING | **MISSING_USER** | **NO** | Recreate user (COM_CERT, **no** smoke); leave without OTP for denial OR enroll if active external staff |
| G-03 | `pilot.manager@` smoke-only | LOCAL_SMOKE_ONLY | **LOCAL_SMOKE_ONLY** | **NO** | If external-facing: remove `pilot_smoke_mfa_verified`, assign CONFIGURE_TOTP, enroll TOTP. If local-only: keep smoke; remove from external cohort by governance |
| G-04 | `pilot.staff@` smoke-only | LOCAL_SMOKE_ONLY | **LOCAL_SMOKE_ONLY** | **NO** | Same as G-03 |
| G-05 | `pilot.director@` smoke-only | LOCAL_SMOKE_ONLY | **LOCAL_SMOKE_ONLY** | **NO** | Same as G-03 |
| G-06 | Env port alignment (8081 vs 18080) | Documented | Still required | **NO** | Set `KEYCLOAK_BASE_URL=http://localhost:8081` before seed/enrollment scripts |
| G-07 | Live API + STAFF-MFA-3 re-proof | NOT_RUN | NOT_RUN | **NO** | Start Nest API; after enrollments run `npm run ops:staff-mfa-3-enforcement-closure` |

---

## Closure summary

| Result | Count |
|--------|------:|
| Gaps closed | **0** |
| Gaps still open | **7** |

**A-01-R1 does not close B-EP-08 / R-EP-12 / SD-R01.**

---

## Exact operator checklist (still outstanding)

1. Align Keycloak URL to `http://localhost:8081`.  
2. Recreate MFA dedicated users (G-01, G-02).  
3. Enroll real TOTP for every account that remains in the external-facing cohort (G-03–G-05 if designated external).  
4. Confirm OTP credential type `otp` via admin API (redacted metadata only).  
5. Confirm smoke absent on all external-facing accounts.  
6. Start API; re-run STAFF-MFA-3.  
7. Request A-01-R2 recheck or proceed to security delegate only after GO counts.

---

## Explicit non-claims

No gap is marked closed without live OTP evidence. Smoke bypass is not treated as gap closure.
