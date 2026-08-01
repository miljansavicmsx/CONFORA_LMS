# R0-7C4 revised acceptance criteria

## Extension version gates (linux/amd64 / GHA)

| Check | Criterion |
|-------|-----------|
| Available version (`pg_available_extensions.default_version`) | exactly `0.8.6` |
| Installed version (`pg_extension.extversion`) after `CREATE EXTENSION vector` | exactly `0.8.6` |
| Vector cast sanity | `PASS` (`[1,2,3]`) |
| Any other version | **blocking failure** |
| Missing `vector` / activation failure | **blocking failure** |

## Unchanged R0-7C4 boundaries

- Image pin: `pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b`
- Digest pin in both `ci.yml` and `accessibility.yml`
- Extension activation step only in `ci.yml` `database` job
- No activation in `accessibility.yml` (R0-7C4)
- No Prisma / migrations / seed / `packages/database` promotion
- Signed-image enforcement deferred
- Do not claim schema, index, embedding, Prisma, or production readiness
