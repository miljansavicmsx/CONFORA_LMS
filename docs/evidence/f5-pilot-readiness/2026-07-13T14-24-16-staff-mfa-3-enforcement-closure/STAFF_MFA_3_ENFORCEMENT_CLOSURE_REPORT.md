# STAFF-MFA-3 Enforcement Closure Report

| Field | Value |
|-------|-------|
| **Evidence** | `docs/evidence/f5-pilot-readiness/2026-07-13T14-24-16-staff-mfa-3-enforcement-closure/` |
| **STAFF-MFA-1** | docs/evidence/f5-pilot-readiness/2026-07-05T13-40-00-staff-mfa-1/ |
| **STAFF-MFA-2** | docs/evidence/f5-pilot-readiness/2026-07-05T20-26-14-staff-mfa-2-pre-external-cutover/ |
| **Local pilot rollup** | docs/evidence/local-pilot-final-rollup/2026-07-08T22-22-01-local-pilot-final-rollup-1/ |
| **Verdict** | **STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF** |

## Users tested

| User | Role | Purpose |
|------|------|---------|
| `pilot.staff.mfa.external@confora.test` | COM_CERT | External-pilot candidate (no smoke bypass) |
| `pilot.mfa.staff@confora.test` | COM_CERT | Dedicated MFA enrollment proof |
| `pilot.staff@confora.test` | COM_CERT | LOCAL_ONLY smoke bypass control |
| `pilot.learner@confora.test` | USR_CAND | Learner denial control |
| `pilot.staff.wrong-tenant@confora.test` | COM_CERT | Tenant boundary control |

## MFA challenge result

- External without MFA: staff routes **DENIED (403)**
- With MFA via `/auth/mfa/verify`: overview **NOT CONFIRMED**
- TOTP enrollment: **PARTIAL**
- Claim signal: mfa_verified/amr otp **PARTIAL**

## Remaining security-delegate action

Formal sign-off on `STAFF_MFA_3_SECURITY_DELEGATE_DECISION_TEMPLATE.md`. Manual browser enrollment for real external-facing staff accounts before external pilot.

## Governance

- No auth bypass introduced
- No RBAC/tenant/privacy weakening
- No Prisma/migration changes
- External pilot / DPO/legal **not** approved
