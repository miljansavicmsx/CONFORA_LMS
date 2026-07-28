# R0-7B1 — Tracked Manifest Baseline and Lockfile Reconstruction Plan

## Status

Read-only planning and reproducibility analysis. **No lockfile, manifest, or
workflow was modified.**

## Identity

| Item | Value |
|------|--------|
| Branch | `governance/r0-7b1-tracked-manifest-baseline` |
| Integration tip | `adbbbb998c592f1f88dc062a3fdd9fb31ffebdb4` |
| R0-7S1 | MERGED — ACCESSIBILITY CI MUTATION CONTAINED (PR #4) |
| Evidence folder | `docs/evidence/governance/2026-07-28T10-20-00-r0-7b1-tracked-manifest-baseline/` |

## Objective

Produce the authoritative input set for **R0-7B2** deterministic pnpm install
recovery from **tracked manifests only**.

## Headline findings

| Metric | Value |
|--------|-------|
| Tracked `package.json` count | **13** |
| Untracked local `package.json` count | **7** |
| Workspace globs | `apps/*`, `packages/*` |
| Lockfile importers | **17** |
| Importers without tracked manifest | **5** |
| Tracked without lockfile importer | **1** (`frontend-app`) |
| Root lock-only drift | `jsqr`, `pngjs` |
| Clean-worktree frozen install | **FAIL** `ERR_PNPM_OUTDATED_LOCKFILE` (expected) |

## Binding owner decisions applied

OD-R07-1, OD-R07-2, OD-R07-3, OD-R07-4, OD-R07-8 — see `owner_decisions_applied.md`.

## Next phase

R0-7B2 must regenerate `pnpm-lock.yaml` only from a clean worktree using
pnpm `9.14.2`, excluding all untracked manifests. Do not start R0-7B2 from
this evidence commit alone without owner implementation approval.
