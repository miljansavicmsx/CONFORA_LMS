# Health-check analysis

## Minimum readiness check

`pg_isready -U confora -d confora`

Optional hardening (still boot-only):

`pg_isready -h localhost -p 5432 -U confora -d confora`

| Requirement | Guidance |
|-------------|----------|
| Quoting | **Mandatory** when passed via `docker create --health-cmd` |
| Interval / timeout / retries | Current 10s / 5s / 10 acceptable for CI |
| Must not | migrate, seed, Prisma, untracked scripts, expose secrets in command |

## False positives

`pg_isready` proves accept connections for user/db; it does **not** prove pgvector
extension is enabled.
