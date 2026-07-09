# TD-084 Clean Rerun Results

**Run:** 2026-07-09T14:35:29  
**Command:** `npm run ops:learner-final-acceptance-1`  
**Evidence:** `docs/evidence/learner-final-acceptance/2026-07-09T14-35-29-learner-final-acceptance-1r/`

## Preflight (before run)

| Check | Result |
|-------|--------|
| API health (`/health`) | 200 |
| Frontend (`:3001`) | 200 |
| Keycloak (`:18080`) | 200 |
| Postgres container | `docker-postgres-1` |
| DB | `confora` |

## Environment

```
POSTGRES_DOCKER_CONTAINER=docker-postgres-1
POSTGRES_DB=confora
PLAYWRIGHT_PILOT_PASSWORD=PilotTest!2026
PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH=cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945
```

## Execution

- Isolated run (no parallel Playwright suites)
- `PLAYWRIGHT_NO_WEB_SERVER=1` (uses existing dev frontend)
- Playwright duration: ~90s (heartbeats at 45s, 90s)
- Exit code: **0**

## Result

| Field | Value |
|-------|-------|
| final_verdict | LEARNER_FINAL_ACCEPTANCE_1R_GO |
| screens_passed | 11 |
| screens_failed | 0 |
| education_screen_status | PASS |
| catalog_screen_status | PASS |
| rbac_negative_status | PASS |
| raw_enum_check_status | PASS |
| production_code_changed | false (no edits in TD-084) |

## Conclusion

Clean isolated rerun **passed without any code changes**. TD-083 learner NO-GO was a **transient local environment / parallel-run contention issue**, not a reproducible functional defect introduced by TD-083.
