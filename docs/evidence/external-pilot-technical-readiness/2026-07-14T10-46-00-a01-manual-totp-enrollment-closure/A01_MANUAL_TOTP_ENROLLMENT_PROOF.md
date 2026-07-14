# A-01 — Manual TOTP Enrollment Proof

**Task:** A01_MANUAL_TOTP_ENROLLMENT_CLOSURE  
**Date:** 2026-07-14  
**Secrets/QR/tokens committed:** **NO**

---

## 1. Live OTP credential metadata (safe)

Source: `keycloak-live-otp-inspection.json` (admin credentials API).

| User | Exists | OTP type present | Credential ID | Smoke bypass |
|------|:------:|:----------------:|---------------|:------------:|
| `pilot.manager@confora.test` | yes | **NO** | n/a | true |
| `pilot.staff@confora.test` | yes | **NO** | n/a | true |
| `pilot.director@confora.test` | yes | **NO** | n/a | true |
| `pilot.staff.mfa.external@confora.test` | **no** | n/a | n/a | n/a |
| `pilot.mfa.staff@confora.test` | **no** | n/a | n/a | n/a |

**Result:** `otp_credential_metadata_captured` = **true** (absence documented). No OTP secrets retrieved or written.

---

## 2. Staff without MFA denied (route probe)

| Probe | Status | Source |
|-------|--------|--------|
| Live Nest API probe (2026-07-14) | **NOT_RUN** — API `localhost:4000` down | This package |
| Linked STAFF-MFA-3 | **PASS** — `pilot.staff.mfa.external@` without MFA → staff routes **403** | `.../2026-07-13T14-24-16-staff-mfa-3-enforcement-closure/mfa-proof/route-probes.json` |

Linked excerpt (status codes only):

| Route | Without MFA status |
|-------|-------------------:|
| `GET /v1/staff/reports/overview` | 403 |
| `GET /v1/staff/reports/export` | 403 |
| `POST /v1/staff/reports/export` | 403 |
| `GET /v1/staff/identity-review/queue` | 403 |
| `GET /v1/staff/certification/applications` | 403 |

**summary field `staff_without_mfa_denied`:** **true** (linked STAFF-MFA-3 proof; live re-run blocked by API down).

---

## 3. MFA-enrolled staff access proof

| Probe | Status | Notes |
|-------|--------|-------|
| Live OTP-enrolled staff route 200 | **NOT_RUN** | No enrolled external-facing user in live KC |
| STAFF-MFA-3 `withMfa` nest verify | **PARTIAL** | `nestMfaVerifyOk: false`; Keycloak direct-grant/`amr` limitation |
| Interactive `amr=otp` automation | **PARTIAL** | Documented Keycloak 26 direct-grant TOTP limitation |

**summary field `mfa_enrolled_staff_access_proof`:** **PARTIAL**

**Do not fake success.** Security delegate must accept credential-presence + manual enrollment evidence when closing A-01 later.

---

## 4. Keycloak direct-grant TOTP limitation

| Item | Value |
|------|-------|
| Limitation present | **YES** |
| Symptom | Password(+totp) resource-owner grant often does **not** emit `amr` containing `otp` on Keycloak 26 in prior STAFF-MFA-3 runs |
| Consequence | Automated “MFA-complete token” proof remains PARTIAL |
| Safe reliance | OTP credential presence + browser CONFIGURE_TOTP + Nest `MfaGuard` denial without MFA claim |
| Fake MFA | **Forbidden** |

---

## 5. STAFF-MFA-3 / TD-085 re-run

| Run | Status | Reason |
|-----|--------|--------|
| `ops:staff-mfa-3-enforcement-closure` | **NOT_RUN** | A-01 did not change production/shared logic; API down; dedicated MFA users missing |
| TD-085 sequential regression | **NOT_RUN** | No script/shared enrollment logic change in this task |

Linked baselines remain:

- STAFF-MFA-3: `STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF`  
- TD-085: `TD_085_GO_LOCAL_BASELINE_CONFIRMED`

---

## 6. Proof summary matrix

| Proof element | Result |
|---------------|--------|
| Live OTP for A-01 cohort | **FAIL / absent** |
| Smoke-only local staff documented | **PASS** |
| Denied-without-MFA (linked) | **PASS** |
| Enrolled-with-MFA route | **PARTIAL / NOT_RUN** |
| Secrets avoided | **PASS** |

**Overall proof posture for A-01:** supports **PARTIAL_MANUAL_ACTION_REQUIRED**, not GO.
