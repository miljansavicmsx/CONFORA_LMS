# A-01-R2 — Manual TOTP Recheck Proof

**Task:** A01_R2_MANUAL_TOTP_ENROLLMENT_RECHECK  
**Date:** 2026-07-14  
**Secrets/QR/tokens/passwords committed:** **NO**

---

## 1. Live OTP credential metadata

Source: `keycloak-live-otp-r2-recheck.json`

| User | Exists | OTP type present | Safe metadata |
|------|:------:|:----------------:|---------------|
| `pilot.manager@confora.test` | yes | **NO** | n/a |
| `pilot.staff@confora.test` | yes | **NO** | n/a |
| `pilot.director@confora.test` | yes | **NO** | n/a |
| `pilot.staff.mfa.external@confora.test` | yes | **NO** | n/a |
| `pilot.mfa.staff@confora.test` | yes | **YES** | type=otp; userLabel=staff-mfa-3-test; createdDateUtc=2026-07-13T12:24:19Z; credentialId=REDACTED |

`otp_credential_metadata_captured` = **true**

---

## 2. Smoke bypass & required actions

| User | Smoke | Required actions |
|------|-------|------------------|
| manager / staff / director | `true` | CONFIGURE_TOTP |
| `pilot.staff.mfa.external` | absent | CONFIGURE_TOTP |
| `pilot.mfa.staff` | absent | CONFIGURE_TOTP (still listed despite OTP present) |

---

## 3. Route / STAFF-MFA-3 proof

| Probe | Status | Notes |
|-------|--------|-------|
| Live staff-without-MFA denial | **NOT_RUN** | Nest API down |
| Live MFA-enrolled access | **NOT_RUN** | API down; cohort not 5/5 enrolled |
| Linked STAFF-MFA-3 denial | **PASS** (historical) | 2026-07-13 evidence |
| `ops:staff-mfa-3-enforcement-closure` | **NOT_RUN** | GO criteria not met |
| TD-085 | **NOT_RUN** | No code/script changes |

`mfa_enrolled_staff_access_proof` = **NOT_RUN**  
`staff_mfa_3_rerun_status` = **NOT_RUN**

---

## 4. Keycloak direct-grant limitation

| Item | Value |
|------|-------|
| Limitation | **YES** (Keycloak 26 — prior STAFF-MFA-3) |
| Policy | Credential presence + browser enrollment + security delegate after 5/5 |

---

## Proof matrix

| Element | Result |
|---------|--------|
| All 5 users exist | **PASS** |
| All 5 have real OTP | **FAIL** (1/5) |
| Zero LOCAL_SMOKE_ONLY | **FAIL** (3 remain) |
| Secrets avoided | **PASS** |
| Overall | Supports **PARTIAL** — not GO |
