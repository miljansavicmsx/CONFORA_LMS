# Validation matrix — live independent re-verification

```text
REVIEW_UTC = 2026-10-01T10:20:23Z
```

| ID | Check | Expected | Observed | Result |
| --- | --- | --- | --- | --- |
| V01 | Reviewer bcId ≠ author bcId | `bc-e5b272e5…` ≠ `bc-1148f67c…` | different | PASS |
| V02 | Subject commit | `028fee9d633de81f7bf42f95c34ae2cd04a06a37` | same | PASS |
| V03 | Subject parent | `426cc1ec8ab442e126678c84bb4a3586244c6d7c` | same | PASS |
| V04 | Parent count | `1` | `1` | PASS |
| V05 | Subject tree | `357d41026223b05582a93b26b84e6d8cbba90f35` | same | PASS |
| V06 | Integration HEAD / tree | `426cc1e…` / `ad8eed62…` | same | PASS |
| V07 | `c335f7b` ancestor of subject | `false` | exit 1 | PASS |
| V08 | Subject tree equals R1 tree | `false` | different trees | PASS |
| V09 | Stable patch-id equals R1 | `false` | different patch-ids | PASS |
| V10 | Cherry-pick or rebase trailer | absent | absent | PASS |
| V11 | Remote subject branch head | `028fee9…` | same | PASS |
| V12 | Remote historical R1 branch head | `c335f7b…` | same | PASS |
| V13 | PR #47 state / head | OPEN draft `/028fee9…` | same | PASS |
| V14 | PR #46 state / head | OPEN draft `/c335f7b…` | same | PASS |
| V15 | PR #46 mutated/merged/deleted by subject | false | false | PASS |
| V16 | Changed path count | `9` | `9` | PASS |
| V17 | Production mutation count | `0` | `0` | PASS |
| V18 | Test mutation count | `0` | `0` | PASS |
| V19 | Schema mutation count | `0` | `0` | PASS |
| V20 | Configuration mutation count | `0` | `0` | PASS |
| V21 | PR #45 merge topology | parents `9623a2f`+`ad8aa5a`; tree `ad8eed62` | same | PASS |
| V22 | Status pin | `R2_INTEGRATED_PENDING_INDEPENDENT_I2_POSTMERGE_REVIEW` | same in decision file + Part E | PASS |
| V23 | Premerge review pin | `PASS_ACCEPT` | same | PASS |
| V24 | Postmerge I2 pin | `NOT_PERFORMED` | same | PASS |
| V25 | `CLOSED_ACCEPTED` not claimed as live MD05 status | true | only as R1 overclaim description | PASS |
| V26 | Model D unchanged | `17/9/8/8/0`; MD05 in UNRESOLVED_ITEM_SET | same | PASS |
| V27 | Candidate evidence hashes vs manifest | 5/5 match | 5/5 match | PASS |
| V28 | STOP PR #48 is not review authority | true | STOPPED_BLOCKED / not PASS | PASS |

```text
VALIDATION_STEP_COUNT = 28
VALIDATION_PASS_COUNT = 28
VALIDATION_FAILURE_COUNT = 0
VALIDATION_NOT_VERIFIED_COUNT = 0
CURRENT_BLOCKER_COUNT = 0
CURRENT_MAJOR_COUNT = 0
```
