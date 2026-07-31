# Residual risks and deferred work

## Expected residual after R0-7C2 merge

- `ci.yml` `database` job steps still reference `packages/database` (untracked) → later step failures remain R0-7E / OD-R07-2 territory.
- `accessibility.yml` `compliance-iso` may still fail on missing a11y tooling (R0-7D) after service boot succeeds.
- Mutable tag `pgvector/pgvector:pg16` remains unpinned → R0-7C3 digest verification.
- Extension binary / activation verification → R0-7C3.

## Not a R0-7C2 failure

Database job remaining red after health start, due solely to Prisma/untracked package, does not invalidate boot recovery GO.
