# Independent Review — R0-7B2 Deterministic pnpm Installation

## Reviewer role

Independent package-management, supply-chain, GitHub Actions, monorepo
reproducibility and repository-governance reviewer.

The reviewer did **not** implement the R0-7B2 change.

## Review mode

Read-only. No repository modifications, lockfile regeneration, lifecycle
scripts (beyond the controlled ignore-scripts install experiment), commits,
pushes, pull requests, merges, rebases, amends, or settings changes were
performed as part of the review itself.

## Reviewed range

`adbbbb998c592f1f88dc062a3fdd9fb31ffebdb4..8120874aefbf0baa17525657e43e52e205a24284`

## Authoritative reviewed tip

`8120874aefbf0baa17525657e43e52e205a24284`

## Review date

2026-07-28

## Final verdict

`GO WITH CONDITIONS`

## Outcomes

| Item | Result |
|------|--------|
| Deterministic install | `FROZEN_INSTALL_IGNORE_SCRIPTS_VERIFIED` |
| pnpm version | `9.14.2` |
| pnpm provenance | `ACCEPTABLE_WITH_PROVENANCE_LIMITATION` |
| Importer count | `17 → 12` |
| Unexpected importers | `0` |
| Unresolved workspace references | `0` |
| `frontend-app` | `TRACKED_STANDALONE_OUTSIDE_ROOT_WORKSPACE` |
| `packages/database` | `EXCLUDED_NOT_PROMOTED` |
| `jsqr` | `ABSENT` |
| `pngjs` | Direct removed; transitive via `qrcode@1.5.4` |
| Lockfile byte stability | `PASS` |
| Lifecycle-enabled install | `NOT_RUN` |
| CRITICAL / HIGH findings | None |
| Draft PR recommendation | Proceed under conditions |

## Remaining LOW findings

1. `confora-qa.yml` still references untracked `@confora/database` and
   `@confora/worker` — assigned to R0-7E.
2. Reproduction used `npx --yes pnpm@9.14.2`; future CI guidance should prefer
   Corepack and the root `packageManager` declaration.

## Explicit non-claims

This review does **not** establish that QA, accessibility, database or
compliance CI is fully repaired, nor that lifecycle-complete installation was
validated.
