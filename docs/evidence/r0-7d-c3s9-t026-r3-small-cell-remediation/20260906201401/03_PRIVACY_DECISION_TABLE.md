# 03_PRIVACY_DECISION_TABLE

Canonical helper: `formatAggregateCountLabel(cell, suppressedLabel)`

Rules (ordered):

1. `suppressed === true` → suppressedLabel
2. `count` not a number OR not `Number.isSafeInteger(count)` OR `count < 0` → suppressedLabel (fail closed)
3. `count === 0` → `"0"`
4. `count > 0 && count < T026_SMALL_CELL_THRESHOLD(5)` → suppressedLabel
5. else → `String(count)` (exact)

## PRIV-01..PRIV-20

| ID      | Input                                      | Expected                                    |
| ------- | ------------------------------------------ | ------------------------------------------- |
| PRIV-01 | suppressed=false, count=0                  | `0`                                         |
| PRIV-02 | suppressed=false, count=1                  | suppressed                                  |
| PRIV-03 | suppressed=false, count=2                  | suppressed                                  |
| PRIV-04 | suppressed=false, count=3                  | suppressed                                  |
| PRIV-05 | suppressed=false, count=4                  | suppressed                                  |
| PRIV-06 | suppressed=false, count=5                  | `5`                                         |
| PRIV-07 | suppressed=false, count=6                  | `6`                                         |
| PRIV-08 | suppressed=true, count=0                   | suppressed                                  |
| PRIV-09 | suppressed=true, count=1                   | suppressed                                  |
| PRIV-10 | suppressed=true, count=4                   | suppressed                                  |
| PRIV-11 | suppressed=true, count=5                   | suppressed                                  |
| PRIV-12 | suppressed=true, count=6                   | suppressed                                  |
| PRIV-13 | suppressed=false, count=`"2"` (string)     | suppressed                                  |
| PRIV-14 | suppressed=false, count=null               | suppressed                                  |
| PRIV-15 | suppressed=false, count missing            | suppressed                                  |
| PRIV-16 | suppressed=false, count=-1                 | suppressed                                  |
| PRIV-17 | suppressed=false, count=2.5                | suppressed                                  |
| PRIV-18 | suppressed=false, count=NaN                | suppressed                                  |
| PRIV-19 | suppressed=false, count=MAX_SAFE_INTEGER+1 | suppressed                                  |
| PRIV-20 | omitted `total` with mixed groups          | `isTotalOmitted` true; no rematerialization |

Executable gate: `T026_SMALL_CELL_DEFENSIVE_PRIVACY_GATE` (PRIVACY_MATRIX_20 + DOM leak attrs).
