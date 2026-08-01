# Proposed R0-7C4 scope (implementation later — owner-gated)

## Maximum operational files

Prefer **≤ 2** workflow files:

1. `.github/workflows/ci.yml`
2. `.github/workflows/accessibility.yml`

## Candidate changes (only after owner decisions)

1. Replace image with approved pin, recommended:

   `pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b`

2. Add a **post-healthy** validation step (not health-cmd):
   - availability query
   - optional `CREATE EXTENSION vector` if owner approves activation in CI

## Explicit exclusions

- No `packages/database` promotion
- No Prisma generate/migrate/seed
- No schema/SQL seed files in repo required
- No digest from local image ID `sha256:00ba258a66dac104fd5171074a0084462a64a1369d8513f3d0a634e2f24d15bc`
- No production endpoints

## Stop conditions for R0-7C4

- Index digest no longer resolves / pull failure
- Owner rejects activation step but requires enablement claim
- Need for signed attestation enforcement before pin
- Any requirement to promote untracked database source
