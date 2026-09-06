# 07_TYPESCRIPT_BUILD_REGRESSION

Signature method: `path|TScode|normalizedMessage`

## Remediation-base vs post-remediation (frontend lint:all / build)

| Metric                   | Baseline (at remediation base)   | Feature (post-fix)               |
| ------------------------ | -------------------------------- | -------------------------------- |
| error TS raw occurrences | 147                              | 147                              |
| Unique signatures (cmp)  | 116                              | 116                              |
| Command exit             | 1 (EXPECTED_BASELINE_DIAGNOSTIC) | 1 (EXPECTED_BASELINE_DIAGNOSTIC) |

## Equivalence (required PASS)

| Gate                                   | Value |
| -------------------------------------- | ----- |
| R3_NEW_TS_DIAGNOSTIC_COUNT             | 0     |
| R3_CHANGED_TS_SIGNATURE_COUNT          | 0     |
| R3_UNCLASSIFIED_TS_DIAGNOSTIC_COUNT    | 0     |
| R3_NEW_BUILD_DIAGNOSTIC_COUNT          | 0     |
| R3_CHANGED_BUILD_SIGNATURE_COUNT       | 0     |
| R3_UNCLASSIFIED_BUILD_DIAGNOSTIC_COUNT | 0     |

Baseline-red commands are NOT claimed green. Equivalence only.
