# A-01-R2 — Residual Risks

**Task:** A01_R2_MANUAL_TOTP_ENROLLMENT_RECHECK  
**Date:** 2026-07-14

| Risk ID | Title | Severity | Owner | Status | Pilot impact |
|---------|-------|----------|-------|--------|--------------|
| A01R2-R01 | Only 1/5 external-facing users have real OTP | **High** | Security + IT/IdP | **OPEN** | Blocks A-01 GO |
| A01R2-R02 | manager/staff/director remain LOCAL_SMOKE_ONLY | **High** | Security | **OPEN** | Smoke ≠ external MFA ready |
| A01R2-R03 | `pilot.staff.mfa.external` exists but MISSING_TOTP | **High** | IT/IdP | **OPEN** | Complete CONFIGURE_TOTP enrollment |
| A01R2-R04 | `pilot.mfa.staff` OTP present but CONFIGURE_TOTP still required | **Medium** | IT/IdP | **OPEN** | Clear stale required action after verify |
| A01R2-R05 | `pilot.mfa.staff` live realm roles empty | **Medium** | IT/IdP | **OPEN** | Confirm COM_CERT (or intended role) assigned |
| A01R2-R06 | Nest API down — live route proof not run | **Medium** | Platform | **OPEN** | Re-run STAFF-MFA-3 after 5/5 enroll |
| A01R2-R07 | Keycloak 26 direct-grant `amr=otp` partial | **Medium** | Engineering | **OPEN** | Expect PARTIAL automated amr proof |
| A01R2-R08 | Security delegate / DPO still pending | **High** | Security / DPO | **OPEN** | External pilot NO-GO |
| A01R2-R09 | Secret exposure during remaining enrollment | **High** | Ops | **CONTROLLED** | This package has no secrets |

---

## Summary

| Severity | Open |
|----------|-----:|
| High | 5 |
| Medium | 4 |
| Controlled | 1 |

Progress since R1 reduces missing-user risk; enrollment completeness risk remains High.
