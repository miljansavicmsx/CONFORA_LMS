# A-01-R1 — Manual TOTP Recheck Discovery

**Task:** A01_R1_MANUAL_TOTP_ENROLLMENT_RECHECK  
**Date:** 2026-07-14  
**Branch:** `fix/ca-h01-frontend-f4-cutover`  
**Previous A-01:** `docs/evidence/external-pilot-technical-readiness/2026-07-14T10-46-00-a01-manual-totp-enrollment-closure/`  
**Previous A-01 verdict:** `A01_MANUAL_TOTP_ENROLLMENT_PARTIAL_MANUAL_ACTION_REQUIRED`  
**Previous commit:** `402504e`

---

## Preflight

| Check | Result |
|-------|--------|
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| Prior A-01 evidence exists | **YES** |
| Keycloak reachable | **YES** — `http://localhost:8081` (port 18080 down) |
| Nest API | **DOWN** — `localhost:4000` |
| Admin token | **OK** (container bootstrap admin; password not stored) |

---

## Delta vs A-01 (2026-07-14T10:46)

| Metric | A-01 | A-01-R1 | Change |
|--------|-----:|--------:|--------|
| External-facing total | 5 | 5 | none |
| Real TOTP enrolled | 0 | 0 | **none** |
| LOCAL_SMOKE_ONLY | 3 | 3 | none |
| MISSING users | 2 | 2 | none |
| External pilot MFA ready | 0 | 0 | none |

**Status:** **NO_CHANGE** — no manual TOTP enrollment progress detected since A-01.

---

## Realm configuration (live)

| Setting | Value |
|---------|-------|
| Realm | `confora` |
| OTP policy | `totp` / 6 digits / 30s / HmacSHA1 |
| Brute force | true |
| Browser flow | `browser` |
| Safe snapshot | `keycloak-live-otp-recheck.json` |

---

## Users rechecked

| Email | Exists | OTP | Smoke | Required actions | Status |
|-------|:------:|:---:|:-----:|------------------|--------|
| `pilot.manager@confora.test` | yes | no | true | none | LOCAL_SMOKE_ONLY |
| `pilot.staff@confora.test` | yes | no | true | none | LOCAL_SMOKE_ONLY |
| `pilot.director@confora.test` | yes | no | true | none | LOCAL_SMOKE_ONLY |
| `pilot.staff.mfa.external@confora.test` | **no** | n/a | n/a | n/a | MISSING_USER |
| `pilot.mfa.staff@confora.test` | **no** | n/a | n/a | n/a | MISSING_USER |

---

## Safe proof policy

Committed: OTP presence/absence, smoke attribute, roles, tenant UUID, redacted credential metadata.  
Not committed: secrets, QR, otpauth URLs, passwords, tokens, cookies.

---

## Discovery verdict

Manual enrollment actions from A-01 procedure **have not been completed** on the live Keycloak instance. A-01-R1 cannot upgrade to GO.
