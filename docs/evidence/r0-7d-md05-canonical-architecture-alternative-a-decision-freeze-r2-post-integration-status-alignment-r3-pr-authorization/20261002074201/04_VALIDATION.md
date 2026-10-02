# Validation

```text
RECORD_UTC = 2026-10-02T07:42:01Z
```

| ID | Check | Expected | Observed | Result |
| --- | --- | --- | --- | --- |
| V01 | Independent review result | PASS / ACCEPT | PASS / ACCEPT | PASS |
| V02 | Subject commit | `ad505f5…` | same | PASS |
| V03 | Subject parent | `3805dba…` | same | PASS |
| V04 | Changed path count | `9` | `9` | PASS |
| V05 | PR pointer head equals reviewed commit | true | true | PASS |
| V06 | Candidate commit amended | false | false | PASS |
| V07 | Draft PR opened | true | false | FAIL |
| V08 | Authorization consumed only if PR opened | RECEIVED_NOT_CONSUMED when blocked | RECEIVED_NOT_CONSUMED | PASS |
| V09 | Merge performed | false | false | PASS |
| V10 | Implementation authorization | false | false | PASS |
| V11 | Model D unchanged claim | `17/9/8/8/0` | same | PASS |
| V12 | Historical PR #46 mutated | false | false | PASS |

```text
VALIDATION_STEP_COUNT = 12
VALIDATION_PASS_COUNT = 11
VALIDATION_FAILURE_COUNT = 1
VALIDATION_NOT_VERIFIED_COUNT = 0
CURRENT_BLOCKER_COUNT = 1
CURRENT_BLOCKER = PR_OPENING_PERMISSION_DENIED
```

V07 failure is environmental (GitHub collaborator / read-only token), not a
defect in the reviewed candidate content.
