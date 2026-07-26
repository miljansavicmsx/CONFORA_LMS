# Repository identity — R0-1A

## Synchronization

| Check | Expected | Observed | Result |
|-------|----------|----------|--------|
| `git fetch origin` | executed | executed | PASS |
| `origin/fix/ca-h01-frontend-f4-cutover` tip | `1f141fe18aafafd0405b1539788234d253f40f4b` | `1f141fe18aafafd0405b1539788234d253f40f4b` | **MATCH** |
| PR #1 state | MERGED | MERGED | PASS |
| PR #1 merge commit | `1f141fe1…` | `1f141fe18aafafd0405b1539788234d253f40f4b` | PASS |
| PR #1 mergedAt | populated | `2026-07-26T11:56:34Z` | PASS |
| Tracked working tree (`git status --porcelain -uno`) | clean | empty | PASS |

## Local workspace context

| Field | Value |
|-------|-------|
| Local branch at analysis | `governance/r0-3-deploy-containment` |
| Local HEAD | `91ca6fcece33f95240322d6ad3bb38cf3af6cef6` (ancestor of merge; PR head) |
| Checkout of integration tip | **Not performed** (no merge/rebase/reset without owner approval) |
| Unrelated untracked files | Left untouched |

## R0-3 status (preserved)

`MERGED — CONTAINMENT ACTIVE WITH CONDITIONS`

Deploy containment on the integration branch remains active. This inventory does not change workflows, environments, or allowlists.

## Authority-chain fact (C-01)

| Artefact | Git status |
|----------|------------|
| `AGENTS.md` | **Tracked** |
| `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md` | **Untracked** (exists; not gitignored) |
| `docs/governance/**` (12 files) | **Untracked** |
| `docs/architecture/**` (41 files) | **Untracked** |
| `.cursor/rules/**` | **Gitignored** (`.cursor/`) — OQ-2 / R0-2 |
| R0-3 evidence package | **Tracked** |
| Rebaseline + owner-decision evidence packages | **Untracked** |

## Stop condition

Remote tip matched expected R0-3 merge tip. Analysis proceeded.
