# TD-085 Command Results

| # | Command | Status | Exit | Duration (s) | Transient | Child verdict |
|---|---------|--------|------|--------------|-----------|---------------|
| 1 | audit:f4-frontend-api | PASS | 0 | 4 | no | — |
| 2 | ops:f5-3-data-readiness | PASS | 0 | 10 | no | — |
| 3 | ops:s17-public-verify-browser | PASS | 0 | 246 | no | S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED |
| 4 | ops:admin-gov-final-acceptance-1 | FAIL | 1 | 20 | yes | ADMIN_GOV_FINAL_ACCEPTANCE_BLOCKED_FUNCTIONAL_DEFECT |
| 5 | ops:learner-final-acceptance-1 | PASS | 0 | 96 | no | — |
| 6 | ops:f4-9-smoke | FAIL | 1 | 8 | yes | — |

**Stopped early:** no  
**Hard stop triggered:** no  
**Parallel execution:** false (enforced sequential)
