# STAFF-MFA-3 Security Delegate Decision Template

**Status:** UNSIGNED — template only. No approval claimed.

## Technical evidence summary

| Item | Status |
|------|--------|
| MfaGuard denies external user without MFA | CONFIRMED |
| MFA-complete user accesses staff routes | PARTIAL |
| Smoke bypass LOCAL_ONLY separation | DOCUMENTED |
| Learner / tenant boundaries | INTACT |
| Regressions (full suite) | PASS |
| MFA invariant guard | PASS |

## Decision options

| Option | External pilot impact |
|--------|----------------------|
| **APPROVE_EXTERNAL_MFA_GATE** | Clears MFA technical gate; DPO/legal still required |
| **DEFER_PENDING_MANUAL_ENROLLMENT** | External NO-GO until all external staff enrolled |
| **REJECT_MFA_NOT_SUFFICIENT** | External NO-GO; remediation required |

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Security delegate | _pending_ | — | — |
| Program owner | _pending_ | — | — |

**Recommended:** APPROVE_EXTERNAL_MFA_GATE (technical); convene DPO/legal separately
