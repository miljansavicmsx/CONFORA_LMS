# A-01-R1 — Manual TOTP Recheck Proof

**Task:** A01_R1_MANUAL_TOTP_ENROLLMENT_RECHECK  
**Date:** 2026-07-14  
**Secrets/QR/tokens committed:** **NO**

---

## 1. Live OTP credential metadata

Source: `keycloak-live-otp-recheck.json`

| User | Exists | OTP type present | Created date | Credential ID |
|------|:------:|:----------------:|--------------|---------------|
| `pilot.manager@confora.test` | yes | **NO** | n/a | n/a |
| `pilot.staff@confora.test` | yes | **NO** | n/a | n/a |
| `pilot.director@confora.test` | yes | **NO** | n/a | n/a |
| `pilot.staff.mfa.external@confora.test` | **no** | n/a | n/a | n/a |
| `pilot.mfa.staff@confora.test` | **no** | n/a | n/a | n/a |

`otp_credential_metadata_captured` = **true** (absence / presence recorded safely).

---

## 2. Smoke bypass & required actions

| User | Smoke attribute | Required actions |
|------|-----------------|------------------|
| manager / staff / director | `pilot_smoke_mfa_verified=true` | none |
| MFA dedicated users | n/a (missing) | n/a |

---

## 3. Route proof

| Probe | Status | Notes |
|-------|--------|-------|
| Live staff-without-MFA denial | **NOT_RUN** | Nest API down |
| Live MFA-enrolled access | **NOT_RUN** | No enrolled user + API down |
| Linked STAFF-MFA-3 denial 403 | **PASS** (historical) | `2026-07-13T14-24-16-staff-mfa-3-enforcement-closure` |

`staff_without_mfa_denied` = **true** (linked evidence only).  
`mfa_enrolled_staff_access_proof` = **NOT_RUN**.

---

## 4. Keycloak direct-grant limitation

| Item | Value |
|------|-------|
| Limitation | **YES** (Keycloak 26 — prior STAFF-MFA-3) |
| Impact | Even after enrollment, automated `amr=otp` may stay PARTIAL |
| Policy | Rely on OTP credential presence + browser enrollment + security delegate |

---

## 5. STAFF-MFA-3 / TD-085

| Run | Status | Reason |
|-----|--------|--------|
| `ops:staff-mfa-3-enforcement-closure` | **NOT_RUN** | Cohort not real-TOTP enrolled; API down |
| TD-085 | **NOT_RUN** | No code/script changes |

---

## Proof matrix

| Element | Result |
|---------|--------|
| Real OTP for all 5 | **FAIL** |
| Smoke-only documented | **PASS** |
| Missing users documented | **PASS** |
| Secrets avoided | **PASS** |
| Overall | Supports **PARTIAL** — not GO |
