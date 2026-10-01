# Validation matrix — live I2 postmerge re-verification

```text
REVIEW_UTC = 2026-10-01T10:50:19Z
```

| ID | Check | Expected | Observed | Result |
| --- | --- | --- | --- | --- |
| V01 | Reviewer ≠ decision-freeze author | true | `bc-e5b272e5…` ≠ `bc-1a29789b…` | PASS |
| V02 | Reviewer ≠ premerge reviewer | true | `bc-e5b272e5…` ≠ `bc-1148f67c…` | PASS |
| V03 | Integration HEAD | `3805dba…` | same | PASS |
| V04 | PR #45 state | MERGED | MERGED | PASS |
| V05 | PR #45 merge method | MERGE_COMMIT | MERGE_COMMIT | PASS |
| V06 | Merge parent 1 | `9623a2f…` | same | PASS |
| V07 | Merge parent 2 | `ad8aa5a…` | same | PASS |
| V08 | Merge tree equals candidate tree | true | `ad8eed62…` | PASS |
| V09 | Merge is ancestor of integration | true | true | PASS |
| V10 | Decision-freeze R1 ancestor of merge | false | false | PASS |
| V11 | Alignment R1 ancestor of integration | false | false | PASS |
| V12 | Decision file unchanged by alignment R2 | true | empty diff | PASS |
| V13 | Decision evidence unchanged by alignment R2 | true | empty diff | PASS |
| V14 | Production mutation since pre-PR45 base | `0` | `0` | PASS |
| V15 | `api-grievances.ts` restored | false | MISSING | PASS |
| V16 | `cert-appeals/` / `cert-complaints/` created | false | ABSENT | PASS |
| V17 | Selected alternative | A | A | PASS |
| V18 | Canonical architecture | separate appeals/complaints modules | same | PASS |
| V19 | Model D | `17/9/8/8/0` | same; MD05 unresolved | PASS |
| V20 | MD05 formally resolved | false | false | PASS |
| V21 | Implementation authorized | false | false | PASS |
| V22 | Path/SoD matrices frozen | false | PENDING_GOVERNANCE_FREEZE | PASS |
| V23 | Decision evidence hashes vs manifest | 6/6 match | 6/6 match | PASS |
| V24 | Decision file SHA-256 | `9a5065a1…85880767` | same | PASS |
| V25 | Design SHA recorded live | `fcc012bf…` | present | PASS |
| V26 | Premerge review result | PASS_ACCEPT | PASS_ACCEPT | PASS |
| V27 | PR #42 untouched | OPEN draft at `6e3a3118` | same | PASS |
| V28 | PR #41 untouched | OPEN draft | same | PASS |
| V29 | PR #46 untouched | OPEN draft at `c335f7b` | same | PASS |
| V30 | Original design zip binary rehash | `fcc012bf…` | binary absent | NOT_VERIFIED |

```text
VALIDATION_STEP_COUNT = 30
VALIDATION_PASS_COUNT = 29
VALIDATION_FAILURE_COUNT = 0
VALIDATION_NOT_VERIFIED_COUNT = 1
CURRENT_BLOCKER_COUNT = 0
CURRENT_MAJOR_COUNT = 0
```

V30 is not a current blocker. Live recorded SHA values and file hashes were
verified.
