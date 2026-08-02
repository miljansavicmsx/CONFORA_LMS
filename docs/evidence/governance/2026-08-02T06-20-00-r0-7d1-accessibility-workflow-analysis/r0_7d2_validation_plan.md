# R0-7D2 validation plan

## GO criteria

1. Deterministic install succeeds
2. Only tracked files used
3. No untracked script required
4. Workflow YAML validates
5. No repository mutation
6. Write permissions minimized
7. No credential exposed
8. Fork PR behavior safe
9. Application startup deterministic if required
10. Browser readiness confirmed if required
11. Accessibility tool executes
12. Report artifact produced
13. Failure fail-closed
14. Full WCAG conformity not claimed
15. No deployment workflow runs

## Stop conditions

Unverifiable untracked promotion; external demo env; production URL; secret exposure;
`pull_request_target`; repository mutation; missing lockfile; non-deterministic install;
backend/FastAPI dependency for frontend-app claim; scope over owner limits.
