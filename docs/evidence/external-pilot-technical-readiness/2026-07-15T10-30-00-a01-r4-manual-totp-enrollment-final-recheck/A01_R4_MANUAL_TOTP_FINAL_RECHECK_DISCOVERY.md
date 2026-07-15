# A-01-R4 — Manual TOTP Final Recheck Discovery

**Task:** A01_R4_MANUAL_TOTP_ENROLLMENT_FINAL_RECHECK  
**Date:** 2026-07-15  
**Branch:** `fix/ca-h01-frontend-f4-cutover`  
**Keycloak:** `http://localhost:18080` (container `docker-keycloak-1`)  
**Realm:** `confora`

**Prior evidence:** A-01, A-01-R1, A-01-R2, A-01-R3 (all PARTIAL)

---

## Preflight

| Check | Result |
|-------|--------|
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| Prior evidence | **YES** |
| Keycloak reachable | **YES** — `:18080` |
| Nest API | **DOWN** |
| Secrets printed/committed | **NO** |

---

## Delta vs A-01-R3

| Metric | A-01-R3 | A-01-R4 | Change |
|--------|--------:|--------:|--------|
| Users exist | 5/5 | **5/5** | — |
| Real TOTP enrolled | 1 | **5** | **+4** |
| LOCAL_SMOKE_ONLY | 3 | **0** | resolved (OTP present) |
| MISSING_USER | 0 | **0** | — |
| MISSING_TOTP | 1 | **0** | resolved |
| External pilot MFA ready (OTP-based) | 1 | **5** | **+4** |

**Status:** **ALL_FIVE_OTP_PRESENT**

---

## Cohort snapshot (live)

| Email | Exists | OTP | Smoke attr | Required actions | Status |
|-------|:------:|:---:|:----------:|------------------|--------|
| `pilot.manager@confora.test` | yes | **yes** | true | none | ENROLLED_REAL_TOTP |
| `pilot.staff@confora.test` | yes | **yes** | true | none | ENROLLED_REAL_TOTP |
| `pilot.director@confora.test` | yes | **yes** | true | none | ENROLLED_REAL_TOTP |
| `pilot.staff.mfa.external@confora.test` | yes | **yes** | absent | none | ENROLLED_REAL_TOTP |
| `pilot.mfa.staff@confora.test` | yes | **yes** | absent | CONFIGURE_TOTP | ENROLLED_REAL_TOTP |

---

## GO gate assessment

| Requirement | Met? |
|-------------|:----:|
| All five users exist | **YES** |
| All five have credential type `otp` | **YES** |
| No user is *only* LOCAL_SMOKE_ONLY | **YES** |
| No MISSING_USER | **YES** |
| No MISSING_TOTP | **YES** |
| No secrets committed | **YES** |

**Note:** Three users still carry `pilot_smoke_mfa_verified=true` **in addition to** real OTP. They are **not** classified LOCAL_SMOKE_ONLY (OTP exists). Smoke residual is recorded for cutover hygiene before external pilot — see residual risks.

---

## Discovery verdict

Live Keycloak confirms **5/5** real OTP credentials. A-01 technical enrollment closure may proceed to **GO pending security delegate review**. External pilot remains **NOT** approved.
