# A-01-R1 — Manual TOTP Enrollment Recheck Report

**Task:** A01_R1_MANUAL_TOTP_ENROLLMENT_RECHECK  
**Evidence folder:** `docs/evidence/external-pilot-technical-readiness/2026-07-14T12-53-00-a01-r1-manual-totp-enrollment-recheck/`  
**Date:** 2026-07-14  
**Branch:** `fix/ca-h01-frontend-f4-cutover`  
**Previous A-01:** `2026-07-14T10-46-00-a01-manual-totp-enrollment-closure/` (commit `402504e`)

---

## Objective

Recheck whether all five external-facing staff accounts now have real Keycloak OTP/TOTP credentials — without treating smoke bypass as MFA and without committing secrets.

---

## Outcome

**A01_R1_MANUAL_TOTP_ENROLLMENT_PARTIAL_MANUAL_ACTION_REQUIRED**

Live recheck shows **no change** since A-01:

| Metric | A-01 | A-01-R1 |
|--------|-----:|--------:|
| TOTP enrolled | 0 | **0** |
| LOCAL_SMOKE_ONLY | 3 | **3** |
| MISSING_USER | 2 | **2** |
| External pilot MFA ready | 0 | **0** |

---

## Files created

| File | Purpose |
|------|---------|
| `A01_R1_MANUAL_TOTP_RECHECK_DISCOVERY.md` | Preflight + delta |
| `A01_R1_MANUAL_TOTP_RECHECK_USER_REGISTER.md` | Per-user register |
| `A01_R1_MANUAL_TOTP_RECHECK_PROOF.md` | Safe proof |
| `A01_R1_MANUAL_TOTP_RECHECK_GAP_CLOSURE.md` | Gap matrix (0/7 closed) |
| `A01_R1_MANUAL_TOTP_RECHECK_RESIDUAL_RISKS.md` | Residual risks |
| `A01_R1_MANUAL_TOTP_RECHECK_REPORT.md` | This report |
| `keycloak-live-otp-recheck.json` | Redacted live snapshot |
| `summary.json` | Machine-readable status |

---

## Users checked

| User | Status |
|------|--------|
| `pilot.manager@confora.test` | LOCAL_SMOKE_ONLY |
| `pilot.staff@confora.test` | LOCAL_SMOKE_ONLY |
| `pilot.director@confora.test` | LOCAL_SMOKE_ONLY |
| `pilot.mfa.staff@confora.test` | MISSING_USER |
| `pilot.staff.mfa.external@confora.test` | MISSING_USER |

---

## Proof / reruns

| Item | Status |
|------|--------|
| Secrets/QR/tokens/passwords committed | **false** |
| Staff without MFA denied | **true** (linked STAFF-MFA-3) |
| MFA enrolled access | **NOT_RUN** |
| STAFF-MFA-3 rerun | **NOT_RUN** |
| TD-085 | **NOT_RUN** |
| Production/ops code changed | **false** |

---

## Explicit non-claims

External pilot, security delegate, DPO/legal, real PII, staging/production — **all still NOT approved/signed**.

---

## Final verdict

**A01_R1_MANUAL_TOTP_ENROLLMENT_PARTIAL_MANUAL_ACTION_REQUIRED**

**Next:** execute the A-01 procedure on Keycloak `:8081` (recreate MFA users + enroll TOTP), then request A-01-R2. Do not advance A-02 as if A-01 were closed.
