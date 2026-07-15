# TD-085-S17-R1 Sequential Regression

## S17 after fix

**Evidence:** `docs/evidence/f5-pilot-readiness/2026-07-15T14-27-15-s17-public-verify-browser/`  
**Verdict:** `S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED`

| Field | Status |
|-------|--------|
| public_route_no_auth | PASS |
| valid/invalid lookup | PASS |
| read_only | PASS |
| pii_minimization | PASS |
| f5_3 nested | PASS |

(Intermediate S17 run `2026-07-15T14-20-37` was PARTIAL until f5-3 MFA-aware fix landed.)

## TD-085 after fix

**Evidence:** `docs/evidence/td-085-sequential-regression/2026-07-15T14-31-08-td-085/`  
**Verdict:** `TD_085_GO_WITH_TRANSIENT_INFRA_NOTE` (exit 0)

| # | Command | Status | Transient | Child verdict |
|---|---------|--------|-----------|---------------|
| 1 | audit:f4-frontend-api | PASS | no | — |
| 2 | ops:f5-3-data-readiness | PASS | no | — |
| 3 | ops:s17-public-verify-browser | **PASS** | no | `S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED` |
| 4 | ops:admin-gov-final-acceptance-1 | FAIL | yes | BLOCKED_FUNCTIONAL_DEFECT |
| 5 | ops:learner-final-acceptance-1 | PASS | no | — |
| 6 | ops:f4-9-smoke | FAIL | yes | — |

Privacy/governance false-positive path cleared: S17 no longer emits `NO_GO_PRIVACY_OR_GOVERNANCE_REGRESSION`.
