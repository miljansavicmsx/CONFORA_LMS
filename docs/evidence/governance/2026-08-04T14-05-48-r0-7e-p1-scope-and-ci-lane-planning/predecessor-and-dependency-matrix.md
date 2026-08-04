# Predecessor and Dependency Matrix

| Dependency | Verified integration status | Limitations | R0-7E effect |
|---|---|---|---|
| R0-7S1 | Closed with recorded limitations | Mutation contained; accessibility not repaired | Available security baseline |
| R0-7B | Closed with recorded limitations | Root install evidence; frontend standalone; unavailable QA filters | Available with Q2 cleanup |
| R0-7C | Closed with recorded limitations | Service/digest integrated; database package and Prisma lane absent | Partial; database decision required |
| R0-7D | Open; D branch tips are outside integration history | Rejected experiments; no approved clean-clone closure | Blocks implementation |
| 028D-2a / PR #8 | Merged at f5e48ddb774f3e505fd3c5a6fc4c13492ed4b8cd | Frontend authority gap and backend contract-only limitation | Closed predecessor; runtime out of scope |
| Database authority | Absent | packages/database/** has zero tracked files | Blocked implementation lane |
| F4 validator | Absent | Referenced entrypoint is not tracked | Separate prerequisite |
| Technical-debt register | Absent | Baseline canonical path is not tracked | Separate governance restoration |
| R0-7F | Deferred | Enforcement cannot use broken checks | Successor after green lanes |

Critical path: adopt lane decisions, close R0-7D forward, decide database
disposition, execute Q1/Q2/C1 separately, produce evidence, review, merge, then
consider R0-7F.
