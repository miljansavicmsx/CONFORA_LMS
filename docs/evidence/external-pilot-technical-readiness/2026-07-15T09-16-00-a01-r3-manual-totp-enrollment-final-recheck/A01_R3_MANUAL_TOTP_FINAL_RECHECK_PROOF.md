# A-01-R3 — Manual TOTP Final Recheck Proof

**Task:** A01_R3_MANUAL_TOTP_ENROLLMENT_FINAL_RECHECK  
**Date:** 2026-07-15  
**Secrets/QR/tokens/passwords committed:** **NO**

---

## 1. Live OTP credential metadata

Source: `keycloak-live-otp-r3-recheck.json`

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
| `pilot.mfa.staff` | absent | CONFIGURE_TOTP (still listed) |

---

## 3. Route / STAFF-MFA-3 proof

| Probe | Status | Notes |
|-------|--------|-------|
| Live staff-without-MFA denial | **NOT_RUN** | Nest API down |
| Live MFA-enrolled access | **NOT_RUN** | API down; cohort 1/5 |
| Linked STAFF-MFA-3 denial | **PASS** (historical) | 2026-07-13 |
| `ops:staff-mfa-3-enforcement-closure` | **NOT_RUN** | GO criteria not met; API down |
| TD-085 | **NOT_RUN** | No code/script changes |

`mfa_enrolled_staff_access_proof` = **NOT_RUN**  
`staff_mfa_3_rerun_status` = **NOT_RUN**

---

## 4. Proof matrix

| Element | Result |
|---------|--------|
| Operator claimed 5/5 enrollment | **Not corroborated by live API** |
| Live 5/5 OTP | **FAIL** (1/5) |
| Secrets avoided | **PASS** |
| Overall | Supports **PARTIAL** — not GO |

---

## Exact outstanding enrollments

1. `pilot.manager@confora.test` — remove smoke if external; complete CONFIGURE_TOTP until credential type `otp` exists.  
2. `pilot.staff@confora.test` — same.  
3. `pilot.director@confora.test` — same.  
4. `pilot.staff.mfa.external@confora.test` — complete CONFIGURE_TOTP until credential type `otp` exists (smoke already absent).  

After live OTP appears for all four, request A-01-R4 (or re-run R3) before security delegate A-02.
