# STAFF-MFA-3 Report

**Verdict:** `STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF`

## Summary

Staff MFA enforcement is implemented at the API layer via `MfaGuard` and validated through Keycloak OTP + token claims. External-ready enrolled staff are OTP read-only. Without-MFA denial uses dedicated local fixture `pilot.staff.no-mfa@confora.test`.

## Current gap

With-MFA route proof may remain PARTIAL due to Keycloak direct-grant TOTP/amr limitation; security invariants (denial without MFA, learner denial, OTP preservation) must still pass.

## Governance

- RBAC, tenant isolation, privacy: unchanged
- Prisma/migrations/API contracts: unchanged
- External pilot / DPO / legal: **not approved**

See also: `STAFF_MFA_3_ENFORCEMENT_CLOSURE_REPORT.md`
