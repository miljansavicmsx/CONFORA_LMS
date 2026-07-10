# TD-085 Preflight

| Check | OK | Detail |
|-------|----|--------|
| api_health | yes | GET /health → 200 |
| frontend | yes | GET / → 200 |
| keycloak | yes | GET /realms/confora → 200 |
| postgres | yes | container docker-postgres-1 running; SELECT 1 ok |
| env_postgres_container | yes | POSTGRES_DOCKER_CONTAINER=docker-postgres-1 |
| env_postgres_db | yes | POSTGRES_DB=confora |
| env_pilot_password | yes | PLAYWRIGHT_PILOT_PASSWORD set (or defaulted) |
| verify_hash | yes | hash=cedf36de04cb… source=env |

**Overall:** PASS
