# Contradictions register (architecture)

Do not silently resolve. Status values: OPEN | PRESERVED | PARTIALLY DOCUMENTED.

## C-02 / OQ-3 — Intended NestJS vs incomplete tracked backend

| Field | Value |
|-------|-------|
| Status | OPEN (preserved) |
| Intended | NestJS pps/api canonical direction |
| Reality | Tracked pps/api incomplete; not confirmed buildable; FastAPI local untracked |
| Docs that mis-state | Registry/STRUCTURE/strangler "Nest pilot authority" over-claims for clean clone |
| R0-1B2 action | Document in ADR-002 rebaseline + ARCHITECTURE.md; **do not close OQ-3** |

## C-03 — RabbitMQ vs Kafka messaging

| Field | Value |
|-------|-------|
| Status | OPEN |
| Baseline §4.7 | RabbitMQ MVP |
| ADR-002 / STRUCTURE / ADR-007 | Kafka as queue/fan-out |
| ADR_ALIGNMENT_NOTE | RabbitMQ operational; Kafka forward-looking (untracked note) |
| R0-1B2 action | Amend ADR-002 (+ ADR-007 messaging sentence); OD-R01B2-5 |

## C-04 / OQ-5 — Identity / RBAC / SoD transitional parity

| Field | Value |
|-------|-------|
| Status | DIRECTIONAL (OQ-5) — contradiction preserved |
| Intended | Keycloak + RBAC + SoD in canonical stack |
| Reality | packages/auth untracked; complete SoD not evidenced on clean clone |
| R0-1B2 action | ADR-005 rebaseline; no completion claim |

## C-05 / OQ-4 — ADR-001 vs operational frontend-app

| Field | Value |
|-------|-------|
| Status | OPEN (preserved in Gap Note) |
| ADR-001 | Next.js apps/web; frontend-app frozen |
| Reality | frontend-app operational canonical; apps/web|admin untracked |
| R0-1B2 action | Prepare supersession (OD-R01B2-2); do not execute in R0-1B2A |

## C-06 / OQ-7 — Tenant/audit requirements vs verified implementation

| Field | Value |
|-------|-------|
| Status | OPEN |
| Requirements | MULTI_TENANCY_STANDARD, ADR-007, Baseline |
| Verified | Partial fragments only; packages/database & packages/audit untracked |
| R0-1B2 action | Promote standards with requirement/implementation/verification split |

## C-07 / OQ-6 — Deployment target vs containment-only

| Field | Value |
|-------|-------|
| Status | MERGED_WITH_CONDITIONS (containment active) |
| Reality | deploy-backend workflow_dispatch + production environment; production unauthorized |
| R0-1B2 action | Architecture docs must not imply authorized production deploy |

## C-08 (new) — Registry Canonical labels vs tracked reality

| Field | Value |
|-------|-------|
| Status | OPEN |
| Issue | Untracked registry marks incomplete/untracked apps as Canonical |
| R0-1B2 action | Rebaseline legend (see canonical_component_analysis.md) |

## C-09 (new) — Shared-kernel "placeholder" claim vs tracked implementation

| Field | Value |
|-------|-------|
| Status | OPEN (doc drift) |
| Issue | SHARED_KERNEL_STANDARD says shared-kernel is placeholder; tracked src exists |
| R0-1B2 action | Refresh status table on promotion |

## C-10 (new) — Self-declared CANONICAL untracked governance notes

| Field | Value |
|-------|-------|
| Status | OPEN |
| Issue | ADR_ALIGNMENT_NOTE and strangler criteria claim CANONICAL while untracked |
| R0-1B2 action | Promote/merge under architecture with correct status; do not treat as Level-1 until tracked via owner-approved promotion |
