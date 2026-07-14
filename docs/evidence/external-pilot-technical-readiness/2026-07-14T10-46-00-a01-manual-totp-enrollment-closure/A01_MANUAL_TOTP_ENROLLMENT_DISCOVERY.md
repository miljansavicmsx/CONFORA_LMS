# A-01 — Manual TOTP Enrollment Discovery

**Task:** A01_MANUAL_TOTP_ENROLLMENT_CLOSURE  
**Date:** 2026-07-14  
**Keycloak (live):** `http://localhost:8081` (container `confora-keycloak`, host port **8081**)  
**Branch:** `fix/ca-h01-frontend-f4-cutover`

---

## Scripts inspected

| Script | Role |
|--------|------|
| `scripts/ops/keycloak-mfa-readiness.mjs` | Realm OTP policy + MFA readiness export; creates `pilot.mfa.staff@confora.test` |
| `scripts/ops/keycloak-mfa-interactive-enrollment.mjs` | Browser CONFIGURE_TOTP attempt (dedicated MFA user) |
| `scripts/ops/keycloak-mfa-pkce-enrollment.mjs` | PKCE enrollment path for MFA test user |
| `scripts/ops/keycloak-mfa-totp-enrollment.mjs` | Admin TOTP import probe for `pilot.mfa.staff` only (local); **not** used for A-01 secret commit |
| `scripts/ops/keycloak-pilot-user-attributes.mjs` | Pilot attribute helpers including smoke MFA attribute |
| `scripts/ops/run-staff-mfa-3-enforcement-closure.mjs` | STAFF-MFA-3 enforcement + route probes |

---

## Prior evidence inspected

| Path | Verdict / finding |
|------|-------------------|
| `docs/evidence/f5-pilot-readiness/2026-07-13T14-24-16-staff-mfa-3-enforcement-closure/` | STAFF-MFA-3 GO pending security delegate; external user without MFA → **403**; OTP on `pilot.mfa.staff` then = **yes** |
| `docs/evidence/f5-pilot-readiness/2026-07-13T14-27-00-staff-mfa-3-r1-enforcement-remediation/` | R1 confirmation; same MFA posture |
| `docs/evidence/f5-pilot-readiness/2026-07-13T21-48-00-security-delegate-signoff-1/` | Manual TOTP enrollment still open (SD-R01) |
| `docs/evidence/legal-gdpr/2026-07-14T08-34-00-dpo-legal-signoff-1/` | DPO package — MFA G-EP-07 partial |
| `docs/evidence/external-pilot-technical-readiness/2026-07-14T10-23-00-external-pilot-gate-rollup-1/` | A-01 listed as P0 blocker B-EP-08 |
| `docs/evidence/td-085-sequential-regression/2026-07-13T14-26-35-td-085/` | Local baseline GO |

---

## Live Keycloak MFA / TOTP realm configuration

| Setting | Live value |
|---------|------------|
| Realm | `confora` |
| OTP policy type | `totp` |
| Digits | 6 |
| Period | 30s |
| Algorithm | HmacSHA1 |
| Brute force protected | true |
| Browser flow | `browser` (conditional OTP when user configured — per prior STAFF-MFA-3 inspection) |
| Safe snapshot | `keycloak-live-otp-inspection.json` |

**Environment note:** Compose defaults document Keycloak on **18080**; this host currently maps **8081→8080**. Admin scripts using `KEYCLOAK_BASE_URL=http://localhost:18080` will miss this instance unless env is aligned.

---

## Staff users found (live)

### A-01 minimum cohort

| Email | Exists | OTP credential | Smoke bypass | Required actions |
|-------|:------:|:--------------:|:------------:|------------------|
| `pilot.manager@confora.test` | yes | **no** | **true** | none |
| `pilot.staff@confora.test` | yes | **no** | **true** | none |
| `pilot.director@confora.test` | yes | **no** | **true** | none |
| `pilot.staff.mfa.external@confora.test` | **no** | n/a | n/a | n/a |
| `pilot.mfa.staff@confora.test` | **no** | n/a | n/a | n/a |

### Additional privileged local-smoke staff (inventory)

All have `pilot_smoke_mfa_verified=true` and **no** OTP:  
`pilot.appeals@`, `pilot.comcert2@`, `pilot.comcert3@`, `pilot.reviewer@`, `pilot.reviewer2@`, `pilot.staff.wrong-tenant@`.

Realm total users: **16**. None of the privileged users currently have an OTP credential.

---

## Divergence from STAFF-MFA-3 (2026-07-13)

| Item | STAFF-MFA-3 evidence | Live 2026-07-14 |
|------|----------------------|-----------------|
| `pilot.mfa.staff@confora.test` | exists; **hasOtp=yes** | **MISSING** |
| `pilot.staff.mfa.external@confora.test` | exists; hasOtp=no (denial user) | **MISSING** |
| Local smoke staff | smoke only | smoke only (unchanged) |
| OTP enrolled among cohort | 1 | **0** |

Interpretation: Keycloak realm state was **reset or not re-seeded** with MFA dedicated users after STAFF-MFA-3. A-01 cannot close until users are recreated and real TOTP enrolled (or re-seeded via MFA readiness scripts + interactive enrollment).

---

## Classification results

| Category | Result |
|----------|--------|
| Users with real OTP credentials | **0** (A-01 cohort) |
| Users with only `pilot_smoke_mfa_verified` | manager, staff, director (+ additional privileged smoke inventory) |
| Users requiring manual TOTP for external readiness | manager, staff, director (after removing smoke if designated external) + recreate+enroll `pilot.mfa.staff` / `pilot.staff.mfa.external` |
| Required actions pending (CONFIGURE_TOTP) | **none** currently assigned |
| Live API denial re-proof | **NOT_RUN** — API down (`localhost:4000`) |
| Linked denial proof | STAFF-MFA-3 route probes: external without MFA → **403** |

---

## What proof can be safely committed

| Allowed | Forbidden |
|---------|-----------|
| Boolean OTP presence / absence | TOTP secrets / seed strings |
| Redacted credential metadata (type, createdDate, userLabel) | QR codes / otpauth URLs |
| Attribute flags (`pilot_smoke_mfa_verified` true/absent) | Passwords, admin passwords |
| Role names, tenant UUIDs | Access/refresh tokens, cookies |
| HTTP status codes from route probes | Screenshots containing secrets |

This package commits only safe metadata in `keycloak-live-otp-inspection.json` and markdown registers.

---

## Discovery verdict

**Live A-01 closure is not achieved.** Manual action required: recreate dedicated MFA users, enroll real TOTP for any staff that will be external-facing, and keep or clearly segregate local smoke-only users.
