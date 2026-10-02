# Live verification and status alignment

```text
RECORD_UTC = 2026-10-01T12:15:17Z
FROZEN_INTEGRATION_HEAD_AT_ALIGNMENT_START =
3805dba2ceb70d64b7ba967de6beb78beab67e9e
FROZEN_INTEGRATION_TREE_AT_ALIGNMENT_START =
357d41026223b05582a93b26b84e6d8cbba90f35
```

Before this R3 alignment commit, live integration carried R2 pins from
PR #47 merge tree `3805dba…`:

| Field | Before on integration `3805dba` |
| --- | --- |
| MD05_DECISION_FREEZE_R2_STATUS | R2_INTEGRATED_PENDING_INDEPENDENT_I2_POSTMERGE_REVIEW |
| PREMERGE_INDEPENDENT_REVIEW_RESULT | PASS_ACCEPT |
| POSTMERGE_I2_REVIEW_RESULT | NOT_PERFORMED |
| Aggregate MD05 R2 summary | Alternative A integrated via PR 45; premerge PASS_ACCEPT; pending independent I2 postmerge review; MD05 remains unresolved |
| Last Part E status alignment | R0-7D-MD05-...-STATUS-ALIGNMENT-R2 |

Authoritative I2 (side branch; not parent of this candidate):

| Field | Value |
| --- | --- |
| Reviewer | `bc-10bbd613-2baa-4910-af68-d3ede652703a` |
| Commit | `8b97f8aa4354ccf7db95aff0678a33bd7540d020` |
| Result | PASS_ACCEPT |
| Validation | 31 PASS / 0 FAIL / 1 NOT_VERIFIED |
| Questions | 21 PASS / 0 FAIL / 1 NOT_VERIFIED |
| Evidence | `.../i2-postmerge-review/20261001112719/` |

I2 NOT_VERIFIED meaning (copied from authoritative report; not invented):

```text
NOT_VERIFIED_ID = V32 / Q22
NOT_VERIFIED_CHECK = Original design zip binary rehash
EXPECTED = fcc012bf7ff6b2c86fe0b3fd6d41ec6cf3ff733de227c18a26c350fa4f9afad2
OBSERVED = binary absent on integration
RESULT = NOT_VERIFIED
BLOCKER = false
MUST_NOT_BE_CONVERTED_TO_PASS = true
```

Non-authoritative prior I2 claim (preserved; not authority):

| Field | Value |
| --- | --- |
| Commit | `1eaae916893d43c8c8aa1dd379073d1cd4848099` |
| Status | HISTORICAL_NONAUTHORITATIVE_SAME_RUN_AS_ALIGNMENT_R2_REVIEW_AND_MERGE |
| Stop code recorded by authoritative I2 | REVIEWER_NOT_INDEPENDENT |

Historical alignment R1 (not on integration; preserved):

| Field | Value |
| --- | --- |
| Commit | `c335f7bfdb1f9d5ab04c07e8718f299364a354ca` |
| PR | 46 OPEN draft |
| Overclaim | `R2_INTEGRATED_INDEPENDENT_REVIEW_CLOSED_ACCEPTED` |
| Accepted as live authority | false |

Verified merge facts:

```text
PR_45_STATE = MERGED
PR_45_MERGE = 426cc1ec8ab442e126678c84bb4a3586244c6d7c
PR_47_STATE = MERGED
PR_47_MERGE = 3805dba2ceb70d64b7ba967de6beb78beab67e9e
PR_47_MERGE_METHOD = MERGE_COMMIT
PR_47_MERGED_AT = 2026-10-01T10:40:19Z
```

Aligned live fields after this R3 package:

| Field | After |
| --- | --- |
| MD05_DECISION_FREEZE_R2_STATUS | R2_INTEGRATED_I2_CLOSED_ACCEPTED |
| PREMERGE_INDEPENDENT_REVIEW_RESULT | PASS_ACCEPT |
| POSTMERGE_I2_REVIEW_RESULT | PASS_ACCEPT |
| POSTMERGE_I2_VALIDATION | 31_PASS_0_FAIL_1_NOT_VERIFIED |
| POSTMERGE_I2_QUESTIONS | 21_PASS_0_FAIL_1_NOT_VERIFIED |
| MD05_ARCHITECTURE_DECISION | ALTERNATIVE_A_CLOSED_ACCEPTED |
| Aggregate MD05 R2 summary | Alternative A architecture decision CLOSED_ACCEPTED via authoritative I2 PASS_ACCEPT; MD05 remains unresolved; Model D unchanged |
| Last Part E status alignment | R0-7D-MD05-...-STATUS-ALIGNMENT-R3 |

Unchanged:

```text
MODEL_D = 17/9/8/8/0
MD05 in UNRESOLVED_ITEM_SET = true
MD05_STATUS = UNRESOLVED_ARCHITECTURE_SELECTED_PENDING_SCOPE_FREEZE
MD05_FORMALLY_RESOLVED = false
MD05_IMPLEMENTATION_AUTHORIZATION = false
MD05_ADDITIONAL_PATH_EXPANSION_ADOPTED = false
```
