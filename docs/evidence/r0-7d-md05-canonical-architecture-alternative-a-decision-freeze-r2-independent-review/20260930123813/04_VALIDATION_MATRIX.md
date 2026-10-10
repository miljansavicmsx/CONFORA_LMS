# Validation matrix — live independent re-verification

```text
REVIEW_UTC = 2026-09-30T12:38:13Z
```

| ID | Check | Expected | Observed | Result |
| --- | --- | --- | --- | --- |
| V01 | Candidate commit | `ad8aa5a16c05907a441ece20fe425544745a96f4` | same | PASS |
| V02 | Candidate parent | `9623a2f45612e5aa843ac73b87cd34957dac48ab` | same | PASS |
| V03 | Parent count | `1` | `1` | PASS |
| V04 | Candidate tree | `ad8eed62e66fd0db319dbcf524864a75a3dc6013` | same | PASS |
| V05 | Integration tree | `215f53e36fc8b1d3953133d6e695c96cd88e2a0a` | same | PASS |
| V06 | `6e3a3118` ancestor of candidate | `false` | exit 1 | PASS |
| V07 | Candidate ancestor of `6e3a3118` | `false` | exit 1 | PASS |
| V08 | Candidate tree equals R1 tree | `false` | different trees | PASS |
| V09 | Stable patch-id equals R1 patch-id | `false` | different patch-ids | PASS |
| V10 | Cherry-pick or rebase trailer | absent | absent | PASS |
| V11 | Remote integration HEAD | `9623a2f…` | same | PASS |
| V12 | Remote candidate branch | `ad8aa5a…` | same | PASS |
| V13 | Remote historical R1 branch | `6e3a3118…` | same | PASS |
| V14 | Pull request #42 head | `6e3a3118…` | same | PASS |
| V15 | Pull request #42 merged | `false` | `mergedAt` null | PASS |
| V16 | Pull request #42 state | OPEN draft | OPEN draft | PASS |
| V17 | Pull request for candidate branch | none | none | PASS |
| V18 | Changed path count | `10` | `10` | PASS |
| V19 | Production mutation count | `0` | `0` | PASS |
| V20 | Test mutation count | `0` | `0` | PASS |
| V21 | Schema mutation count | `0` | `0` | PASS |
| V22 | Configuration mutation count | `0` | `0` | PASS |
| V23 | Model D aggregate | `17/9/8/8/0` | `17/9/8/8/0` | PASS |
| V24 | MD05 additional paths | none | none | PASS |
| V25 | Candidate evidence hashes vs manifest | match | 6/6 match | PASS |
| V26 | Recovered EXECUTION file hashes vs manifest | `HASH_ERROR_COUNT = 0` | `0` | PASS |
| V27 | Decision file SHA-256 | `9a5065a1…85880767` | same | PASS |
| V28 | Design package SHA recorded in candidate | `fcc012bf…` | present | PASS |
| V29 | Original EXECUTION zip binary rehash | `f82e50aa…` | binary absent | NOT_VERIFIED |
| V30 | Original DESIGN zip binary rehash | `fcc012bf…` | binary absent | NOT_VERIFIED |

```text
VALIDATION_STEP_COUNT = 30
VALIDATION_PASS_COUNT = 28
VALIDATION_FAILURE_COUNT = 0
VALIDATION_NOT_VERIFIED_COUNT = 2
CURRENT_BLOCKER_COUNT = 0
CURRENT_MAJOR_COUNT = 0
```

V29 and V30 are original zip-binary rehashes. They are not current
blockers. Candidate topology, decision content, Model D arithmetic,
nonclaims, and recovered EXECUTION file hashes were verified live.
