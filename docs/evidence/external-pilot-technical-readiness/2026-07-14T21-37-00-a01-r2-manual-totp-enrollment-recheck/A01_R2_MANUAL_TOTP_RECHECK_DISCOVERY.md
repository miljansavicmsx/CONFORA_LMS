# A-01-R2 — Manual TOTP Recheck Discovery

**Task:** A01_R2_MANUAL_TOTP_ENROLLMENT_RECHECK  
**Date:** 2026-07-14  
**Branch:** `fix/ca-h01-frontend-f4-cutover`  
**Keycloak:** `http://localhost:18080` (container `docker-keycloak-1`)  
**Realm:** `confora`

**Prior evidence:**
- A-01: `docs/evidence/external-pilot-technical-readiness/2026-07-14T10-46-00-a01-manual-totp-enrollment-closure/`
- A-01-R1: `docs/evidence/external-pilot-technical-readiness/2026-07-14T12-53-00-a01-r1-manual-totp-enrollment-recheck/`

---

## Preflight

| Check | Result |
|-------|--------|
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| Prior A-01 / A-01-R1 evidence | **YES** |
| Keycloak reachable | **YES** — `:18080` up; `:8081` down |
| Nest API | **DOWN** |
| Secrets printed/committed | **NO** |

---

## Delta vs A-01-R1

| Metric | A-01-R1 | A-01-R2 | Change |
|--------|--------:|--------:|--------|
| Users exist | 3/5 | **5/5** | **+2** (MISSING users recreated) |
| Real TOTP enrolled | 0 | **1** | **+1** (`pilot.mfa.staff`) |
| LOCAL_SMOKE_ONLY | 3 | **3** | none |
| MISSING_USER | 2 | **0** | resolved |
| MISSING_TOTP | 0 | **1** | `pilot.staff.mfa.external` exists without OTP |
| External pilot MFA ready | 0 | **1** | partial |

**Status:** **PARTIAL_PROGRESS** — recreates done; full cohort TOTP enrollment incomplete.

---

## Live realm OTP configuration

| Setting | Value |
|---------|-------|
| OTP policy | `totp` / 6 digits / 30s / HmacSHA1 |
| Brute force | true |
| Browser flow | `browser` |
| Snapshot | `keycloak-live-otp-r2-recheck.json` |

---

## Cohort snapshot

| Email | Exists | OTP | Smoke | Required actions | Status |
|-------|:------:|:---:|:-----:|------------------|--------|
| `pilot.manager@confora.test` | yes | no | true | CONFIGURE_TOTP | LOCAL_SMOKE_ONLY |
| `pilot.staff@confora.test` | yes | no | true | CONFIGURE_TOTP | LOCAL_SMOKE_ONLY |
| `pilot.director@confora.test` | yes | no | true | CONFIGURE_TOTP | LOCAL_SMOKE_ONLY |
| `pilot.staff.mfa.external@confora.test` | yes | no | absent | CONFIGURE_TOTP | MISSING_TOTP |
| `pilot.mfa.staff@confora.test` | yes | **yes** | absent | CONFIGURE_TOTP | ENROLLED_REAL_TOTP |

---

## Discovery verdict

Operator Keycloak work fixed **missing users** and enrolled **one** OTP credential. GO criteria (5/5 real OTP, none smoke-only) are **not** met. Verdict remains **PARTIAL**.
