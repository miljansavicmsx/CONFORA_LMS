# Service definition analysis

## Shared defective pattern

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    env:
      POSTGRES_USER: confora
      POSTGRES_PASSWORD: <ephemeral>
      POSTGRES_DB: confora
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready -U confora -d confora
      --health-interval 10s
      --health-timeout 5s
      --health-retries 10
```

| Aspect | Finding |
|--------|---------|
| Volumes | None |
| Init scripts | None |
| Custom command | None (image default entrypoint) |
| Failure timing | **Before** container start (create fails) |

## Separation of concerns

| Stage | Status today |
|-------|--------------|
| 1 Container create | **FAIL** (exit 125) |
| 2 PostgreSQL boot | Not reached |
| 3 Health-check execution | Not reached |
| 4 DB readiness | Not reached |
| 5 Extension availability | Not reached in CI; proven locally after quote fix |
| 6–8 Prisma/schema/app | Deferred |
