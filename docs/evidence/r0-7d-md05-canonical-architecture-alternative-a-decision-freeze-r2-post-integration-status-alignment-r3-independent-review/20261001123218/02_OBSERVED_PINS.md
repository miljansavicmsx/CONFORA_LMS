# Observed intake pins (no technical verdict)

```text
REVIEW_UTC = 2026-10-01T12:32:18Z
TECHNICAL_CONTENT_VERDICT_ISSUED = false
```

Intake observations only. Independence failed before a technical
PASS_ACCEPT or FAIL_REJECT verdict could be issued.

| Pin | Expected | Observed |
| --- | --- | --- |
| REVIEWER_BCID | ≠ `bc-10bbd613…` | `bc-10bbd613…` (blocked) |
| REMOTE_INTEGRATION_HEAD | `3805dba…` | `3805dba2ceb70d64b7ba967de6beb78beab67e9e` |
| CANDIDATE_COMMIT | `ad505f5…` | `ad505f5188b923f83b2b6adbda2ceb894efeb90e` |
| CANDIDATE_PARENT | `3805dba…` | `3805dba2ceb70d64b7ba967de6beb78beab67e9e` |
| CHANGED_PATH_COUNT | 9 | 9 |
| AUTHORITATIVE_I2_COMMIT | `8b97f8a…` | present; evidence path readable |
| MD05_DECISION_FREEZE_R2_STATUS | R2_INTEGRATED_I2_CLOSED_ACCEPTED | present on candidate (observation only) |
| POSTMERGE_I2_REVIEW_RESULT | PASS_ACCEPT | present on candidate (observation only) |
| POSTMERGE_I2_VALIDATION | 31_PASS_0_FAIL_1_NOT_VERIFIED | present on candidate (observation only) |
| POSTMERGE_I2_QUESTIONS | 21_PASS_0_FAIL_1_NOT_VERIFIED | present on candidate (observation only) |
| MD05_ARCHITECTURE_DECISION | ALTERNATIVE_A_CLOSED_ACCEPTED | present on candidate (observation only) |
| MODEL_D | 17/9/8/8/0 | present on candidate (observation only) |
| MD05_FORMALLY_RESOLVED | false | present on candidate (observation only) |

```text
OBSERVATION_ONLY = true
PASS_ACCEPT_ISSUED = false
FAIL_REJECT_ISSUED = false
NOT_VERIFIED_CONVERTED_TO_PASS = false
```
