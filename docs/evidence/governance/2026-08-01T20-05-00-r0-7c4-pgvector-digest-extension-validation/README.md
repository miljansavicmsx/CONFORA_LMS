# R0-7C4 — Pin pgvector Image and Verify Extension 0.8.6

**Branch:** `ci/r0-7c4-pgvector-digest-extension-validation`
**Integration tip:** `fdd813c0a97d8dd334a2aaedb6ea3dddbdb1d04a`
**Planning tip (R0-7C3A):** `ec5a77809f21d09cf60247f0c71c424cb0ddeae5`
**Implementation commit:** `aeb7578ca33597e8fb506b82f0f3639f1ffe09f1`

## Operational change

1. Pin image to `pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` in `ci.yml` and `accessibility.yml`
2. Add `Verify pgvector extension` to `ci.yml` `database` job only (expect **0.8.6**)

## Non-claims

Does **not** claim Prisma, schema, migration, seed, or full database CI readiness.
`packages/database` remains `UNTRACKED_EXCLUDED`.
