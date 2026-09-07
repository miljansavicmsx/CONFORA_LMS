# 06_SCOPE_AND_PRODUCT_NON_DRIFT

## R3 remediation delta (vs 27087f1…)

| Metric                                    | Value                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| R3_NON_EVIDENCE_CHANGED_PATH_COUNT        | 2                                                                                                       |
| Paths                                     | `frontend-app/src/lib/admin-reports-api.ts`, `frontend-app/src/lib/__tests__/admin-reports-api.test.ts` |
| R3_OUTSIDE_FROZEN_REMEDIATION_SCOPE_COUNT | 0                                                                                                       |

## Product invariants (unchanged)

| Invariant                     | Value                        |
| ----------------------------- | ---------------------------- |
| REPORT_VIEW_COUNT             | 2 (by-status, by-scheme-ref) |
| CLIENT_PUBLIC_OPERATION_COUNT | 2                            |
| ALLOWED_ROLE_COUNT            | 4                            |
| CLIENT_TENANT_SELECTOR_COUNT  | 0                            |
| QUERY_PARAMETER_COUNT         | 6                            |
| EXPORT_AUTHORITY              | 0                            |
| ROW_LEVEL_AUTHORITY           | 0                            |
| DERIVED_METRIC_AUTHORITY      | 0                            |
| AUTOMATIC_POLLING             | 0                            |
| PERSISTENT_CACHE              | 0                            |
| RESULT_LOGGING                | 0                            |

Backend / routes / schema / migrations / dependencies / manifests / locks / .npmrc: delta 0 in R3.
