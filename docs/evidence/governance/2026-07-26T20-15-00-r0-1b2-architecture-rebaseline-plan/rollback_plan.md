# Rollback plan

## This planning task (R0-1B2A)

- Single evidence commit on branch governance/r0-1b2-architecture-rebaseline-plan.
- Rollback: delete remote branch or revert evidence commit; integration tip b90ddd9 unchanged.

## Future R0-1B2 promotion (not executed now)

1. Prefer revert of merge commit on integration branch.
2. If ADR directory moved, restore decisions/ and fix links in same revert.
3. Do not partially revert ADR-001 supersession without restoring Gap Note consistency.
4. Record rollback in CHANGE_CONTROL and owner register if decisions were logged.
