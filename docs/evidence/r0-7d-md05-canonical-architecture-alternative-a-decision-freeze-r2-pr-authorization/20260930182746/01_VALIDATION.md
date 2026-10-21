# Validation

```text
RECORD_UTC = 2026-09-30T18:27:46Z
```

| ID | Check | Expected | Observed | Result |
| --- | --- | --- | --- | --- |
| V01 | Base branch | `fix/ca-h01-frontend-f4-cutover` | same | PASS |
| V02 | Base head | `9623a2f45612e5aa843ac73b87cd34957dac48ab` | same | PASS |
| V03 | Head branch | `cursor/r0-7d-md05-alt-a-decision-freeze-r2-f315` | same | PASS |
| V04 | Head commit | `ad8aa5a16c05907a441ece20fe425544745a96f4` | same | PASS |
| V05 | Head tree | `ad8eed62e66fd0db319dbcf524864a75a3dc6013` | same | PASS |
| V06 | PR #45 head branch | pinned head branch | match | PASS |
| V07 | PR #45 head OID | `ad8aa5a…` | same | PASS |
| V08 | PR #45 base OID | `9623a2f…` | same | PASS |
| V09 | PR #45 draft/open | true / OPEN | true / OPEN | PASS |
| V10 | Candidate amended | false | false | PASS |
| V11 | Merge performed | false | false | PASS |

```text
VALIDATION_STEP_COUNT = 11
VALIDATION_PASS_COUNT = 11
VALIDATION_FAILURE_COUNT = 0
```
