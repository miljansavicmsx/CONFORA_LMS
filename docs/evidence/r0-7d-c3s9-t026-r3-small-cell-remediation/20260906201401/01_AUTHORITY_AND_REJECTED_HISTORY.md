# 01_AUTHORITY_AND_REJECTED_HISTORY

## Frozen authority pins

| Pin                                            | SHA                                      |
| ---------------------------------------------- | ---------------------------------------- |
| Integration ix/ca-h01-frontend-f4-cutover      | 143c5e8dceed54bb4e992ea83ca7dd5837181acc |
| Rejected T026 source (R1 feature)              | d7402af3a422a0e5c22d2113bf3ca45af8aaf550 |
| Rejected T026 evidence head                    | 27087f148597b7945bfcc8e857a99dd4a4f09fe2 |
| R3 remediation base (= rejected evidence head) | 27087f148597b7945bfcc8e857a99dd4a4f09fe2 |
| R3 source commit                               | 37f6eb8c3940cb3246267b1a78f4b4ee23cb3254 |

## Branch

- Strategy: NEW_BRANCH_FROM_REJECTED_FEATURE_HEAD
- Branch: $branch
- Parent of R3 source: $base

## R2 rejection (immutable)

- Result: FAIL
- Reported STOP: R0D-T026-R2-F03 / SMALL_CELL_SUPPRESSION_LEAK
- Catalog note: F03 historically mapped to BUILD_REGRESSION; privacy leak is F12-class → R2_FAILURE_CODE_REASON_MISMATCH=true
- Substantive rejection remains valid regardless of catalog mismatch
- Historical AD1/AD1R1 STOPPED history is not rewritten to PASS
- Rejected evidence falsely claimed 1..4 suppressed → EVIDENCE_FALSE_PASS_COUNT=1 (do not edit that package)

## Preservation

- Rejected source SHA preserved
- Rejected evidence SHA preserved
- No amend/rebase of R1/R2 history
