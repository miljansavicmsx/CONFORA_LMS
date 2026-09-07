# 02_CORRECTED_REPOSITORY_AND_COMMIT_TOPOLOGY

All values below are resolved from Git object identity and remote refs.
No shell-variable tokens are used.

## Repository

| Field                 | Value                                                |
| --------------------- | ---------------------------------------------------- |
| REPOSITORY            | https://github.com/miljansavicmsx/CONFORA_LMS.git    |
| INTEGRATION_BRANCH    | fix/ca-h01-frontend-f4-cutover                       |
| INTEGRATION_HEAD      | 143c5e8dceed54bb4e992ea83ca7dd5837181acc             |
| REJECTED_T026_BRANCH  | governance/r0-7d-c3s9-t026-p08-adapter               |
| REJECTED_T026_HEAD    | 27087f148597b7945bfcc8e857a99dd4a4f09fe2             |
| R3_REMEDIATION_BRANCH | governance/r0-7d-c3s9-t026-r3-small-cell-remediation |
| R3_REMEDIATION_HEAD   | 487f6ec9358be2379adfe7c9696e54cea8b3d888             |

## R3 commits

| Field                      | Value                                                      |
| -------------------------- | ---------------------------------------------------------- |
| R3_SOURCE_COMMIT_SHA       | 37f6eb8c3940cb3246267b1a78f4b4ee23cb3254                   |
| R3_SOURCE_COMMIT_PARENT    | 27087f148597b7945bfcc8e857a99dd4a4f09fe2                   |
| R3_SOURCE_COMMIT_MESSAGE   | fix(reports): enforce defensive small-cell suppression     |
| R3_EVIDENCE_COMMIT_SHA     | 487f6ec9358be2379adfe7c9696e54cea8b3d888                   |
| R3_EVIDENCE_COMMIT_PARENT  | 37f6eb8c3940cb3246267b1a78f4b4ee23cb3254                   |
| R3_EVIDENCE_COMMIT_MESSAGE | docs(evidence): record T026 small-cell privacy remediation |

## Corrected replacements for historical unresolved topology fields

| Historical unresolved text                                  | Corrected value                                      |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| `shell-variable-branch-token`                               | governance/r0-7d-c3s9-t026-r3-small-cell-remediation |
| `shell-variable-base-token`                                 | 27087f148597b7945bfcc8e857a99dd4a4f09fe2             |
| `angle-bracket-R3-evidence-SHA-token`                       | 487f6ec9358be2379adfe7c9696e54cea8b3d888             |
| R3_NEW_EVIDENCE_COMMIT_COUNT unresolved                     | 1                                                    |
| R3_NEW_TOTAL_COMMIT_COUNT unresolved                        | 2                                                    |
| CUMULATIVE_FEATURE_COMMIT_COUNT_FROM_INTEGRATION unresolved | 4                                                    |

## Corrected integration-branch label

Historical R3 authority file rendered a corrupted integration label
(`ix/ca-h01-frontend-f4-cutover` form-feed artifact). Correct value:

`fix/ca-h01-frontend-f4-cutover`

## Immutable lineage through R3 head

```
143c5e8dceed54bb4e992ea83ca7dd5837181acc
  -> d7402af3a422a0e5c22d2113bf3ca45af8aaf550
  -> 27087f148597b7945bfcc8e857a99dd4a4f09fe2
  -> 37f6eb8c3940cb3246267b1a78f4b4ee23cb3254
  -> 487f6ec9358be2379adfe7c9696e54cea8b3d888
```

## R3 relative counts (resolved)

| Metric                                                        | Value |
| ------------------------------------------------------------- | ----- |
| R3_NEW_SOURCE_COMMIT_COUNT                                    | 1     |
| R3_NEW_EVIDENCE_COMMIT_COUNT                                  | 1     |
| R3_NEW_TOTAL_COMMIT_COUNT                                     | 2     |
| R3_NEW_MERGE_COMMIT_COUNT                                     | 0     |
| CUMULATIVE_FEATURE_COMMIT_COUNT_FROM_INTEGRATION (at R3 head) | 4     |

## R3 path delta vs rejected feature head

| Metric                             | Value |
| ---------------------------------- | ----- |
| R3_NON_EVIDENCE_CHANGED_PATH_COUNT | 2     |
| R3_EVIDENCE_CHANGED_PATH_COUNT     | 11    |
| R3_TOTAL_CHANGED_PATH_COUNT        | 13    |
| R3_OUTSIDE_TWO_PATH_SCOPE_COUNT    | 0     |

## Cumulative unique paths at R3 head vs integration

| Metric                                                  | Value |
| ------------------------------------------------------- | ----- |
| CUMULATIVE_T026_NON_EVIDENCE_UNIQUE_PATH_COUNT          | 14    |
| CUMULATIVE_HISTORICAL_REJECTED_EVIDENCE_PATH_COUNT      | 20    |
| CUMULATIVE_R3_EVIDENCE_PATH_COUNT                       | 11    |
| CUMULATIVE_TOTAL_UNIQUE_CHANGED_PATH_COUNT (at R3 head) | 45    |
