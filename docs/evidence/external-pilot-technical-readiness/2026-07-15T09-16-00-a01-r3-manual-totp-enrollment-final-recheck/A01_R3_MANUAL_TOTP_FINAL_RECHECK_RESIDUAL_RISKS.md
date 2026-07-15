# A-01-R3 — Residual Risks

**Task:** A01_R3_MANUAL_TOTP_ENROLLMENT_FINAL_RECHECK  
**Date:** 2026-07-15

| Risk ID | Title | Severity | Owner | Status | Pilot impact |
|---------|-------|----------|-------|--------|--------------|
| A01R3-R01 | Operator completion claim not reflected in live Keycloak OTP credentials | **High** | Ops / Security | **OPEN** | Blocks false GO; verify enrollment on correct instance (`:18080` / `confora`) |
| A01R3-R02 | Still only 1/5 real OTP | **High** | Security + IT/IdP | **OPEN** | A-01 cannot GO |
| A01R3-R03 | Three named staff LOCAL_SMOKE_ONLY | **High** | Security | **OPEN** | Smoke ≠ external MFA ready |
| A01R3-R04 | `pilot.staff.mfa.external` MISSING_TOTP | **High** | IT/IdP | **OPEN** | Complete CONFIGURE_TOTP |
| A01R3-R05 | Possible enrollment performed on wrong Keycloak URL/instance | **High** | Ops | **OPEN** | Confirm work was on `http://localhost:18080` realm `confora` |
| A01R3-R06 | Nest API down — STAFF-MFA-3 not re-run | **Medium** | Platform | **OPEN** | Re-run after 5/5 OTP |
| A01R3-R07 | Keycloak 26 direct-grant `amr=otp` partial | **Medium** | Engineering | **OPEN** | Credential presence + delegate review |
| A01R3-R08 | Security delegate / DPO still pending | **High** | Security / DPO | **OPEN** | External pilot NO-GO |
| A01R3-R09 | Secret exposure during remaining enrollment | **High** | Ops | **CONTROLLED** | This package clean |

---

## Summary

| Severity | Open |
|----------|-----:|
| High | 7 |
| Medium | 2 |
| Controlled | 1 |

**Do not advance A-02 as if A-01 were closed.**
