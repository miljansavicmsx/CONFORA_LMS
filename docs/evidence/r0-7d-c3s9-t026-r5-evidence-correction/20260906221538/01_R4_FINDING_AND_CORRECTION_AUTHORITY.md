# 01_R4_FINDING_AND_CORRECTION_AUTHORITY

## Immutable R4 result

| Field                             | Value                            |
| --------------------------------- | -------------------------------- |
| R0_7D_C3S9_T026_R4                | FAIL                             |
| T026_R4_GO                        | false                            |
| STOP_CODE                         | R0D-T026-R4-F27                  |
| STOP_REASON                       | EVIDENCE_FALSE_PASS_OR_OVERCLAIM |
| T026_R4_ACCEPTANCE_RECOMMENDATION | REJECT                           |
| T026_R4_ACCEPTANCE_READY          | false                            |

This historical R4 result is not rewritten by R5.

## R4 substantive split

| Domain                                    | R4 conclusion                |
| ----------------------------------------- | ---------------------------- |
| Privacy remediation source/tests          | PRIVACY_IMPLEMENTATION_VALID |
| Evidence quality of historical R3 package | FAIL                         |

## Owner decision authorizing R5

| Field                                                      | Value                                           |
| ---------------------------------------------------------- | ----------------------------------------------- |
| OWNER_DECISION_R0_7D_C3S9_T026_R4_F27_EVIDENCE_REMEDIATION | APPROVE_APPEND_ONLY_CORRECTIVE_EVIDENCE_PACKAGE |
| OWNER_AUTHORIZE_R0_7D_C3S9_T026_R5_EVIDENCE_CORRECTION     | GRANTED (single-use)                            |

## Historical R3 evidence root (unchanged)

```
docs/evidence/r0-7d-c3s9-t026-r3-small-cell-remediation/20260906201401/
```

| Field                                     | Value                                    |
| ----------------------------------------- | ---------------------------------------- |
| HISTORICAL_R3_EVIDENCE_CHANGED_PATH_COUNT | 0                                        |
| Historical evidence tree OID at R3 head   | ebfb9ceaa81db983ba38317fb81fe3c121ab21b6 |

R5 does not edit, rename, delete, or overwrite any file under that historical
root.

## R5 reproduction of R4-F27

| Field                                | Value |
| ------------------------------------ | ----- |
| R5_REPRODUCED_R4_F27                 | true  |
| R5_HISTORICAL_UNRESOLVED_FIELD_COUNT | 6     |

Exact six unresolved historical fields:

1. `shell-variable-branch-token` in `01_AUTHORITY_AND_REJECTED_HISTORY.md`
2. `shell-variable-base-token` in `01_AUTHORITY_AND_REJECTED_HISTORY.md`
3. `angle-bracket-R3-evidence-SHA-token` in `10_MUTATION_TOPOLOGY.md`
4. `unresolved-evidence-commit-count-marker` for R3_NEW_EVIDENCE_COMMIT_COUNT
5. unresolved-total-commit-count-marker for R3_NEW_TOTAL_COMMIT_COUNT
6. unresolved-cumulative-commit-count-marker for CUMULATIVE_FEATURE_COMMIT_COUNT_FROM_INTEGRATION

Related historical defects (not erased by R5):

- corrupted integration-branch label text in historical authority file;
- historical claim `R3_EVIDENCE_PLACEHOLDER_COUNT = 0` while six unresolved fields existed;
- HISTORICAL_R3_EVIDENCE_FALSE_PASS_COUNT = 1;
- HISTORICAL_R3_EVIDENCE_OVERCLAIM_COUNT = 1;
- HISTORICAL_R3_EVIDENCE_INTERNAL_CONTRADICTION_COUNT = 3.
