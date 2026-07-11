# TD-086 Fix Strategy — F4-9 SLA Checkpoint Invariant Stabilization

## Chosen strategy (ops-only, minimal)

Combined **options 1, 2, and 4** from the task brief — no production API or schema changes.

### 1. Run-scoped invariant measurement (primary)

When `runContactRequestIds` is provided to `evaluateF4SideEffectInvariants`:

- Measure `runScopedContactSlaCheckpointCount` (checkpoints for current-run contact IDs only)
- Allow delta = `contactCount × F4_9_MAX_SLA_CHECKPOINTS_PER_CONTACT` (6 per contact)
- Report `runScopedContactSlaCheckpointCount delta` instead of global `contactSlaCheckpointCount delta`

Global certification/governance counts remain strict zero-delta.

### 2. Pre-run synthetic checkpoint cleanup (secondary)

Before `beforeFingerprint`, delete SLA checkpoints only for contacts with `subject LIKE 'F4-9%'`:

```sql
DELETE FROM gov.contact_sla_checkpoints c
USING gov.contact_requests r
WHERE c.contact_request_id = r.id
  AND c.tenant_id = :tenant
  AND r.subject LIKE 'F4-9%';
```

Strict synthetic marker — does not touch non-synthetic contact data.

### 3. Narrow `sla/run` body (tertiary)

Scope bulk SLA run to synthetic smoke contacts:

```json
{
  "queueSlaNotifications": false,
  "assignedTo": "<director-id>",
  "status": "CLOSED"
}
```

Matches F4-9 workflow contacts (assigned director, closed status) instead of all tenant contacts.

### 4. Resilience (non-invariant)

- `fetchWithRetry` for auth/public HTTP (transient `ECONNRESET` under load)
- Legacy alias accepts HTTP 429 (rate limit) as pass

## Not done (explicitly forbidden)

- Global `allowContactSlaCheckpointDelta` relaxation
- Disabling `F49-DB-INVARIANTS`
- Deleting non-synthetic data
- Prisma schema / migration changes
- RBAC, privacy, audit, or governance boundary weakening

## Files changed

| File | Change |
|------|--------|
| `scripts/ops/lib/f4-9-smoke-helpers.mjs` | Marker, cleanup SQL, run-scoped count SQL, scoped invariant eval |
| `scripts/ops/run-f4-9-faza4-smoke.mjs` | Track run IDs, cleanup, scoped fingerprint, narrowed `sla/run` |
| `scripts/ops/test-f4-9-smoke-helpers.mjs` | Unit tests for scoped invariant + SQL helpers (12/12) |

## Governance impact

- **RBAC**: unchanged — smoke still uses director/staff tokens
- **Privacy**: unchanged — redaction checks preserved
- **Audit**: unchanged — contact/report audit actions still required
- **Tenant isolation**: unchanged — all SQL scoped by `tenant_id`
