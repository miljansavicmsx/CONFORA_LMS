# A-01-R3 — Manual TOTP Final Recheck User Register

**Task:** A01_R3_MANUAL_TOTP_ENROLLMENT_FINAL_RECHECK  
**Captured:** 2026-07-15 live Keycloak admin API (`http://localhost:18080`)  
**Secret/token/QR/password committed:** **NO** for all rows

---

## Required cohort (5)

| User email | External-facing | Exists | OTP present | Credential metadata | Required action | Smoke bypass | Status | External pilot MFA ready | Notes |
|------------|:---------------:|:------:|:-----------:|---------------------|-----------------|:------------:|--------|:------------------------:|-------|
| `pilot.manager@confora.test` | YES | YES | **NO** | password only | CONFIGURE_TOTP | **YES** | **LOCAL_SMOKE_ONLY** | **NO** | Unchanged vs R2 |
| `pilot.staff@confora.test` | YES | YES | **NO** | password only | CONFIGURE_TOTP | **YES** | **LOCAL_SMOKE_ONLY** | **NO** | Unchanged vs R2 |
| `pilot.director@confora.test` | YES | YES | **NO** | password only | CONFIGURE_TOTP | **YES** | **LOCAL_SMOKE_ONLY** | **NO** | Unchanged vs R2 |
| `pilot.staff.mfa.external@confora.test` | YES | YES | **NO** | password only | CONFIGURE_TOTP | **NO** | **MISSING_TOTP** | **NO** | Unchanged vs R2 |
| `pilot.mfa.staff@confora.test` | YES | YES | **YES** | type=`otp`; userLabel=`staff-mfa-3-test`; created=`2026-07-13T12:24:19Z`; id=REDACTED | CONFIGURE_TOTP | **NO** | **ENROLLED_REAL_TOTP** | **YES** | Only enrolled user |

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

## GO gate (failed)

| Requirement | Met? |
|-------------|:----:|
| All five users exist | YES |
| All five have credential type `otp` | **NO** (1/5) |
| No LOCAL_SMOKE_ONLY | **NO** (3) |
| No MISSING_USER | YES |
| No MISSING_TOTP | **NO** (1) |
| No secrets committed | YES |
