# A-01-R2 — Manual TOTP Recheck User Register

**Task:** A01_R2_MANUAL_TOTP_ENROLLMENT_RECHECK  
**Captured:** 2026-07-14 live Keycloak admin API (`http://localhost:18080`)  
**Secret/token/QR/password committed:** **NO** for all rows

---

## Required cohort (5)

| User email | External-facing | Exists | OTP present | Credential metadata | Required action | Smoke bypass | Status | External pilot MFA ready | Notes |
|------------|:---------------:|:------:|:-----------:|---------------------|-----------------|:------------:|--------|:------------------------:|-------|
| `pilot.manager@confora.test` | YES | YES | **NO** | password only | CONFIGURE_TOTP | **YES** | **LOCAL_SMOKE_ONLY** | **NO** | Remove smoke + complete TOTP before external |
| `pilot.staff@confora.test` | YES | YES | **NO** | password only | CONFIGURE_TOTP | **YES** | **LOCAL_SMOKE_ONLY** | **NO** | Same |
| `pilot.director@confora.test` | YES | YES | **NO** | password only | CONFIGURE_TOTP | **YES** | **LOCAL_SMOKE_ONLY** | **NO** | Same |
| `pilot.staff.mfa.external@confora.test` | YES | YES | **NO** | password only | CONFIGURE_TOTP | **NO** | **MISSING_TOTP** | **NO** | Recreated; enrollment not finished |
| `pilot.mfa.staff@confora.test` | YES | YES | **YES** | type=`otp`; userLabel=`staff-mfa-3-test`; created=`2026-07-13T12:24:19Z`; id=REDACTED | CONFIGURE_TOTP (still listed) | **NO** | **ENROLLED_REAL_TOTP** | **YES** | Live realm roles empty — confirm COM_CERT |

---

## Counts

| Metric | Value |
|--------|------:|
| External-facing staff total | 5 |
| ENROLLED_REAL_TOTP | **1** |
| LOCAL_SMOKE_ONLY | **3** |
| MISSING_USER | **0** |
| MISSING_TOTP | **1** |
| External pilot MFA ready | **1** |

---

## Readiness rule

External pilot MFA ready = **YES** only when credential type `otp` exists.  
`pilot_smoke_mfa_verified` alone = **NO**.
