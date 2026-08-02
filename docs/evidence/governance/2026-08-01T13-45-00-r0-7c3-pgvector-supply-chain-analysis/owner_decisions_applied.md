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


## R0-7C3A owner decision update (applied in evidence)

| Decision | Applied |
|----------|---------|
| Retain index digest `sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` | Yes |
| Expected amd64 version `0.8.6` | Yes |
| Do not approve alternate `0.8.2` image | Yes |
| arm64 parity not claimed | Yes |
