# STAFF-MFA-3 Enforcement Closure Report

| Field | Value |
|-------|-------|
| **Evidence** | `docs/evidence/f5-pilot-readiness/2026-07-15T13-29-35-staff-mfa-3-enforcement-closure/` |
| **STAFF-MFA-1** | docs/evidence/f5-pilot-readiness/2026-07-05T13-40-00-staff-mfa-1/ |
| **STAFF-MFA-2** | docs/evidence/f5-pilot-readiness/2026-07-05T20-26-14-staff-mfa-2-pre-external-cutover/ |
| **Local pilot rollup** | docs/evidence/local-pilot-final-rollup/2026-07-08T22-22-01-local-pilot-final-rollup-1/ |
| **Verdict** | **STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF** |

## Users tested

| User | Role | Purpose |
|------|------|---------|
| `pilot.staff.no-mfa@confora.test` | COM_CERT | Local-only no-MFA denial fixture |
| `pilot.staff.mfa.route-proof@confora.test` | COM_CERT | Local-only MFA route-proof fixture |
| `pilot.staff.mfa.external@confora.test` | COM_CERT | External-ready enrolled (OTP read-only) |
| `pilot.mfa.staff@confora.test` | COM_CERT | External-ready enrolled (OTP read-only) |
| `pilot.staff@confora.test` / manager / director | staff | External-ready enrolled (OTP read-only; no smoke) |
| `pilot.learner@confora.test` | USR_CAND | Learner denial control |
| `pilot.staff.wrong-tenant@confora.test` | COM_CERT | Tenant boundary control |

## MFA challenge result

- No-MFA fixture without MFA: staff routes **DENIED (403)**
- With MFA via `/auth/mfa/verify`: overview **NOT CONFIRMED / PARTIAL**
- External-ready OTP preserved: **5/5**
- Claim signal: mfa_verified/amr otp **PARTIAL**

## Remaining security-delegate action

Formal sign-off on `STAFF_MFA_3_SECURITY_DELEGATE_DECISION_TEMPLATE.md`. Manual browser enrollment for real external-facing staff accounts before external pilot.

## Governance

- No auth bypass introduced
- No RBAC/tenant/privacy weakening
- No Prisma/migration changes
- External pilot / DPO/legal **not** approved
