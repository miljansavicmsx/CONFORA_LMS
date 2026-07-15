# A-01-R4 — Manual TOTP Final Recheck Proof

**Task:** A01_R4_MANUAL_TOTP_ENROLLMENT_FINAL_RECHECK  
**Date:** 2026-07-15  
**Secrets/QR/tokens/passwords committed:** **NO**

---

## 1. Live OTP credential metadata

Source: `keycloak-live-otp-r4-recheck.json`

| User | Exists | OTP type present | Safe metadata |
|------|:------:|:----------------:|---------------|
| `pilot.manager@confora.test` | yes | **YES** | type=otp; createdDateUtc=2026-07-15T08:16:49Z; credentialId=REDACTED |
| `pilot.staff@confora.test` | yes | **YES** | type=otp; createdDateUtc=2026-07-15T08:22:38Z; credentialId=REDACTED |
| `pilot.director@confora.test` | yes | **YES** | type=otp; createdDateUtc=2026-07-15T08:25:57Z; credentialId=REDACTED |
| `pilot.staff.mfa.external@confora.test` | yes | **YES** | type=otp; createdDateUtc=2026-07-15T08:27:44Z; credentialId=REDACTED |
| `pilot.mfa.staff@confora.test` | yes | **YES** | type=otp; userLabel=staff-mfa-3-test; createdDateUtc=2026-07-13T12:24:19Z; credentialId=REDACTED |

`otp_credential_metadata_captured` = **true**

---

## 2. Smoke bypass & required actions

| User | Smoke attribute | Required actions |
|------|-----------------|------------------|
| manager / staff / director | still `true` | none |
| `pilot.staff.mfa.external` | absent | none |
| `pilot.mfa.staff` | absent | CONFIGURE_TOTP (stale; OTP already present) |

Smoke residual does **not** undo OTP enrollment GO, but must be cleared before external hosted pilot cutover.

---

## 3. Route / STAFF-MFA-3 proof

| Probe | Status | Notes |
|-------|--------|-------|
| Live staff-without-MFA denial | **NOT_RUN** | Nest API down (`localhost:4000`) |
| Live MFA-enrolled access | **NOT_RUN** | API down |
| Linked STAFF-MFA-3 denial | **PASS** (historical) | 2026-07-13 evidence |
| `ops:staff-mfa-3-enforcement-closure` | **NOT_RUN** | API down; Keycloak OTP proof complete |
| TD-085 | **NOT_RUN** | No code/script changes |

`mfa_enrolled_staff_access_proof` = **NOT_RUN**  
`staff_mfa_3_rerun_status` = **NOT_RUN**

Keycloak 26 direct-grant `amr=otp` limitation remains documented for any future automated access proof.

---

## 4. Proof matrix

| Element | Result |
|---------|--------|
| Live 5/5 OTP | **PASS** |
| No LOCAL_SMOKE_ONLY-only accounts | **PASS** |
| Secrets avoided | **PASS** |
| Live route/STAFF-MFA-3 re-run | **NOT_RUN** (API down) |
| Overall enrollment | **GO pending security delegate** |
