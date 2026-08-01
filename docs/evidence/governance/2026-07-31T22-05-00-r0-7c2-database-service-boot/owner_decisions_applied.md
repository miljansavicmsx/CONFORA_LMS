# Owner decisions applied

| Decision | Applied |
|----------|---------|
| Retain `pgvector/pgvector:pg16` | Yes — image tag unchanged |
| Do not pin local digest `sha256:00ba258a…` | Yes — digest pin deferred to R0-7C3 |
| Quote `--health-cmd "pg_isready -U confora -d confora"` | Yes |
| Preserve user/db/port/interval/timeout/retries | Yes — retries remain 10 |
| No `CREATE EXTENSION vector` | Yes |
| `packages/database` remains UNTRACKED_EXCLUDED (OD-R07-2) | Yes |
| No Prisma commands added or run | Yes |
