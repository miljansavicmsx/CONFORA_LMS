# TD-086 F4-9 Repeatability Results

## Acceptance criterion

Repeated `ops:f4-9-smoke` on the same local DB must pass without `contactSlaCheckpointCount` / run-scoped drift failure.

## Run 1 (first after fix)

| Field | Value |
|-------|-------|
| **Command** | `npm run ops:f4-9-smoke` |
| **Timestamp** | 2026-07-11T05:19:55 UTC |
| **Evidence** | `docs/evidence/f4-9-faza4-smoke/2026-07-11T05-19-55/` |
| **Result** | **PASS** 64/64 |
| **F49-DB-INVARIANTS** | PASS — B10–B15 invariants preserved |
| **Run contact IDs** | 3 (`34f348e7…`, `efc00a60…`, `e186955f…`) |
| **Run-scoped SLA delta** | 0 (allow ≤ 18 for 3 contacts) |
| **Global SLA count** | 11 → 11 (unchanged) |

## Run 2 (immediate repeat)

| Field | Value |
|-------|-------|
| **Command** | `npm run ops:f4-9-smoke` (back-to-back) |
| **Timestamp** | 2026-07-11T05:20:55 UTC |
| **Evidence** | `docs/evidence/f4-9-faza4-smoke/2026-07-11T05-20-55/` |
| **Result** | **PASS** 64/64 |
| **F49-DB-INVARIANTS** | PASS — B10–B15 invariants preserved |
| **Run contact IDs** | 3 (`a03d09ad…`, `99c51dea…`, `9a90efd0…`) |
| **Run-scoped SLA delta** | 0 (allow ≤ 18 for 3 contacts) |
| **Global SLA count** | 11 → 11 (unchanged) |

## Comparison to TD-085 failure

| Metric | TD-085 (pre-fix) | TD-086 run 1 | TD-086 run 2 |
|--------|------------------|--------------|--------------|
| Checks | 63/64 | 64/64 | 64/64 |
| Invariant | `contactSlaCheckpointCount delta 9 outside allow 5` | PASS (run-scoped) | PASS (run-scoped) |
| Verdict | transient infra note | GO | GO |

## Verdict

**F4-9 repeatability: CONFIRMED** — two consecutive passes on the same local DB without checkpoint drift failure.
