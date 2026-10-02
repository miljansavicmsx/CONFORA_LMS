# Observed owner-supplied pins (no technical verdict)

```text
REVIEW_UTC = 2026-10-01T08:36:11Z
TECHNICAL_CONTENT_VERDICT_ISSUED = false
```

These are live observations only. Because independence failed, they are
not converted into PASS_ACCEPT or FAIL_REJECT.

| Pin | Expected | Observed |
| --- | --- | --- |
| CANDIDATE_COMMIT | `028fee9…` | `028fee9d633de81f7bf42f95c34ae2cd04a06a37` |
| CANDIDATE_PARENT | `426cc1e…` | `426cc1ec8ab442e126678c84bb4a3586244c6d7c` |
| ALIGNMENT_R1_COMMIT | `c335f7b…` | `c335f7bfdb1f9d5ab04c07e8718f299364a354ca` |
| ALIGNMENT_R1_IS_ANCESTOR | false | false (merge-base exit 1) |
| MD05_DECISION_FREEZE_R2_STATUS | R2_INTEGRATED_PENDING_INDEPENDENT_I2_POSTMERGE_REVIEW | same in decision file and Part E |
| PREMERGE_INDEPENDENT_REVIEW_RESULT | PASS_ACCEPT | PASS_ACCEPT |
| POSTMERGE_I2_REVIEW_RESULT | NOT_PERFORMED | NOT_PERFORMED |
| MODEL_D | 17/9/8/8/0 | 17/9/8/8/0 |
| NEWLY_RESOLVED_ITEM_COUNT | 0 | 0 |
| MD05_FORMALLY_RESOLVED | false | false |
| IMPLEMENTATION_AUTHORIZATION | false | false |
| PATH_EXPANSION_AUTHORIZATION / Scope expansion adopted | false | false |
| Changed path count | governance/evidence only | 9 paths; production 0 |
| PR #47 head | candidate | `028fee9…` OPEN draft |
| PR #46 | untouched | OPEN draft at `c335f7b…` |

```text
OBSERVATION_ONLY = true
PASS_ACCEPT_ISSUED = false
FAIL_REJECT_ISSUED = false
```
