# Validation matrix — live I2 postmerge re-verification

```text
REVIEW_UTC = 2026-10-02T11:10:25Z
```

| ID | Check | Expected | Observed | Result |
| --- | --- | --- | --- | --- |
| V01 | Reviewer ≠ R3 author / authoritative I2 reviewer | true | `bc-fefd1db7…` ≠ `bc-10bbd613…` | PASS |
| V02 | Reviewer ≠ R3 premerge independent reviewer | true | ≠ `bc-ead1aba4…` | PASS |
| V03 | Reviewer ≠ decision-freeze author | true | ≠ `bc-1a29789b…` | PASS |
| V04 | Reviewer ≠ freeze premerge / R2 alignment author | true | ≠ `bc-1148f67c…` | PASS |
| V05 | Reviewer ≠ R2 reviewer/merger / prior I2 claim | true | ≠ `bc-e5b272e5…` | PASS |
| V06 | Integration HEAD / tree | `1c2f649…` / `68ebd509…` | same | PASS |
| V07 | PR #49 state / method / mergedAt | MERGED / MERGE_COMMIT / `2026-10-02T10:47:18Z` | same | PASS |
| V08 | PR #49 parents | `3805dba` + `ad505f5` | same | PASS |
| V09 | PR #49 tree equals candidate tree | `68ebd509…` | same | PASS |
| V10 | PR #45 / #47 merge pins | MERGED / `426cc1e` / `3805dba` | same | PASS |
| V11 | R3 candidate parent / parent count | `3805dba…` / `1` | same | PASS |
| V12 | R3 premerge independent review | PASS_ACCEPT @ `3e3de58…` + EC1 `afe504b…` | same | PASS |
| V13 | Authoritative I2 result pin | PASS_ACCEPT @ `8b97f8a…` | same | PASS |
| V14 | I2 validation / questions pins | 31/0/1 and 21/0/1 | same | PASS |
| V15 | `8b97f8a` ancestor of integration | false | false | PASS |
| V16 | I2 evidence on integration branch | false | absent | PASS |
| V17 | R3 delta path class | 9 governance/evidence paths | 9 | PASS |
| V18 | Production / test / schema / config mutation | `0` | `0` outside `docs/` | PASS |
| V19 | Decision-freeze file/evidence unchanged by R3 | true | empty diff | PASS |
| V20 | Alignment R2 evidence unchanged by R3 | true | empty diff | PASS |
| V21 | Alignment R3 evidence hashes vs manifest | 5/5 | 5/5 | PASS |
| V22 | Live Part E status pin | `R2_INTEGRATED_I2_CLOSED_ACCEPTED` | same | PASS |
| V23 | Live Part E postmerge I2 pin | PASS_ACCEPT | same | PASS |
| V24 | Architecture decision pin | ALTERNATIVE_A_CLOSED_ACCEPTED | same | PASS |
| V25 | I2 NOT_VERIFIED not converted to PASS | true | V32/Q22 retained | PASS |
| V26 | Model D / MD05 unresolved | `17/9/8/8/0`; MD05 unresolved | same | PASS |
| V27 | Implementation / path expansion | false / false | same | PASS |
| V28 | `api-grievances.ts` / backend ownership dirs | missing / absent | same | PASS |
| V29 | Historical PRs 41/42/46/48 | OPEN | same | PASS |
| V30 | Historical R1 / prior I2 claim non-ancestor | false / false | same | PASS |
| V31 | Decision file SHA-256 | `9a5065a1…85880767` | same | PASS |
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
