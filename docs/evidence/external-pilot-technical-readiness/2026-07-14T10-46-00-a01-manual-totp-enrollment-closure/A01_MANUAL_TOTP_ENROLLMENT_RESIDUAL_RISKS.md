# A-01 — Residual Risks

**Task:** A01_MANUAL_TOTP_ENROLLMENT_CLOSURE  
**Date:** 2026-07-14

| Risk ID | Title | Severity | Owner | Mitigation | Status | Pilot impact |
|---------|-------|----------|-------|------------|--------|--------------|
| A01-R01 | No external-facing staff has live OTP enrollment | **High** | Security + IT/IdP | Follow A01 procedure; enroll real TOTP | **OPEN** | Blocks A-01 GO; B-EP-08 remains |
| A01-R02 | Dedicated MFA users missing from Keycloak | **High** | IT/IdP | Re-run `keycloak-mfa-readiness.mjs` with correct `KEYCLOAK_BASE_URL` | **OPEN** | Breaks MFA denial/enrollment proof users |
| A01-R03 | Named cohort still LOCAL_SMOKE_ONLY | **High** | Security | Keep local-only **or** remove smoke + enroll before external use | **OPEN** | Smoke ≠ external MFA ready |
| A01-R04 | Keycloak port/env mismatch (8081 vs 18080) | **Medium** | Platform | Align `.env` / scripts to live port | **OPEN** | Ops scripts may target wrong instance |
| A01-R05 | Nest API down — live route proof not re-run | **Medium** | Platform | Start API; re-run STAFF-MFA-3 | **OPEN** | Rely on linked 2026-07-13 denial proof |
| A01-R06 | Keycloak 26 direct-grant `amr=otp` partial | **Medium** | Engineering | Manual enrollment + credential metadata; delegate review | **OPEN** | Access proof stays PARTIAL |
| A01-R07 | Accidental smoke bypass on external user | **High** | IdP admin | Attribute audit before cutover; reject if smoke on external | **OPEN** | External pilot security regression |
| A01-R08 | Security delegate sign-off still pending | **High** | Security delegate | A-02 after A-01 closes | **OPEN** | External pilot NO-GO |
| A01-R09 | DPO/legal still pending | **High** | DPO + Legal | Separate privacy gate | **OPEN** | External pilot NO-GO |
| A01-R10 | Importing TOTP secrets into evidence | **High** | Ops | Procedure forbids; this package has none | **CONTROLLED** | Would be evidence compromise |

---

## Summary

| Severity | Open |
|----------|-----:|
| High | 6 |
| Medium | 3 |
| Controlled | 1 |

A-01 does **not** close B-EP-08 / R-EP-12 / SD-R01 from the external pilot gate rollup.
