# Validation matrix — live I2 postmerge re-verification

```text
REVIEW_UTC = 2026-10-01T11:27:19Z
```

| ID | Check | Expected | Observed | Result |
| --- | --- | --- | --- | --- |
| V01 | Reviewer ≠ decision-freeze author | true | `bc-10bbd613…` ≠ `bc-1a29789b…` | PASS |
| V02 | Reviewer ≠ decision-freeze premerge reviewer | true | ≠ `bc-1148f67c…` | PASS |
| V03 | Reviewer ≠ alignment R2 author / freeze premerge | true | ≠ `bc-1148f67c…` | PASS |
| V04 | Reviewer ≠ alignment R2 reviewer/merger / prior I2 claim | true | ≠ `bc-e5b272e5…` | PASS |
| V05 | Integration HEAD | `3805dba…` | same | PASS |
| V06 | Integration tree | `357d4102…` | same | PASS |
| V07 | PR #45 state / method | MERGED / MERGE_COMMIT | same | PASS |
| V08 | PR #45 parents | `9623a2f` + `ad8aa5a` | same | PASS |
| V09 | PR #45 tree equals candidate tree | `ad8eed62…` | same | PASS |
| V10 | PR #45 merge ancestor of integration | true | true | PASS |
| V11 | PR #47 state / method / mergedAt | MERGED / MERGE_COMMIT / `2026-10-01T10:40:19Z` | same | PASS |
| V12 | PR #47 parents | `426cc1e` + `028fee9` | same | PASS |
| V13 | PR #47 tree equals candidate tree | `357d4102…` | same | PASS |
| V14 | Decision-freeze R1 ancestor of integration | false | false | PASS |
| V15 | Alignment R1 ancestor of integration | false | false | PASS |
| V16 | Decision file unchanged by alignment R2 | true | empty diff | PASS |
| V17 | Decision evidence unchanged by alignment R2 | true | empty diff | PASS |
| V18 | Production mutation since pre-PR45 base | `0` | `0` outside `docs/` | PASS |
| V19 | Alignment delta path class | 9 governance/evidence paths | 9 | PASS |
| V20 | `api-grievances.ts` restored | false | MISSING | PASS |
| V21 | `cert-appeals/` / `cert-complaints/` created | false | ABSENT | PASS |
| V22 | Selected alternative / architecture | A / separate modules | same | PASS |
| V23 | Model D / MD05 unresolved | `17/9/8/8/0`; MD05 in UNRESOLVED_ITEM_SET | same | PASS |
| V24 | Implementation / formal resolution | false / false | same | PASS |
| V25 | Path/SoD matrices | PENDING_GOVERNANCE_FREEZE | same | PASS |
| V26 | Live Part E I2 pin still NOT_PERFORMED | true | true | PASS |
| V27 | Live Part E does not claim CLOSED_ACCEPTED | true | only as R1 overclaim description | PASS |
| V28 | Decision evidence hashes vs manifest | 6/6 | 6/6 | PASS |
| V29 | Alignment R2 evidence hashes vs manifest | 5/5 | 5/5 | PASS |
| V30 | Decision file SHA-256 | `9a5065a1…85880767` | same | PASS |
| V31 | Historical PRs 41/42/46/48 untouched | OPEN drafts | same | PASS |
| V32 | Original design zip binary rehash | `fcc012bf…` | binary absent | NOT_VERIFIED |

```text
VALIDATION_STEP_COUNT = 32
VALIDATION_PASS_COUNT = 31
VALIDATION_FAILURE_COUNT = 0
VALIDATION_NOT_VERIFIED_COUNT = 1
CURRENT_BLOCKER_COUNT = 0
CURRENT_MAJOR_COUNT = 0
```

V32 is not a current blocker. Live recorded SHA values and package file
hashes were verified. Prior non-authoritative I2 package `1eaae91…` is
excluded from authority.
