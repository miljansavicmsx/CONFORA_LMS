# A-01 — Manual TOTP Enrollment User Register

**Task:** A01_MANUAL_TOTP_ENROLLMENT_CLOSURE  
**Captured:** 2026-07-14 (live Keycloak admin API)  
**Tenant default:** `00000000-0000-4000-8000-000000000001`  
**Secret/token/QR committed:** **NO** for all rows

---

## A-01 minimum cohort (required)

| User email | Role / category | External-facing | Tenant | OTP credential | Smoke bypass | Required action | Enrollment status | Evidence source | External pilot ready | Notes |
|------------|-----------------|:---------------:|--------|:--------------:|:------------:|:---------------:|-------------------|-----------------|:--------------------:|-------|
| `pilot.manager@confora.test` | STAFF_TRAINADM — local smoke staff | **YES** (named A-01) | `...0001` | **NO** | **YES** | none | **LOCAL_SMOKE_ONLY** | live KC + STAFF-MFA-3 | **NO** | Smoke attribute only; not external MFA ready |
| `pilot.staff@confora.test` | COM_CERT — local smoke staff | **YES** (named A-01) | `...0001` | **NO** | **YES** | none | **LOCAL_SMOKE_ONLY** | live KC + STAFF-MFA-3 | **NO** | Primary local smoke COM_CERT |
| `pilot.director@confora.test` | STAFF_DIR — local smoke staff | **YES** (named A-01) | `...0001` | **NO** | **YES** | none | **LOCAL_SMOKE_ONLY** | live KC + STAFF-MFA-3 | **NO** | Smoke attribute only |
| `pilot.staff.mfa.external@confora.test` | COM_CERT — external denial / external candidate | **YES** | n/a | **NO** | n/a | n/a | **MISSING** | live KC (absent); STAFF-MFA-3 had user | **NO** | Must recreate; must **not** get smoke bypass; enroll OTP before external use |
| `pilot.mfa.staff@confora.test` | COM_CERT — MFA enrollment proof user | **YES** | n/a | **NO** | n/a | n/a | **MISSING** | live KC (absent); STAFF-MFA-3 had OTP | **NO** | Must recreate + enroll real TOTP |

---

## Supplemental inventory (privileged local smoke — not designated external cutover users)

| User email | Role / category | External-facing | Tenant | OTP | Smoke | Status | External pilot ready | Notes |
|------------|-----------------|:---------------:|--------|:---:|:-----:|--------|:--------------------:|-------|
| `pilot.staff.wrong-tenant@confora.test` | COM_CERT tenant-boundary control | NO | `1111...1111` | NO | YES | LOCAL_SMOKE_ONLY | NO | Keep local-only |
| `pilot.appeals@confora.test` | COM_APP | NO | `...0001` | NO | YES | LOCAL_SMOKE_ONLY | NO | Local CLRC |
| `pilot.comcert2@confora.test` | COM_CERT | NO | `...0001` | NO | YES | LOCAL_SMOKE_ONLY | NO | Local CLRC |
| `pilot.comcert3@confora.test` | COM_CERT | NO | `...0001` | NO | YES | LOCAL_SMOKE_ONLY | NO | Local CLRC |
| `pilot.reviewer@confora.test` | SME | NO | `...0001` | NO | YES | LOCAL_SMOKE_ONLY | NO | Local CLRC |
| `pilot.reviewer2@confora.test` | STAFF_TRAINADM | NO | `...0001` | NO | YES | LOCAL_SMOKE_ONLY | NO | Local CLRC |

---

## Status legend

| Status | Meaning |
|--------|---------|
| **ENROLLED** | Real OTP credential present in Keycloak; no exclusive dependence on smoke bypass for MFA |
| **LOCAL_SMOKE_ONLY** | `pilot_smoke_mfa_verified` present; **no** OTP — valid for local CLRC only |
| **MISSING** | User not present in current realm |
| **BLOCKED** | Enrollment blocked by Keycloak/env |
| **NOT_REQUIRED** | Not in A-01 external-facing cohort |

---

## Counts (A-01 named cohort of 5)

| Metric | Value |
|--------|------:|
| External-facing staff total | **5** |
| TOTP enrolled | **0** |
| LOCAL_SMOKE_ONLY | **3** |
| MISSING | **2** |
| External pilot ready (YES) | **0** |

---

## Exact missing enrollments / actions

1. **Recreate** `pilot.mfa.staff@confora.test` (no smoke bypass) → assign `CONFIGURE_TOTP` → enroll authenticator → verify OTP credential type `otp`.  
2. **Recreate** `pilot.staff.mfa.external@confora.test` (no smoke bypass) → for denial testing leave OTP **absent** OR enroll if converting to active external staff — document choice.  
3. **If manager/staff/director become external-facing users:** remove `pilot_smoke_mfa_verified`, assign `CONFIGURE_TOTP`, enroll TOTP, verify credential.  
4. **If they remain local CLRC smoke users:** keep smoke bypass; mark **LOCAL_SMOKE_ONLY**; do **not** claim external-pilot MFA ready.  
5. Re-run A-01 inspection + `ops:staff-mfa-3-enforcement-closure` after enrollments.  
6. Present results to security delegate (A-02).

---

## Explicit non-claims

- No user in this register is external-pilot MFA ready.  
- Smoke bypass ≠ TOTP enrollment.  
- Prior STAFF-MFA-3 OTP presence for `pilot.mfa.staff` is **superseded** by current MISSING state for A-01 live closure.
