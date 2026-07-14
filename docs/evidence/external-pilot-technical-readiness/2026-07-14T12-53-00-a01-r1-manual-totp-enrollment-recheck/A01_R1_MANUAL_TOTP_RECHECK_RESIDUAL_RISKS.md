# A-01-R1 — Residual Risks

**Task:** A01_R1_MANUAL_TOTP_ENROLLMENT_RECHECK  
**Date:** 2026-07-14

| Risk ID | Title | Severity | Owner | Status | Pilot impact |
|---------|-------|----------|-------|--------|--------------|
| A01R1-R01 | Still zero real TOTP enrollments in external-facing cohort | **High** | Security + IT/IdP | **OPEN** | A-01 cannot GO; B-EP-08 remains |
| A01R1-R02 | MFA dedicated users still missing | **High** | IT/IdP | **OPEN** | Blocks enrollment + denial proof users |
| A01R1-R03 | Named staff remain LOCAL_SMOKE_ONLY | **High** | Security | **OPEN** | Smoke ≠ external MFA ready |
| A01R1-R04 | No progress since A-01 — enrollment not executed | **High** | Program / Ops | **OPEN** | Schedule slips; recheck loops |
| A01R1-R05 | Keycloak URL port mismatch (8081 vs 18080) | **Medium** | Platform | **OPEN** | Seed scripts may hit wrong host |
| A01R1-R06 | Nest API down — live route proof not run | **Medium** | Platform | **OPEN** | Rely on linked STAFF-MFA-3 only |
| A01R1-R07 | Keycloak 26 direct-grant `amr=otp` partial | **Medium** | Engineering | **OPEN** | Access proof may stay PARTIAL after enroll |
| A01R1-R08 | Security delegate / DPO still pending | **High** | Security / DPO | **OPEN** | External pilot NO-GO |
| A01R1-R09 | Accidental secret commit during future enrollment | **High** | Ops | **CONTROLLED** | Procedure forbids; this package clean |

---

## Summary

| Severity | Open |
|----------|-----:|
| High | 6 |
| Medium | 3 |
| Controlled | 1 |

No High risk downgraded — enrollment gaps unchanged from A-01.
