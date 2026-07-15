# A-01-R3 — Manual TOTP Final Recheck Discovery

**Task:** A01_R3_MANUAL_TOTP_ENROLLMENT_FINAL_RECHECK  
**Date:** 2026-07-15  
**Branch:** `fix/ca-h01-frontend-f4-cutover`  
**Keycloak:** `http://localhost:18080` (container `docker-keycloak-1`)  
**Realm:** `confora`

**Prior evidence:**
- A-01: `2026-07-14T10-46-00-a01-manual-totp-enrollment-closure/`
- A-01-R1: `2026-07-14T12-53-00-a01-r1-manual-totp-enrollment-recheck/`
- A-01-R2: `2026-07-14T21-37-00-a01-r2-manual-totp-enrollment-recheck/`

---

## Preflight

| Check | Result |
|-------|--------|
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| Prior evidence exists | **YES** |
| Keycloak reachable | **YES** — `:18080` |
| Nest API | **DOWN** |
| Secrets printed/committed | **NO** |

---

## Operator claim vs live observation

| Source | Claim / observation |
|--------|---------------------|
| Operator | Remaining 4 users completed real OTP/TOTP enrollment |
| Live Keycloak admin API (2026-07-15) | **Unchanged vs A-01-R2** — still **1/5** OTP |

**This package records live admin API truth. It does not fabricate GO.**

---

## Delta vs A-01-R2

| Metric | A-01-R2 | A-01-R3 | Change |
|--------|--------:|--------:|--------|
| Users exist | 5/5 | 5/5 | none |
| Real TOTP enrolled | 1 | **1** | **none** |
| LOCAL_SMOKE_ONLY | 3 | **3** | none |
| MISSING_USER | 0 | **0** | none |
| MISSING_TOTP | 1 | **1** | none |
| External pilot MFA ready | 1 | **1** | none |

**Status:** **NO_CHANGE**

---

## Cohort snapshot (live)

| Email | Exists | OTP | Smoke | Required actions | Status |
|-------|:------:|:---:|:-----:|------------------|--------|
| `pilot.manager@confora.test` | yes | no | true | CONFIGURE_TOTP | LOCAL_SMOKE_ONLY |
| `pilot.staff@confora.test` | yes | no | true | CONFIGURE_TOTP | LOCAL_SMOKE_ONLY |
| `pilot.director@confora.test` | yes | no | true | CONFIGURE_TOTP | LOCAL_SMOKE_ONLY |
| `pilot.staff.mfa.external@confora.test` | yes | no | absent | CONFIGURE_TOTP | MISSING_TOTP |
| `pilot.mfa.staff@confora.test` | yes | **yes** | absent | CONFIGURE_TOTP | ENROLLED_REAL_TOTP |

---

## Discovery verdict

Final recheck **cannot** issue GO. Live credentials still fail the 5/5 OTP requirement. Manual enrollment for the remaining four users is still required on this Keycloak instance (`localhost:18080` / realm `confora`).
