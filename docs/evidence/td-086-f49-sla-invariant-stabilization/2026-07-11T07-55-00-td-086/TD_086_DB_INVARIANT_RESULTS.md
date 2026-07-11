# TD-086 DB Invariant Results (F49)

## F49-DB-INVARIANTS check behavior (post-fix)

| Invariant field | Scope | Allow rule |
|-----------------|-------|------------|
| `certificateCount`, lifecycle, decisions, recert, appeals, complaints, legacy, public verify | Global tenant | **Zero delta** (strict) |
| `contactRequestCount` | Global tenant | Expected smoke contacts (+ small buffer) |
| `runScopedContactSlaCheckpointCount` | Current-run contact IDs | `≤ contactCount × 6` |
| `contactNotificationLogCount` | Global tenant | ≤ 3 delta |

When `runContactRequestIds` is non-empty, SLA measurement uses **run-scoped** count only. Global `contactSlaCheckpointCount` is still recorded in fingerprint for observability but not used for pass/fail.

## Run 1 fingerprint (`2026-07-11T05-19-55`)

```json
{
  "sideEffectEval": {
    "pass": true,
    "contactDelta": 4,
    "slaDelta": 0,
    "notifyDelta": 1
  },
  "beforeFingerprint": {
    "contactSlaCheckpointCount": 11,
    "runScopedContactSlaCheckpointCount": 0
  },
  "afterFingerprint": {
    "contactSlaCheckpointCount": 11,
    "runScopedContactSlaCheckpointCount": 0
  }
}
```

## Run 2 fingerprint (`2026-07-11T05-20-55`)

```json
{
  "sideEffectEval": {
    "pass": true,
    "contactDelta": 4,
    "slaDelta": 0,
    "notifyDelta": 1
  },
  "beforeFingerprint": {
    "contactSlaCheckpointCount": 11,
    "runScopedContactSlaCheckpointCount": 0
  },
  "afterFingerprint": {
    "contactSlaCheckpointCount": 11,
    "runScopedContactSlaCheckpointCount": 0
  }
}
```

## Sequential regression F4-9 (`2026-07-11T07-44-01-td-085`)

F4-9 included as step 6 of `ops:local-pilot-sequential-regression` — **PASS** 64/64, `f4_9_status: PASS`.

## Unit tests

`node --test scripts/ops/test-f4-9-smoke-helpers.mjs` — **12/12 PASS**

Covers:

- Run-scoped SLA delta within allow
- Run-scoped SLA delta over allow (fail case)
- Global fallback when no run IDs
- Cleanup SQL marker (`F4-9%`)
- Run-scoped count SQL

## DB invariant verdict

**PASS** — meaningful invariant preserved; measurement isolated from accumulated local synthetic state.
