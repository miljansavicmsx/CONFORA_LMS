# Legacy deprecation and strangler analysis

## Candidates

| Document | Tracked | Classification |
|----------|---------|----------------|
| docs/architecture/LEGACY_DEPRECATION_MATRIX.md | No | PROMOTE_WITH_REBASELINE |
| docs/governance/LEGACY_STRANGLER_RETIREMENT_CRITERIA.md | No | PROMOTE_WITH_REBASELINE (move under architecture/) |

## Verification notes

| Legacy component | Exists locally | Tracked | Allowed change category | Migration dependency | Decommission condition | Evidence before retirement |
|------------------|----------------|---------|-------------------------|----------------------|------------------------|----------------------------|
| ackend/ FastAPI | Yes | No | Frozen (no new core features) — **not** authorized to track in R0-1B2 | Nest parity / OQ-3 recovery | Strangler Phase gates + owner sign-off | Route inventory, Nest-only smoke, ADR deprecation |
| Cognito / DynamoDB | Partial local/infra docs | Mostly untracked | Freeze | Keycloak + Postgres | Cutover evidence | Infra + auth evidence packs |
| rontend-app | Yes | Yes | Pilot maintenance only (OQ-4) | Next parity | Gap Note exit criteria | Parity matrix + E2E |
| Root docker-compose.yml | Likely | varies | Legacy banner | infra/docker | After Nest path exclusive | Ops runbook |
| Kafka-as-MVP docs | Doc-only | ADR-002 untracked | Doc amendment | RabbitMQ MVP ADR | ADR-002 rebaseline | Owner OD-R01B2-5 |

## Rules for R0-1B2

- Do **not** authorize legacy extension.
- Do **not** treat deprecation matrix Phase labels as completed work.
- Do **not** track FastAPI via this promotion wave.
