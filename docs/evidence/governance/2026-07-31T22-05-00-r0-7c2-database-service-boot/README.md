# R0-7C2 — PostgreSQL/pgvector CI Service Boot Recovery

**Task:** R0-7C2 (implementation)
**Branch:** `ci/r0-7c2-database-service-boot`
**Base (R0-7C1 evidence tip):** `bd3f37e7ac732b1773de095fb27dfdef2d9e9ced`
**Integration tip:** `da5d8c197d1b2b20b526486cd06aef45b6e898a0`
**Evidence folder:** `docs/evidence/governance/2026-07-31T22-05-00-r0-7c2-database-service-boot/`

## Objective

Correct Docker health-command argument parsing so PostgreSQL/pgvector
GitHub Actions service containers can be created, started, and marked healthy.

## Non-goals (explicit)

- Image replacement or digest pin (deferred R0-7C3)
- `CREATE EXTENSION vector` (deferred R0-7C3)
- Prisma generate/migrate/seed/tests
- Promoting `packages/database` (OD-R07-2)
- Claiming database job end-to-end green
- Production deployment

## Operational change

Quote-only repair in two workflow service definitions:

- `.github/workflows/ci.yml` (`database` / `postgres`)
- `.github/workflows/accessibility.yml` (`compliance-iso` / `postgres`)

`--health-retries` remains **10** (unchanged). A truncated task example showing `5`
was not applied per binding decision: do not change retry/timeout/interval.
