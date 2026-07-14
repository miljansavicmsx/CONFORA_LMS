# A-01-R1 — Manual TOTP Recheck User Register

**Task:** A01_R1_MANUAL_TOTP_ENROLLMENT_RECHECK  
**Captured:** 2026-07-14 live Keycloak admin API  
**Secret/token/QR committed:** **NO** for all rows

---

## Required cohort (5)

| User email | Role / category | External-facing | Tenant | OTP present | Smoke bypass | Required action | Enrollment status | Secret/QR committed | External pilot MFA ready | Notes |
|------------|-----------------|:---------------:|--------|:-----------:|:------------:|:---------------:|-------------------|:-------------------:|:------------------------:|-------|
| `pilot.manager@confora.test` | STAFF_TRAINADM | YES | `...0001` | **NO** | **YES** | none | **LOCAL_SMOKE_ONLY** | NO | **NO** | Unchanged since A-01 |
| `pilot.staff@confora.test` | COM_CERT | YES | `...0001` | **NO** | **YES** | none | **LOCAL_SMOKE_ONLY** | NO | **NO** | Unchanged since A-01 |
| `pilot.director@confora.test` | STAFF_DIR | YES | `...0001` | **NO** | **YES** | none | **LOCAL_SMOKE_ONLY** | NO | **NO** | Unchanged since A-01 |
| `pilot.staff.mfa.external@confora.test` | COM_CERT (intended) | YES | n/a | **NO** | n/a | n/a | **MISSING_USER** | NO | **NO** | Still absent from realm |
| `pilot.mfa.staff@confora.test` | COM_CERT (intended) | YES | n/a | **NO** | n/a | n/a | **MISSING_USER** | NO | **NO** | Still absent from realm |

---

## Counts

| Metric | Value |
|--------|------:|
| External-facing staff total | 5 |
| ENROLLED_REAL_TOTP | **0** |
| LOCAL_SMOKE_ONLY | **3** |
| MISSING_USER | **2** |
| MISSING_TOTP | **0** (users either smoke-only or missing entirely) |
| External pilot MFA ready | **0** |

---

## Readiness rule (unchanged)

External pilot MFA ready = **YES** only when a real OTP/TOTP credential exists.  
`pilot_smoke_mfa_verified` alone = **NOT** ready.
