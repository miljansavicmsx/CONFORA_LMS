# 04_R4_TECHNICAL_REVALIDATION_FACTS

All values in this file are labeled:

`INDEPENDENTLY_OBSERVED_BY_R4`

except the R5 focused sanity re-run subsection at the end.

R4 did not accept T026. R4 rejected acceptance for evidence quality only.

## Privacy behavior (INDEPENDENTLY_OBSERVED_BY_R4)

| Field                                             | Value               |
| ------------------------------------------------- | ------------------- |
| ROOT_CAUSE_CORRECTED                              | true                |
| NUMBER_IS_SAFE_INTEGER_ENFORCED                   | true                |
| NEGATIVE_COUNT_FAILS_CLOSED                       | true                |
| MALFORMED_COUNT_FAILS_CLOSED                      | true                |
| T026_SMALL_CELL_THRESHOLD                         | 5                   |
| ZERO_VISIBLE                                      | true                |
| ONE_TO_FOUR_EXACT_VISIBLE                         | false               |
| FIVE_AND_ABOVE_EXACT_VISIBLE                      | true                |
| SUPPRESSED_TRUE_ALWAYS_HIDDEN                     | true                |
| UNSAFE_SUPPRESSED_FALSE_ONE_TO_FOUR_HIDDEN        | true                |
| OMITTED_TOTAL_PRESERVED                           | true                |
| MALFORMED_COUNT_EXACT_DISCLOSURE_COUNT            | 0                   |
| R4_PRIVACY_MATRIX_CASE_COUNT                      | 20                  |
| R4_PRIVACY_MATRIX_PASS_COUNT                      | 20                  |
| R4_PRIVACY_MATRIX_FAIL_COUNT                      | 0                   |
| NEW_PRIVACY_TESTS_FAIL_ON_REJECTED_IMPLEMENTATION | true                |
| REJECTED_IMPLEMENTATION_TEST_RESULT               | 3 failed / 7 passed |
| POSITIVE_ZERO_CONTROL_PASS                        | true                |
| POSITIVE_FIVE_CONTROL_PASS                        | true                |
| POSITIVE_SIX_CONTROL_PASS                         | true                |
| PAGE_BYPASSES_PRIVACY_HELPER                      | false               |
| VISIBLE_DOM_SMALL_CELL_LEAK_COUNT                 | 0                   |
| ACCESSIBILITY_SMALL_CELL_LEAK_COUNT               | 0                   |
| HIDDEN_DOM_SMALL_CELL_LEAK_COUNT                  | 0                   |
| CHART_TOOLTIP_SMALL_CELL_LEAK_COUNT               | 0                   |
| TOTAL_RECONSTRUCTION_FINDING_COUNT                | 0                   |

## TypeScript equivalence (INDEPENDENTLY_OBSERVED_BY_R4)

Signature method: `path|TScode|normalizedMessage`

| Field                                  | Value |
| -------------------------------------- | ----- |
| R4_BASELINE_TS_DIAGNOSTIC_COUNT        | 147   |
| R4_BASELINE_TS_AFFECTED_PATH_COUNT     | 47    |
| R4_BASELINE_TS_ERROR_CODE_COUNT        | 16    |
| R4_BASELINE_TS_SIGNATURE_COUNT         | 116   |
| R4_FEATURE_TS_DIAGNOSTIC_COUNT         | 147   |
| R4_FEATURE_TS_AFFECTED_PATH_COUNT      | 47    |
| R4_FEATURE_TS_ERROR_CODE_COUNT         | 16    |
| R4_FEATURE_TS_SIGNATURE_COUNT          | 116   |
| R4_R3_NEW_TS_DIAGNOSTIC_COUNT          | 0     |
| R4_R3_CHANGED_TS_SIGNATURE_COUNT       | 0     |
| R4_R3_UNCLASSIFIED_TS_DIAGNOSTIC_COUNT | 0     |

Classification: EXPECTED_BASELINE_DIAGNOSTIC (not global green).

## Build / API typecheck (INDEPENDENTLY_OBSERVED_BY_R4)

| Field                                     | Value                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| R4_BASELINE_BUILD_RESULT                  | FAIL_EXPECTED_BASELINE_DIAGNOSTIC (exit1; 147 diagnostics; 116 signatures) |
| R4_FEATURE_BUILD_RESULT                   | FAIL_EXPECTED_BASELINE_DIAGNOSTIC (exit1; 147 diagnostics; 116 signatures) |
| R4_R3_NEW_BUILD_DIAGNOSTIC_COUNT          | 0                                                                          |
| R4_R3_CHANGED_BUILD_SIGNATURE_COUNT       | 0                                                                          |
| R4_R3_UNCLASSIFIED_BUILD_DIAGNOSTIC_COUNT | 0                                                                          |
| R4_BASELINE_API_TYPECHECK_RESULT          | FAIL_EXPECTED_BASELINE_DIAGNOSTIC (48 diagnostics)                         |
| R4_FEATURE_API_TYPECHECK_RESULT           | FAIL_EXPECTED_BASELINE_DIAGNOSTIC (48 diagnostics)                         |
| R4_R3_NEW_API_TYPECHECK_DIAGNOSTIC_COUNT  | 0                                                                          |

These global diagnostics are not claimed green.

## Tests (INDEPENDENTLY_OBSERVED_BY_R4)

| Suite             | Result | Count |
| ----------------- | ------ | ----- |
| reports-client    | PASS   | 15    |
| admin API/access  | PASS   | 12    |
| AdminReportsGuard | PASS   | 14    |
| P08 boundary      | PASS   | 24    |

## Product authority (INDEPENDENTLY_OBSERVED_BY_R4)

| Field                         | Value       |
| ----------------------------- | ----------- |
| REPORT_VIEW_COUNT             | 2           |
| CLIENT_PUBLIC_OPERATION_COUNT | 2           |
| ROUTE_COUNT                   | 2           |
| ALLOWED_ROLE_COUNT            | 4           |
| CLIENT_TENANT_SELECTOR_COUNT  | 0           |
| QUERY_PARAMETER_COUNT         | 6           |
| EXPORT_AUTHORITY              | NOT_GRANTED |
| ROW_LEVEL_AUTHORITY           | NOT_GRANTED |
| DERIVED_METRIC_AUTHORITY      | NONE        |
| AUTOMATIC_POLLING             | false       |
| PERSISTENT_CACHE              | NONE        |
| RESULT_LOGGING                | false       |

## Matrices (INDEPENDENTLY_OBSERVED_BY_R4)

| Field                                    | Value |
| ---------------------------------------- | ----- |
| T026_BEHAVIOR_EXPECTED_COUNT             | 28    |
| T026_BEHAVIOR_PASS_COUNT                 | 28    |
| T026_SECURITY_EXPECTED_COUNT             | 22    |
| T026_SECURITY_PASS_COUNT                 | 22    |
| T026_IMPLEMENTATION_EXPECTED_COUNT       | 19    |
| T026_IMPLEMENTATION_PASS_COUNT           | 19    |
| T026_THREAT_COUNT                        | 41    |
| T026_UNCONTROLLED_HIGH_RISK_THREAT_COUNT | 0     |
| T026_THREAT_WITHOUT_CONTROL_COUNT        | 0     |
| R3_S10_REFINED                           | true  |
| R3_T09_REFINED                           | true  |
| R3_B06_REFINED                           | true  |

## Secret / PII and zero-delta (INDEPENDENTLY_OBSERVED_BY_R4)

| Field                               | Value |
| ----------------------------------- | ----- |
| SECRET_FINDING_COUNT                | 0     |
| CREDENTIAL_FINDING_COUNT            | 0     |
| PRIVATE_KEY_FINDING_COUNT           | 0     |
| PII_FINDING_COUNT                   | 0     |
| BACKEND_PRODUCTION_PATH_DELTA       | 0     |
| BACKEND_ROUTE_DELTA                 | 0     |
| DATABASE_SCHEMA_DELTA               | 0     |
| MIGRATION_DELTA                     | 0     |
| EXTERNAL_DEPENDENCY_DELTA           | 0     |
| PACKAGE_MANIFEST_CHANGED_PATH_COUNT | 0     |
| LOCKFILE_CHANGED_PATH_COUNT         | 0     |
| NPMRC_CHANGED_PATH_COUNT            | 0     |

## R5 focused sanity re-run (executed during R5; source unchanged)

| Suite              | Result | Pass count |
| ------------------ | ------ | ---------- |
| reports-client     | PASS   | 15         |
| admin API + access | PASS   | 12         |
| AdminReportsGuard  | PASS   | 14         |
| P08 boundary       | PASS   | 24         |

R5 did not re-execute the full R4 forensic TypeScript/build campaign because
source/test bytes are frozen at R3 head
`487f6ec9358be2379adfe7c9696e54cea8b3d888`.
