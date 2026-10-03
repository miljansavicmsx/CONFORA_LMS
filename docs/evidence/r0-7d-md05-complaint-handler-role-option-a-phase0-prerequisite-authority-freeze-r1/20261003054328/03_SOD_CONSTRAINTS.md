# Segregation-of-duties constraints preserved

```text
RECORD_UTC = 2026-10-03T05:43:28Z
SOD_COMPLETE_CLAIMED = false
```

| Control | Frozen value |
| --- | --- |
| Administrator complaint mutation | false |
| Auditor complaint mutation | false |
| Original certification decision-maker may decide that appeal | false |
| One person may be intake, investigator, recommendation author, and final approver of the same appeal | false |
| Complaint intake and handler assignment auditable | required when later implemented |
| Appeal final decision requires `resolutionCommitteeId` | true |
| Role label may substitute for a server identifier | false |
| Empty authenticated case user id | false |
| Tenant enforced server-side | true |
| Client tenant or role values are authority | false |
| `COM_APP` remains appeals committee, not complaint handler | true |

`evaluateStaffAppealsComplaintsAccess` still allows roles beyond the frozen
matrix. This package does not patch that file.
