# Binding boundaries applied

| Constraint | Status |
|------------|--------|
| Image remains `pgvector/pgvector:pg16` in workflows | Unchanged (planning only) |
| Tag mutable | Confirmed |
| No digest approved for workflow use yet | Confirmed — owner decision required |
| `CREATE EXTENSION vector` not run by repository CI | Confirmed |
| Extension activation `NOT_VERIFIED` in CI | Confirmed (local ephemeral analysis only) |
| `packages/database` `UNTRACKED_EXCLUDED` | Confirmed |
| OD-R07-2 deferred | Confirmed |
| Prisma/schema/migrations/seeds out of scope | Confirmed |
| Production DB/deploy unauthorized | Confirmed |
