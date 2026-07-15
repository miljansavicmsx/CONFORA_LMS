# A-01-R4 — Residual Risks

**Task:** A01_R4_MANUAL_TOTP_ENROLLMENT_FINAL_RECHECK  
**Date:** 2026-07-15

| Risk ID | Title | Severity | Owner | Status | Pilot impact |
|---------|-------|----------|-------|--------|--------------|
| A01R4-R01 | Smoke attribute still set on manager/staff/director despite OTP | **Medium** | Security + IT/IdP | **OPEN** | Remove `pilot_smoke_mfa_verified` before external cutover |
| A01R4-R02 | `pilot.mfa.staff` still has CONFIGURE_TOTP required action | **Low** | IT/IdP | **OPEN** | Clear stale required action |
| A01R4-R03 | `pilot.mfa.staff` realm roles empty on live probe | **Medium** | IT/IdP | **OPEN** | Confirm COM_CERT (or intended role) |
| A01R4-R04 | Nest API down — STAFF-MFA-3 / route proof not re-run | **Medium** | Platform | **OPEN** | Re-run when API up (recommended before A-02) |
| A01R4-R05 | Keycloak 26 direct-grant `amr=otp` partial | **Medium** | Engineering | **OPEN** | Credential presence + delegate review |
| A01R4-R06 | Security delegate sign-off still pending | **High** | Security delegate | **OPEN** | A-02 next; external pilot blocked |
| A01R4-R07 | DPO/legal sign-off still pending | **High** | DPO + Legal | **OPEN** | External pilot blocked |
| A01R4-R08 | External pilot / real PII / staging/prod still not approved | **High** | Program governance | **OPEN** | By design |

---

## Summary

| Severity | Open |
|----------|-----:|
| High | 3 |
| Medium | 4 |
| Low | 1 |

Enrollment technical GO does **not** clear external pilot, security delegate, or DPO/legal gates.
