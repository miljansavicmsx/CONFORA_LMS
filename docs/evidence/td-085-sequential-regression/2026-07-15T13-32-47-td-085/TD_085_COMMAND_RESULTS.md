# TD-085 Command Results

| # | Command | Status | Exit | Duration (s) | Transient | Child verdict |
|---|---------|--------|------|--------------|-----------|---------------|
| 1 | audit:f4-frontend-api | PASS | 0 | 1 | no | — |
| 2 | ops:f5-3-data-readiness | FAIL | 1 | 6 | yes | — |
| 3 | ops:s17-public-verify-browser | FAIL | 1 | 912 | no | S17_PUBLIC_VERIFY_BROWSER_NO_GO_PRIVACY_OR_GOVERNANCE_REGRESSION |
| 4 | ops:admin-gov-final-acceptance-1 | FAIL | 1 | 9 | yes | ADMIN_GOV_FINAL_ACCEPTANCE_BLOCKED_FUNCTIONAL_DEFECT |
| 5 | ops:learner-final-acceptance-1 | FAIL | 1 | 418 | no | — |
| 6 | ops:f4-9-smoke | FAIL | 1 | 8 | yes | — |

**Stopped early:** no  
**Hard stop triggered:** no  
**Parallel execution:** false (enforced sequential)
