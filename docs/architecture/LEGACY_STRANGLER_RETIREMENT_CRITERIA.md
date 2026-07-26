# CONFORA Legacy Strangler Retirement Criteria

| Field | Value |
|-------|-------|
| **Document ID** | CON-ARCH-STRANGLER-001 |
| **Status** | Normative architecture (R0-1B2.1) |
| **Date** | 2026-07-26 |
| **Source input** | Untracked docs/governance/LEGACY_STRANGLER_RETIREMENT_CRITERIA.md (left unchanged) |

## Explicit non-claims (mandatory)

1. These criteria do **not** prove current Nest (pps/api) readiness or clean-clone buildability.
2. These criteria do **not** approve tracking FastAPI (ackend/).
3. These criteria do **not** select an OQ-3 recovery option (A/B/C/D remain deferred).
4. Retirement of any legacy surface requires an **owner decision** and **independent verification**.

## Evidence-based gates

| Gate | Requirement | Evidence artifact |
|------|-------------|-------------------|
| Route parity | 100% mapped critical routes from legacy to canonical target | Route inventory signed |
| Data parity | No critical SoR data solely in legacy stores for the retired domain | Migration report |
| Authorization parity | RBAC/SoD equivalent or stricter on canonical path | Auth matrix + tests |
| Tenant isolation | Cross-tenant denial proven for migrated routes | Tenant test pack |
| Audit parity | Critical mutations emit append-only ledger events | Audit coverage report |
| Operational monitoring | Alerts/dashboards cover canonical path | Ops checklist |
| Rollback | Documented rollback to last known good within RTO | Rollback runbook |
| Pilot evidence | Pilot/RC flows pass on canonical path without legacy mutations | Evidence folder under docs/evidence/ |
| Migration freeze | Legacy writes frozen for the domain for agreed window | Freeze change record |
| Decommissioning | Code/config removal after gates + owner sign-off | PR + OD entry |

## Interim coexistence rules

| Allowed | Prohibited |
|---------|------------|
| Documented read-only bridges | New FastAPI core features |
| Nest-targeted new work for intended domains | Claiming FastAPI canonical |
| Pilot maintenance on rontend-app | Claiming Nest complete because criteria exist |

## Relationship to OQ-3 / OQ-4

- OQ-3 remains OPEN until a separate recovery OD.
- OQ-4 / frontend-app operational status is governed by Gap Note and future ADR-008; strangler criteria do not freeze or delete rontend-app early.
