# A-01-R4 — Manual TOTP Final Recheck User Register

**Task:** A01_R4_MANUAL_TOTP_ENROLLMENT_FINAL_RECHECK  
**Captured:** 2026-07-15 live Keycloak admin API (`http://localhost:18080`)  
**Secret/token/QR/password committed:** **NO** for all rows

---

## Required cohort (5)

| User email | External-facing | Exists | OTP present | Credential metadata (safe) | Required action | Smoke bypass | Status | External pilot MFA ready | Notes |
|------------|:---------------:|:------:|:-----------:|----------------------------|-----------------|:------------:|--------|:------------------------:|-------|
| `pilot.manager@confora.test` | YES | YES | **YES** | type=`otp`; label=unset; created=`2026-07-15T08:16:49Z`; id=REDACTED | none | YES | **ENROLLED_REAL_TOTP** | **YES** | Smoke attr residual |
| `pilot.staff@confora.test` | YES | YES | **YES** | type=`otp`; label=`pilot.staff@confora.test`; created=`2026-07-15T08:22:38Z`; id=REDACTED | none | YES | **ENROLLED_REAL_TOTP** | **YES** | Smoke attr residual |
| `pilot.director@confora.test` | YES | YES | **YES** | type=`otp`; label=`pilot.director@confora.test`; created=`2026-07-15T08:25:57Z`; id=REDACTED | none | YES | **ENROLLED_REAL_TOTP** | **YES** | Smoke attr residual |
| `pilot.staff.mfa.external@confora.test` | YES | YES | **YES** | type=`otp`; label=`pilot.staff.mfa.external@confora.test`; created=`2026-07-15T08:27:44Z`; id=REDACTED | none | NO | **ENROLLED_REAL_TOTP** | **YES** | Clean (no smoke) |
| `pilot.mfa.staff@confora.test` | YES | YES | **YES** | type=`otp`; label=`staff-mfa-3-test`; created=`2026-07-13T12:24:19Z`; id=REDACTED | CONFIGURE_TOTP | NO | **ENROLLED_REAL_TOTP** | **YES** | Clear stale required action; roles empty |

---

## Counts

| Metric | Value |
|--------|------:|
| External-facing staff total | **5** |
| ENROLLED_REAL_TOTP | **5** |
| LOCAL_SMOKE_ONLY | **0** |
| MISSING_USER | **0** |
| MISSING_TOTP | **0** |
| External pilot MFA ready (OTP-based) | **5** |

---

## Readiness rule applied

External pilot MFA ready = **YES** when credential type `otp` exists.  
Smoke alone is insufficient; these users have **real OTP**, so enrollment GO criteria are met. Smoke attribute residual is tracked separately for external cutover hygiene.
