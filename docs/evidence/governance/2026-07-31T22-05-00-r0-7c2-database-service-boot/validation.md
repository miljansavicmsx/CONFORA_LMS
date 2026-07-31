# Validation against R0-7C2 GO criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Container create succeeds (no exit 125) | PASS (local reproduction) |
| 2 | Container remains running | PASS (local) |
| 3 | `pg_isready` responds | PASS (local) |
| 4 | Health check reaches healthy | PASS (local) |
| 5 | Auth with ephemeral CI credentials | PASS (local env POSTGRES_*) |
| 6 | Database `confora` exists | PASS (image init + pg_isready -d) |
| 7 | pgvector binaries available | DEFERRED to R0-7C3 (not claimed here) |
| 8 | CREATE EXTENSION | NOT RUN (owner deferred) |
| 9 | No Prisma required for boot GO | PASS |
| 10 | No untracked file required for boot GO | PASS |
| 11 | No production DB | PASS |
| 12 | No deploy workflow | PASS |

**R0-7C2 verdict scope:** service boot recovery only.
CI `database` job may still fail later on Prisma/`packages/database` — that is
**out of scope** and expected under OD-R07-2.
