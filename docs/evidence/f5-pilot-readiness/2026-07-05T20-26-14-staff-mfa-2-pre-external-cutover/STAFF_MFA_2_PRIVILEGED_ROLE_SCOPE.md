# STAFF-MFA-2 Privileged Role Scope

Aligned with Nest `MFA_MANDATORY_ROLES` and STAFF-MFA-1.

| Role | MFA before external pilot |
|------|---------------------------|
| STAFF_DIR | Required |
| STAFF_SYSADM | Required |
| STAFF_TRAINADM | Required |
| STAFF_AUD | Required |
| COM_CERT | Required |
| COM_TECH / COM_IMP / COM_APP | Required |
| SME | Required |
| EXAMINER / INVIGILATOR | Required |
| QUALITY_MANAGER / AI_SECURITY_MANAGER | Required |

## Learner (out of scope)

| Role | Policy |
|------|--------|
| USR_CAND / USR_CERT | Optional except `@RequireMfa()` exam routes |

## Dedicated test accounts (not smoke)

| User | Purpose |
|------|---------|
| `pilot.mfa.staff@confora.test` | TOTP enrollment / real MFA proof |
| `pilot.staff.mfa.external@confora.test` | External-facing privileged user **without** smoke bypass |
