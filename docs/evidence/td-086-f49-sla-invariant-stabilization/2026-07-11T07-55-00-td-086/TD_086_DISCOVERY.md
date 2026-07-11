# TD-086 Discovery — F4-9 Contact SLA Checkpoint DB Invariant Drift

| Field | Value |
|-------|-------|
| **Task** | TD-086 |
| **Prior verdict** | TD-085 `TD_085_GO_WITH_TRANSIENT_INFRA_NOTE` |
| **Failure** | `F49-DB-INVARIANTS: contactSlaCheckpointCount delta 9 outside allow 5` (63/64) |

## Components inspected

| Component | Path |
|-----------|------|
| F4-9 smoke runner | `scripts/ops/run-f4-9-faza4-smoke.mjs` |
| F49 invariant helper | `scripts/ops/lib/f4-9-smoke-helpers.mjs` → `evaluateF4SideEffectInvariants` |
| Contact smoke flow | Public submit → staff workflow → `POST /v1/staff/contact-requests/sla/run` |
| SLA checkpoint model | `gov.contact_sla_checkpoints` (joined to `gov.contact_requests`) |

## Root cause (precise)

**Invariant query counted global tenant SLA checkpoints while `sla/run` processed a broad contact set, and repeated smoke runs accumulated checkpoints from prior F4-9 synthetic contacts.**

1. **Non-idempotent measurement scope** — `F49-DB-INVARIANTS` compared global `contactSlaCheckpointCount` before/after the run. The allowed delta was fixed at `5`, but each repeat could add checkpoints for multiple contacts.

2. **Broad `sla/run` filter** — `POST /v1/staff/contact-requests/sla/run` with only `{ queueSlaNotifications: false }` loaded up to 500 tenant contact requests via `loadFilteredContactRequests`, not just contacts created in the current smoke run.

3. **Shared local DB state** — F4-9 synthetic contacts use subject prefix `F4-9` but prior runs left SLA checkpoint rows attached to those contacts. Global count drifted across sequential regression cycles (TD-085 evidence: delta 9 > allow 5).

4. **No run-scoped correlation** — Checkpoints are keyed by `contact_request_id` with timestamps; the old invariant had no run ID filter, so unrelated prior synthetic smoke data inflated the delta.

## What this is NOT

- Not RBAC, privacy, tenant isolation, or Playwright regression
- Not certification workflow logic defect
- Not Prisma schema or migration gap
- Not a reason to globally relax the invariant threshold

## Synthetic markers observed

- Contact subjects: `F4-9` prefix (existing smoke convention)
- Run tracking: contact request UUIDs collected during smoke (`runContactRequestIds`)
- Checkpoints: `gov.contact_sla_checkpoints` rows per `contact_request_id`

## TD-085 evidence reference

`docs/evidence/td-085-sequential-regression/2026-07-10T23-20-30-td-085/` — F4-9 63/64, invariant failure only.
