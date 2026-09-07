# 05_ADVERSARIAL_PRIVACY_TESTS

## Detection proof (rejected implementation)

New PRIVACY_MATRIX_20 against rejected helper:

- FAIL: `expected '1' to be 'Suppressed'`
- Log: `fail_on_rejected_vitest.txt`
- REJECTED_IMPLEMENTATION_DETECTION_PROOF = true

## Post-remediation

| Suite                                                  | Result | Pass count |
| ------------------------------------------------------ | ------ | ---------- |
| admin-reports-api (incl. PRIVACY_MATRIX_20 + DOM leak) | PASS   | 10         |
| admin-reports-access                                   | PASS   | 2          |
| reports-client                                         | PASS   | 15         |
| AdminReportsGuard                                      | PASS   | 14         |
| P08 boundary (reports + report-query)                  | PASS   | 24         |

Positive controls: count 0 / 5 / 6 exact after remediation.
DOM gate: false counts 1..4 render Suppressed; zero preserved; no aria/data-count leak attributes.
Source assert: production helper contains `Number.isSafeInteger(count)` and threshold compare.
