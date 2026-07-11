# TD-086 Report — Stabilize F4-9 Contact SLA Checkpoint DB Invariant Drift

| Field | Value |
|-------|-------|
| **Task** | TD-086 |
| **Evidence** | `docs/evidence/td-086-f49-sla-invariant-stabilization/2026-07-11T07-55-00-td-086/` |
| **Final verdict** | **TD_086_GO_F49_REPEATABLE** |
| **Date** | 2026-07-11 |

## Summary

F4-9 smoke failed TD-085 sequential regression on `F49-DB-INVARIANTS` because the global `contactSlaCheckpointCount` delta included SLA checkpoints from prior synthetic F4-9 runs and from a broad `sla/run` sweep. TD-086 stabilizes measurement with run-scoped checkpoint counting, pre-run synthetic cleanup (`F4-9%` subject marker), and a narrowed `sla/run` filter — **ops scripts only**, no production or schema changes.

## Root cause

Global invariant counted accumulated tenant SLA checkpoints while `sla/run` processed many contacts; repeated local smoke runs drifted delta past allow `5`.

## Fix (minimal)

1. `runScopedContactSlaCheckpointCount` for current-run contact IDs
2. `cleanupSyntheticF4SlaCheckpoints()` before fingerprint (F4-9 subjects only)
3. `sla/run` body scoped with `assignedTo` + `status: CLOSED`
4. Unit tests for invariant helpers (12/12)

## F4-9 repeatability

| Run | Result | F49 invariant | Run-scoped SLA delta |
|-----|--------|---------------|----------------------|
| 1 | PASS 64/64 | PASS | 0 |
| 2 (immediate) | PASS 64/64 | PASS | 0 |

## Regression

| Suite | Status |
|-------|--------|
| Sequential local pilot (6 steps) | **PASS** — includes F4-9 64/64 |
| F4 audit | PASS |
| F5-3 | PASS |
| S17 | PASS (after frontend start) |
| Learner | PASS 11/11 |
| Admin-gov standalone | FAIL 14/15 (pre-existing raw enum — not TD-086) |

## Files changed

- `scripts/ops/lib/f4-9-smoke-helpers.mjs`
- `scripts/ops/run-f4-9-faza4-smoke.mjs`
- `scripts/ops/test-f4-9-smoke-helpers.mjs`

## Compliance attestation

- No certification workflow logic changes
- No Prisma schema or migration changes
- No RBAC, tenant isolation, privacy, or governance weakening
- No auth bypass
- No non-synthetic data deletion
- No staging/production/external pilot/DPO claims

## Artifacts

- `TD_086_DISCOVERY.md`
- `TD_086_FIX_STRATEGY.md`
- `TD_086_F49_REPEATABILITY_RESULTS.md`
- `TD_086_DB_INVARIANT_RESULTS.md`
- `TD_086_REGRESSION_RESULTS.md`
- `summary.json`
