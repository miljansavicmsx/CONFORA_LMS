# A-02 — Security Delegate Risk Review

**Task:** A02_SECURITY_DELEGATE_SIGNOFF_REVIEW  
**Date:** 2026-07-15

---

## Consolidated residual risks (post A-01-R4)

| Risk ID | Title | Severity | Domain | Status | Required decision / action |
|---------|-------|----------|--------|--------|----------------------------|
| A02-R01 | Security delegate sign-off still unsigned | **High** | Governance | **OPEN** | Complete A-02 sign-off template |
| A02-R02 | DPO/legal still unsigned | **High** | Privacy | **OPEN** | Separate DPO package review |
| A02-R03 | External pilot not approved | **High** | Governance | **OPEN** | Maintain NO-GO until gates clear |
| A02-R04 | Smoke attribute remains on manager/staff/director | **Medium** | Security | **OPEN** | Cleanup before external cutover |
| A02-R05 | STAFF-MFA-3 not re-run after 5/5 OTP | **Medium** | Security | **OPEN** | Re-run when API up |
| A02-R06 | MFA enrolled live route proof NOT_RUN | **Medium** | Security | **OPEN** | Linked denial still available from STAFF-MFA-3 |
| A02-R07 | Keycloak 26 direct-grant `amr=otp` limitation | **Medium** | Security | **OPEN** | Accept limitation or require browser proof |
| A02-R08 | Staging/production not validated | **Medium** | Infra | **OPEN** | Hosted validation before external deploy |
| A02-R09 | Real personal data not approved | **High** | Legal | **OPEN** | Explicit authorization required |
| A02-R10 | F5-5 residual security/privacy gaps (historical) | **Medium** | Security/Privacy | **OPEN** | Track per prior F5-5 register |

---

## Closed / improved since prior security package

| Item | Prior | Now |
|------|-------|-----|
| Manual TOTP enrollment for A-01 cohort | Required / PARTIAL | **5/5 OTP GO** (A-01-R4) |
| Missing MFA dedicated users | Missing (R1) | Recreated + enrolled |

---

## Risk counts (open)

| Severity | Count |
|----------|------:|
| High | 4 |
| Medium | 6 |

---

## Security delegate attention items

1. Acknowledge A-01-R4 5/5 OTP enrollment as technical closure of A-01.  
2. Decide whether smoke-attribute cleanup is a **condition** of any partial security acceptance.  
3. Decide whether STAFF-MFA-3 re-run is required before security signature or allowed as follow-up.  
4. Do **not** interpret security signature as external pilot approval without DPO/legal and G-EP gates.
