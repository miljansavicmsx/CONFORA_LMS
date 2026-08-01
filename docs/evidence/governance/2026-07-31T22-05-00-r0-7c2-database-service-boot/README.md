# R0-7C2 — PostgreSQL/pgvector CI Service Boot Recovery

**Task:** R0-7C2 (implementation + evidence closure)
**Branch:** `ci/r0-7c2-database-service-boot`
**Integration base:** `da5d8c197d1b2b20b526486cd06aef45b6e898a0`
**R0-7C1 planning commit:** `bd3f37e7ac732b1773de095fb27dfdef2d9e9ced`
**Combined R0-7C2 implementation/evidence commit:** `282aa2bd372dc1248e32c756c0a4a44e7c41a047`
**Draft PR:** `#6`
**Independent review:** `GO WITH CONDITIONS` (`INDEPENDENT_REVIEW.md`)

## What R0-7C2 proves

**Service boot only:** Docker create succeeds; postgres service reaches `healthy`;
exit `125` from unquoted `-U` is closed.

## Explicit non-claims

- Full database CI remains failing after service boot (missing `packages/database`).
- Prisma and package promotion remain deferred (OD-R07-2 / R0-7E).
- pgvector extension activation remains unverified (`NOT_VERIFIED`).
- Mutable image digest remains open for R0-7C3 (`DEFERRED_TO_R0_7C3`).
- **R0-7C3 must not start before PR #6 is merged.**

## Operational change (unchanged by evidence closure)

Quote-only repair in:

- `.github/workflows/ci.yml`
- `.github/workflows/accessibility.yml`

`--health-retries` remains **10**.
