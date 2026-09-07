# 08_SECURITY_MATRIX_AND_THREAT_REFINEMENT

## Matrix counts (unchanged totals)

| Matrix         | Expected count | R3 note                                                  |
| -------------- | -------------- | -------------------------------------------------------- |
| Behavior       | 28             | count unchanged; privacy strengthened via Security/tests |
| Security       | 22             | count preserved; S10 refined                             |
| Implementation | 19             | count unchanged                                          |
| Threat         | 41             | refine T09; no threat42                                  |

## Refined controls

### R3_S10_REFINED

Frontend display path must treat `suppressed:false` with `count` in 1..(threshold-1) as suppressed; backend flag alone is insufficient.

### R3_T09_REFINED

Threat: payload mismatch / trust of false suppression flag on wire JSON → exact small-cell disclosure. Control: defensive `Number.isSafeInteger` + threshold gate in `formatAggregateCountLabel` + adversarial PRIV matrix + DOM leak gate.

### R3_B06_REFINED

Static absence scans remain necessary but insufficient. Required-pass executable gate `T026_SMALL_CELL_DEFENSIVE_PRIVACY_GATE` must adversarially execute formatter+DOM cases for false+1..4 → suppressed; 0→0; ≥5 exact; omitted total preserved.

## Risk

T026_UNCONTROLLED_HIGH_RISK_THREAT_COUNT = 0 (for T09 after R3 control)
