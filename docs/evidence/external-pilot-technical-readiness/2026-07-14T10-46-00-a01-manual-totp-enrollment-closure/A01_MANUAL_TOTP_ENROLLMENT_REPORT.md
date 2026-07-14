# A-01 — Manual TOTP Enrollment Closure Report

**Task:** A01_MANUAL_TOTP_ENROLLMENT_CLOSURE  
**Evidence folder:** `docs/evidence/external-pilot-technical-readiness/2026-07-14T10-46-00-a01-manual-totp-enrollment-closure/`  
**Date:** 2026-07-14  
**Branch:** `fix/ca-h01-frontend-f4-cutover`

---

## Objective

Close or formally document A-01 Manual TOTP Enrollment for external-facing staff pilot users — without claiming external pilot approval or fabricating MFA success.

---

## Outcome

**A01_MANUAL_TOTP_ENROLLMENT_PARTIAL_MANUAL_ACTION_REQUIRED**

Live Keycloak inspection shows:

- **0** OTP-enrolled users in the A-01 named cohort  
- **3** LOCAL_SMOKE_ONLY (`pilot.manager`, `pilot.staff`, `pilot.director`)  
- **2** MISSING dedicated MFA users (`pilot.mfa.staff`, `pilot.staff.mfa.external`)  
- Realm OTP policy present (TOTP 6/30)  
- No secrets/QR/tokens committed  
- Nest API not running → live route re-proof NOT_RUN; linked STAFF-MFA-3 denial **403** retained  

---

## Files created

| File | Purpose |
|------|---------|
| `A01_MANUAL_TOTP_ENROLLMENT_DISCOVERY.md` | Scripts, env, live vs STAFF-MFA-3 divergence |
| `A01_MANUAL_TOTP_ENROLLMENT_USER_REGISTER.md` | Per-user enrollment register |
| `A01_MANUAL_TOTP_ENROLLMENT_PROCEDURE.md` | Manual enrollment steps (no secrets) |
| `A01_MANUAL_TOTP_ENROLLMENT_PROOF.md` | Safe proof + limitations |
| `A01_MANUAL_TOTP_ENROLLMENT_RESIDUAL_RISKS.md` | Open risks |
| `A01_MANUAL_TOTP_ENROLLMENT_REPORT.md` | This report |
| `keycloak-live-otp-inspection.json` | Redacted live snapshot |
| `summary.json` | Machine-readable status |

---

## Counts (named A-01 cohort of 5)

| Metric | Value |
|--------|------:|
| External-facing staff total | 5 |
| TOTP enrolled | 0 |
| LOCAL_SMOKE_ONLY | 3 |
| MISSING | 2 |
| Manual enrollment required | **YES** |

---

## Staff MFA proof status

| Proof | Status |
|-------|--------|
| Staff without MFA denied | **true** (linked STAFF-MFA-3) |
| MFA enrolled access | **PARTIAL** |
| Keycloak direct-grant TOTP limitation | **true** |
| STAFF-MFA-3 re-run | **NOT_RUN** |
| TD-085 | **NOT_RUN** |

---

## Required manual actions (exact)

1. Align `KEYCLOAK_BASE_URL` to live port **8081**.  
2. Recreate `pilot.mfa.staff@confora.test` and `pilot.staff.mfa.external@confora.test` (no smoke).  
3. Enroll real TOTP for any account designated external-facing.  
4. Keep local smoke users segregated or convert them with smoke removal + TOTP.  
5. Re-inspect A-01 counts; re-run STAFF-MFA-3 when API is up.  
6. Proceed to A-02 security delegate review only after enrollments are real.

---

## Explicit non-claims

| Claim | Value |
|-------|-------|
| External pilot approved | **FALSE** |
| Security delegate signed | **FALSE** |
| DPO/legal signed | **FALSE** |
| Real personal data approved | **FALSE** |
| Staging / production validated | **FALSE** |
| A-01 fully closed | **FALSE** |
| Production code changed | **FALSE** |

---

## Final verdict

**A01_MANUAL_TOTP_ENROLLMENT_PARTIAL_MANUAL_ACTION_REQUIRED**
