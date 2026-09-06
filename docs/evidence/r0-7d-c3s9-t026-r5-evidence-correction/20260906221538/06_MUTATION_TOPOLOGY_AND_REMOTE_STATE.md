# 06_MUTATION_TOPOLOGY_AND_REMOTE_STATE

This file records immutable pre-commit topology facts only.
It intentionally omits any commit SHA that cannot exist until after the R5
evidence-only commit is created. Actual R5 commit SHA belongs in the external
Cursor final report and later independent Codex review.

## R5 branch identity

| Field                             | Value                                             |
| --------------------------------- | ------------------------------------------------- |
| R5_BRANCH                         | governance/r0-7d-c3s9-t026-r5-evidence-correction |
| R5_PARENT                         | 487f6ec9358be2379adfe7c9696e54cea8b3d888          |
| R5_STRATEGY                       | NEW_BRANCH_FROM_R3_REMEDIATION_HEAD               |
| R5_EXPECTED_NEW_COMMIT_COUNT      | 1                                                 |
| R5_EXPECTED_MERGE_COMMIT_COUNT    | 0                                                 |
| R5_EXPECTED_NON_EVIDENCE_DELTA    | 0                                                 |
| R5_EXPECTED_EVIDENCE_PATH_COUNT   | 7                                                 |
| R5_PR_AUTHORITY                   | NOT_GRANTED                                       |
| R5_MERGE_AUTHORITY                | NOT_GRANTED                                       |
| FORCE_PUSH_AUTHORITY              | NOT_GRANTED                                       |
| DIRECT_INTEGRATION_PUSH_AUTHORITY | NOT_GRANTED                                       |

## Expected evidence paths (relative)

```
docs/evidence/r0-7d-c3s9-t026-r5-evidence-correction/20260906221538/00_SUMMARY.md
docs/evidence/r0-7d-c3s9-t026-r5-evidence-correction/20260906221538/01_R4_FINDING_AND_CORRECTION_AUTHORITY.md
docs/evidence/r0-7d-c3s9-t026-r5-evidence-correction/20260906221538/02_CORRECTED_REPOSITORY_AND_COMMIT_TOPOLOGY.md
docs/evidence/r0-7d-c3s9-t026-r5-evidence-correction/20260906221538/03_CORRECTED_EVIDENCE_QUALITY_RECONCILIATION.md
docs/evidence/r0-7d-c3s9-t026-r5-evidence-correction/20260906221538/04_R4_TECHNICAL_REVALIDATION_FACTS.md
docs/evidence/r0-7d-c3s9-t026-r5-evidence-correction/20260906221538/05_GOVERNANCE_NON_CLAIMS_AND_SUPERSESSION_SCOPE.md
docs/evidence/r0-7d-c3s9-t026-r5-evidence-correction/20260906221538/06_MUTATION_TOPOLOGY_AND_REMOTE_STATE.md
```

## Preserved heads (pre-push authority pins)

| Ref                                                         | SHA                                      |
| ----------------------------------------------------------- | ---------------------------------------- |
| origin/fix/ca-h01-frontend-f4-cutover                       | 143c5e8dceed54bb4e992ea83ca7dd5837181acc |
| origin/governance/r0-7d-c3s9-t026-p08-adapter               | 27087f148597b7945bfcc8e857a99dd4a4f09fe2 |
| origin/governance/r0-7d-c3s9-t026-r3-small-cell-remediation | 487f6ec9358be2379adfe7c9696e54cea8b3d888 |

## Expected cumulative counts after R5 evidence-only commit

Relative to integration base `143c5e8dceed54bb4e992ea83ca7dd5837181acc`:

| Metric                                             | Value |
| -------------------------------------------------- | ----- |
| CUMULATIVE_T026_NON_EVIDENCE_UNIQUE_PATH_COUNT     | 14    |
| CUMULATIVE_HISTORICAL_REJECTED_EVIDENCE_PATH_COUNT | 20    |
| CUMULATIVE_R3_EVIDENCE_PATH_COUNT                  | 11    |
| CUMULATIVE_R5_CORRECTION_EVIDENCE_PATH_COUNT       | 7     |
| CUMULATIVE_TOTAL_UNIQUE_CHANGED_PATH_COUNT         | 52    |
| CUMULATIVE_FEATURE_COMMIT_COUNT_FROM_INTEGRATION   | 5     |

## Source immutability

| Field                                | Value |
| ------------------------------------ | ----- |
| R5_NON_EVIDENCE_WORKTREE_DELTA_COUNT | 0     |
| Historical R3 evidence root modified | false |
| Frontend source modified by R5       | false |
| Frontend tests modified by R5        | false |
| Backend modified by R5               | false |
