# A-01-R2 — Manual TOTP Enrollment Recheck Report

**Task:** A01_R2_MANUAL_TOTP_ENROLLMENT_RECHECK  
**Evidence folder:** `docs/evidence/external-pilot-technical-readiness/2026-07-14T21-37-00-a01-r2-manual-totp-enrollment-recheck/`  
**Date:** 2026-07-14  
**Branch:** `fix/ca-h01-frontend-f4-cutover`  
**Keycloak:** `http://localhost:18080`

---

## Objective

Recheck live Keycloak after operator manual enrollment and determine whether all five external-facing staff users exist with real OTP credentials — without smoke-as-MFA and without committing secrets.

---

## Outcome

**A01_R2_MANUAL_TOTP_ENROLLMENT_PARTIAL_MANUAL_ACTION_REQUIRED**

| Metric | A-01-R1 | A-01-R2 |
|--------|--------:|--------:|
| Users exist | 3/5 | **5/5** |
| Real TOTP enrolled | 0 | **1** |
| LOCAL_SMOKE_ONLY | 3 | **3** |
| MISSING_USER | 2 | **0** |
| MISSING_TOTP | 0 | **1** |
| External pilot MFA ready | 0 | **1** |

GO requires **5/5** real OTP and **zero** LOCAL_SMOKE_ONLY / MISSING_* — **not met**.

---

## Files created

| File |
|------|
| `A01_R2_MANUAL_TOTP_RECHECK_DISCOVERY.md` |
| `A01_R2_MANUAL_TOTP_RECHECK_USER_REGISTER.md` |
| `A01_R2_MANUAL_TOTP_RECHECK_PROOF.md` |
| `A01_R2_MANUAL_TOTP_RECHECK_RESIDUAL_RISKS.md` |
| `A01_R2_MANUAL_TOTP_RECHECK_REPORT.md` |
| `keycloak-live-otp-r2-recheck.json` |
| `summary.json` |

---

## Remaining manual actions

1. For `pilot.manager@`, `pilot.staff@`, `pilot.director@`: remove `pilot_smoke_mfa_verified` (if designated external), complete authenticator enrollment until OTP credential exists.  
2. For `pilot.staff.mfa.external@`: complete CONFIGURE_TOTP until OTP credential exists (keep smoke absent).  
3. For `pilot.mfa.staff@`: clear stale CONFIGURE_TOTP if appropriate; confirm intended realm role(s).  
4. Re-run A-01-R3 / STAFF-MFA-3 when API is up and 5/5 OTP present.

---

## Explicit non-claims

| Claim | Value |
|-------|-------|
| External pilot approved | **FALSE** |
| Security delegate signed | **FALSE** |
| DPO/legal signed | **FALSE** |
| Real personal data approved | **FALSE** |
| Staging / production validated | **FALSE** |
| Secrets/QR/tokens/passwords committed | **FALSE** |
| Production code changed | **FALSE** |

---

## Final verdict

**A01_R2_MANUAL_TOTP_ENROLLMENT_PARTIAL_MANUAL_ACTION_REQUIRED**
