# STAFF-MFA-3 Report

**Verdict:** `STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF`

## Summary

Staff MFA enforcement is implemented at the API layer via `MfaGuard` and validated through Keycloak OTP + token claims. Local pilot smoke users retain an explicit `pilot_smoke_mfa_verified` bypass; external-pilot candidate users without MFA are denied on staff routes.

## Current gap

Real TOTP enrollment and/or route proof with MFA-complete token may be partial — manual enrollment for external-facing accounts remains before external pilot.

## Governance

- RBAC, tenant isolation, privacy: unchanged
- Prisma/migrations/API contracts: unchanged
- External pilot / DPO / legal: **not approved**

See also: `STAFF_MFA_3_ENFORCEMENT_CLOSURE_REPORT.md`
