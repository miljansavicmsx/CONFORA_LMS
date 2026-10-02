# Validation matrix — live R3 I2 postmerge re-verification

```text
REVIEW_UTC = 2026-10-02T11:02:45Z
```

| ID | Check | Expected | Observed | Result |
| --- | --- | --- | --- | --- |
| V01 | Reviewer ≠ R3 author / R2 I2 reviewer | ≠ `bc-10bbd613…` | `bc-95e0d378…` | PASS |
| V02 | Reviewer ≠ R3 premerge reviewer | ≠ `bc-ead1aba4…` | different | PASS |
| V03 | Reviewer ≠ R2 alignment author | ≠ `bc-1148f67c…` | different | PASS |
| V04 | Reviewer ≠ R2 alignment reviewer/merger | ≠ `bc-e5b272e5…` | different | PASS |
| V05 | Reviewer ≠ decision-freeze author | ≠ `bc-1a29789b…` | different | PASS |
| V06 | Integration HEAD | `1c2f649…` | same | PASS |
| V07 | Integration tree | `68ebd509…` | same | PASS |
| V08 | PR #49 state / method / mergedAt | MERGED / MERGE_COMMIT / `2026-10-02T10:47:18Z` | same | PASS |
| V09 | PR #49 parents | `3805dba…` + `ad505f5…` | same | PASS |
| V10 | PR #49 tree equals candidate tree | `68ebd509…` | same | PASS |
| V11 | PR #49 merge is integration HEAD | true | true | PASS |
| V12 | Candidate parent / path count | `3805dba…` / 9 | same | PASS |
| V13 | Production mutation on candidate | `0` | `0` outside `docs/` | PASS |
| V14 | Decision-freeze R2 file/evidence unchanged by R3 | true | empty diffs | PASS |
| V15 | Alignment R2 evidence unchanged by R3 | true | empty diffs | PASS |
| V16 | Authoritative R2 I2 not ancestor of integration | true | `8b97f8a` not ancestor | PASS |
| V17 | Historical alignment R1 not ancestor | true | `c335f7b` not ancestor | PASS |
| V18 | PR #45 / #47 remain ancestors | true / true | true | PASS |
| V19 | R3 premerge review result | PASS_ACCEPT @ `3e3de589…` | same | PASS |
| V20 | R3 premerge independence vs author | true | `bc-ead1aba4` ≠ `bc-10bbd613` | PASS |
| V21 | Live status pin | `R2_INTEGRATED_I2_CLOSED_ACCEPTED` | same | PASS |
| V22 | Architecture decision pin | `ALTERNATIVE_A_CLOSED_ACCEPTED` | same | PASS |
| V23 | Premerge / postmerge review pins | PASS_ACCEPT / PASS_ACCEPT | same | PASS |
| V24 | I2 validation / questions pins | 31/0/1 and 21/0/1 | same | PASS |
| V25 | I2 NOT_VERIFIED not converted to PASS | true | V32/Q22 retained | PASS |
| V26 | Model D / MD05 unresolved | `17/9/8/8/0`; MD05 in UNRESOLVED_ITEM_SET | same | PASS |
| V27 | Implementation / formal resolution | false / false | same | PASS |
| V28 | Path/SoD matrices | PENDING_GOVERNANCE_FREEZE | same | PASS |
| V29 | `api-grievances.ts` / backend dirs | MISSING / ABSENT | same | PASS |
| V30 | Historical PRs 41/42/46/48 untouched | OPEN drafts | same | PASS |
| V31 | Non-authoritative I2 claim preserved | `1eaae91…` historical | same | PASS |
| V32 | R3 candidate evidence hashes vs manifest | 5/5 | 5/5 | PASS |
| V33 | Alignment R2 evidence hashes vs manifest | 5/5 | 5/5 | PASS |
| V34 | Original design zip binary rehash | `fcc012bf…` | binary absent | NOT_VERIFIED |

```text
VALIDATION_STEP_COUNT = 34
VALIDATION_PASS_COUNT = 33
VALIDATION_FAILURE_COUNT = 0
VALIDATION_NOT_VERIFIED_COUNT = 1
CURRENT_BLOCKER_COUNT = 0
CURRENT_MAJOR_COUNT = 0
```

V34 is not a current blocker. Live recorded SHA values and package file
hashes were verified. This package does not convert V34 to PASS.
