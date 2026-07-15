# STAFF-MFA-3 Regression Results

| Command | Status | Mode | Notes |
|---------|--------|------|-------|
| audit:f4-frontend-api | PASS | LIVE | 1s |
| ops:f5-3-data-readiness | FAIL | LIVE_FAIL_NON_BLOCKING_FOR_MFA_INVARIANT | 4s |
| ops:f5-5-security-gdpr-audit | PASS | LIVE | 11s |
| ops:f4-9-smoke | PASS | LINKED_PASS | docs/evidence/f4-9-faza4-smoke/2026-07-08T17-14-43/ |
| ops:s17-public-verify-browser | PASS | LINKED_PASS | docs/evidence/f5-pilot-readiness/2026-07-11T22-15-26-s17-public-verify-browser/ |
| ops:admin-gov-final-acceptance-1 | PASS | LINKED_PASS | docs/evidence/admin-governance-final-acceptance/2026-07-11T22-11-33-admin-gov-final-acceptance-1/ |
| ops:learner-final-acceptance-1 | PASS | LINKED_PASS | docs/evidence/learner-final-acceptance/2026-07-11T22-13-45-learner-final-acceptance-1r/ |

Overall: **PASS** (MFA invariant guard: **PASS**)
