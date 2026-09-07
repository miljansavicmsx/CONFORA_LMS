# 10_MUTATION_TOPOLOGY

## Lineage (integration → R3 evidence)

```
143c5e8dceed54bb4e992ea83ca7dd5837181acc  (integration)
  -> d7402af3a422a0e5c22d2113bf3ca45af8aaf550  (rejected T026 source)
  -> 27087f148597b7945bfcc8e857a99dd4a4f09fe2  (rejected T026 evidence head / R3 base)
  -> 37f6eb8c3940cb3246267b1a78f4b4ee23cb3254  (R3 source: fix(reports): enforce defensive small-cell suppression)
  -> <R3_EVIDENCE_COMMIT_SHA>  (docs(evidence): record T026 small-cell privacy remediation)
```

## R3 relative to rejected feature head

| Metric                                           | Required | Actual (pre-evidence-commit) |
| ------------------------------------------------ | -------- | ---------------------------- |
| R3_NEW_SOURCE_COMMIT_COUNT                       | 1        | 1                            |
| R3_NEW_EVIDENCE_COMMIT_COUNT                     | 1        | pending this commit          |
| R3_NEW_TOTAL_COMMIT_COUNT                        | 2        | pending                      |
| R3_NEW_MERGE_COMMIT_COUNT                        | 0        | 0                            |
| CUMULATIVE_FEATURE_COMMIT_COUNT_FROM_INTEGRATION | 4        | pending evidence             |

## Path delta vs remediation base

| Metric                                    | Value |
| ----------------------------------------- | ----- |
| R3_NON_EVIDENCE_CHANGED_PATH_COUNT        | 2     |
| R3_EVIDENCE_CHANGED_PATH_COUNT            | 11    |
| R3_TOTAL_CHANGED_PATH_COUNT               | 13    |
| R3_OUTSIDE_FROZEN_REMEDIATION_SCOPE_COUNT | 0     |

## Cumulative vs integration base

| Metric                                             | Value |
| -------------------------------------------------- | ----- |
| CUMULATIVE_T026_NON_EVIDENCE_UNIQUE_PATH_COUNT     | 14    |
| CUMULATIVE_HISTORICAL_REJECTED_EVIDENCE_PATH_COUNT | 20    |
| CUMULATIVE_R3_NEW_EVIDENCE_PATH_COUNT              | 11    |
| CUMULATIVE_TOTAL_UNIQUE_CHANGED_PATH_COUNT         | 45    |

Do not report 47 by double-counting the two modified source/test paths.
