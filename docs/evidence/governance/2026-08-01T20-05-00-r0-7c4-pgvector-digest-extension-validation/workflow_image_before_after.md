# Workflow image before / after

## Before

```yaml
image: pgvector/pgvector:pg16
```

## After (both workflows)

```yaml
image: pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b
```

Health settings unchanged: interval `10s`, timeout `5s`, retries `10`,
`--health-cmd "pg_isready -U confora -d confora"`.
