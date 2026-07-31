# Service definition before / after

## Shared broken form (both workflows)

```yaml
options: >-
  --health-cmd pg_isready -U confora -d confora
  --health-interval 10s
  --health-timeout 5s
  --health-retries 10
```

## Corrected form (both workflows)

```yaml
options: >-
  --health-cmd "pg_isready -U confora -d confora"
  --health-interval 10s
  --health-timeout 5s
  --health-retries 10
```

## Unchanged

- image: `pgvector/pgvector:pg16`
- POSTGRES_USER / PASSWORD / DB
- ports `5432:5432`
- interval / timeout / retries
