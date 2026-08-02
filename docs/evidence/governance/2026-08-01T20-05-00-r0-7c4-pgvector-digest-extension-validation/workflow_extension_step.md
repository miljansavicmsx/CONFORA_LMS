# Workflow extension step

Present **only** in `.github/workflows/ci.yml` `database` job as:

`Verify pgvector extension`

Placed after Install, before Prisma generate.

Expects available and installed versions **exactly `0.8.6`**, plus vector cast.
Uses `docker exec` into the digest-pinned service container (no runner psql install).
