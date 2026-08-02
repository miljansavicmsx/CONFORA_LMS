# R0-7C3 — pgvector Image Digest and Extension Verification Planning

**Task:** R0-7C3 (planning only — no workflow implementation)
**Branch:** `governance/r0-7c3-pgvector-supply-chain-analysis`
**Integration tip / R0-7C2 merge:** `fdd813c0a97d8dd334a2aaedb6ea3dddbdb1d04a`
**Evidence:** `docs/evidence/governance/2026-08-01T13-45-00-r0-7c3-pgvector-supply-chain-analysis/`

## Owner decision questions

1. Which **immutable** image reference should replace mutable `pgvector/pgvector:pg16`?
2. How should CI verify `vector` extension availability/activation **without** Prisma,
   application schema, or `packages/database`?

## Non-goals

- No workflow / Dockerfile / schema / Prisma / package promotion changes in R0-7C3
- No PR
- No production database or deployment

## Recommendation summary (not implemented)

- **Pinning:** Option A — multi-platform index digest (owner decision required)
- **Extension CI:** separate post-healthy `psql` step against ephemeral service DB
  (availability query + optional `CREATE EXTENSION vector`); deferred to R0-7C4


## R0-7C3A correction (owner decision update)

- Approved index digest **unchanged**: `sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b`
- Corrected approved-digest **linux/amd64** pgvector version: **`0.8.6`** (supersedes prior `0.8.2` observation)
- Discrepancy classification: `PREVIOUS_VERSION_OBSERVATION_NOT_REPRODUCIBLE`
- See `VERSION_RECONCILIATION.md`, `OWNER_DECISION_UPDATE.md`, `amd64_extension_version_verification.md`, `r0_7c4_revised_acceptance_criteria.md`
- R0-7C4 readiness: `READY_AFTER_EVIDENCE_CORRECTION`
