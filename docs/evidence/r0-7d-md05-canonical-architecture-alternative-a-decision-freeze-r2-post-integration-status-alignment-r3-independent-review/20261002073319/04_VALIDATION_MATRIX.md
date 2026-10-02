# Validation matrix — live independent re-verification

```text
REVIEW_UTC = 2026-10-02T07:33:19Z
```

| ID | Check | Expected | Observed | Result |
| --- | --- | --- | --- | --- |
| V01 | Reviewer bcId ≠ author / I2 reviewer | `bc-ead1aba4…` ≠ `bc-10bbd613…` | different | PASS |
| V02 | Reviewer ≠ R2 alignment author | ≠ `bc-1148f67c…` | different | PASS |
| V03 | Reviewer ≠ R2 alignment reviewer/merger | ≠ `bc-e5b272e5…` | different | PASS |
| V04 | Subject commit | `ad505f5188b923f83b2b6adbda2ceb894efeb90e` | same | PASS |
| V05 | Subject parent | `3805dba2ceb70d64b7ba967de6beb78beab67e9e` | same | PASS |
| V06 | Parent count | `1` | `1` | PASS |
| V07 | Subject tree | `68ebd509592ddb99113a6e7c60a1158f689e6449` | same | PASS |
| V08 | Integration HEAD / tree | `3805dba…` / `357d4102…` | same | PASS |
| V09 | `8b97f8a` ancestor of subject | `false` | exit 1 | PASS |
| V10 | `c335f7b` ancestor of subject | `false` | exit 1 | PASS |
| V11 | Cherry-pick or rebase trailer | absent | absent | PASS |
| V12 | Remote subject branch head | `ad505f5…` | same | PASS |
| V13 | Subject PR opened before review | `false` | no PR | PASS |
| V14 | PR #45 / #47 merge pins | `426cc1e…` / `3805dba…` | MERGED same | PASS |
| V15 | PR #46 mutated/merged/deleted by subject | false | OPEN draft unchanged | PASS |
| V16 | Changed path count | `9` | `9` | PASS |
| V17 | Production / test / schema / config mutation | `0` | `0` | PASS |
| V18 | Prior R1/R2/I2 evidence dirs mutated | false | none in diff | PASS |
| V19 | Authoritative I2 result pin | PASS_ACCEPT @ `8b97f8a…` | same | PASS |
| V20 | I2 validation / questions pins | 31/0/1 and 21/0/1 | same | PASS |
| V21 | Status pin | `R2_INTEGRATED_I2_CLOSED_ACCEPTED` | same in R3 decision + Part E | PASS |
| V22 | Architecture decision pin | `ALTERNATIVE_A_CLOSED_ACCEPTED` | same | PASS |
| V23 | Premerge / postmerge review pins | PASS_ACCEPT / PASS_ACCEPT | same | PASS |
| V24 | I2 NOT_VERIFIED not converted to PASS | true | retained V32/Q22 | PASS |
| V25 | MD05 formally resolved | false | false; still in UNRESOLVED_ITEM_SET | PASS |
| V26 | Model D unchanged | `17/9/8/8/0`; mutation 0 | same | PASS |
| V27 | Implementation / path expansion | false / false | same | PASS |
| V28 | Non-authoritative I2 claim preserved | `1eaae91…` historical | same | PASS |
| V29 | Candidate evidence hashes vs manifest | 5/5 match | 5/5 match | PASS |
| V30 | STOP evidence is not review authority | true | STOPPED_BLOCKED / RECEIVED_NOT_CONSUMED | PASS |

```text
VALIDATION_STEP_COUNT = 30
VALIDATION_PASS_COUNT = 30
VALIDATION_FAILURE_COUNT = 0
VALIDATION_NOT_VERIFIED_COUNT = 0
CURRENT_BLOCKER_COUNT = 0
CURRENT_MAJOR_COUNT = 0
```
