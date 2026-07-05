# STAFF-MFA-2 Security Delegate Decision Package

**Status:** PENDING — no approval claimed in this task.

| Option | Approver role | External pilot impact | Evidence needed | Residual risk |
|--------|---------------|----------------------|-----------------|---------------|
| MFA_ENFORCED_FOR_EXTERNAL_PRIVILEGED_USERS | Security delegate + Program owner | Enables MFA gate clearance | TOTP login + amr otp + staff route proof | Low if enforced |
| MFA_READY_PENDING_MANUAL_ENROLLMENT | Security delegate | External NO-GO until enrollment | This STAFF-MFA-2 bundle + manual Account console enrollment | Medium |
| RISK_ACCEPTED_TEMPORARY_PASSWORD_ONLY | Security delegate + Program owner | External CONDITIONAL only | Signed risk acceptance | High |
| BLOCKED_IDP_POLICY_GAP | Security delegate | External NO-GO | IdP remediation plan | High |

**Recommended:** MFA_READY_PENDING_MANUAL_ENROLLMENT — policy split complete; complete interactive TOTP enrollment for external-facing accounts before external pilot.
