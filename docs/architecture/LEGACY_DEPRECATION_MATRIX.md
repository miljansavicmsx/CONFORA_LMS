# CONFORA Legacy Deprecation Matrix

| Field | Value |
|-------|-------|
| **Document ID** | CON-ARCH-DEPRECATION-001 |
| **Status** | Normative architecture (R0-1B2.1) |
| **Date** | 2026-07-26 |
| **Companion** | [CANONICAL_COMPONENT_REGISTRY.md](./CANONICAL_COMPONENT_REGISTRY.md), [LEGACY_STRANGLER_RETIREMENT_CRITERIA.md](./LEGACY_STRANGLER_RETIREMENT_CRITERIA.md) |

## Rules

1. No legacy or transitional component may receive **unrestricted** feature development.
2. This matrix does **not** authorize tracking FastAPI (`backend/`).
3. Phase labels are planning aids — not proof of completed work.
4. Directory presence ≠ operational or tracked.

## Matrix

| Path | Tracked? | Current use | Allowed changes | Prohibited changes | Replacement target | Migration dependency | Retirement criteria | Evidence required | Owner decision required | Rollback |
|------|----------|-------------|-----------------|--------------------|--------------------|----------------------|---------------------|-------------------|-------------------------|----------|
| `backend/` FastAPI | No (0) | Local-only legacy API if present | Freeze; read-only aliases only if separately approved | New core features; treat as canonical; track without OD | Nest `apps/api` (intended) | OQ-3 recovery OD; parity matrix | Strangler phases + owner sign-off | Route/data/auth/tenant/audit parity packs | Yes — frozen-legacy track OD separate from R0-1B2.1 | Keep freeze; do not delete without evidence |
| Cognito / DynamoDB (local/infra docs) | Mostly untracked | Legacy IdP/SoR paths | Documentation of freeze | New Cognito/Dynamo integrations for pilot | Keycloak + PostgreSQL | Identity cutover OD | Deprovision evidence | Auth + data migration evidence | Yes | Re-enable only under OD |
| `frontend-app/` Vite | Yes (108) | Operational pilot UI | Pilot maintenance | Strategic feature expansion; claim Next parity | `apps/web` + `apps/admin` | Gap Note exits; future ADR-008 | Gap Note criteria | Parity matrix + Next-only E2E | ADR supersession in R0-1B2.2 | Keep Vite until exits |
| `frontend-public/` (if present) | Unverified local | Possible public verify UI | Freeze pending mapping | New surface growth | `apps/web` | Frontend consolidation | Mapping + E2E | Inventory | Architecture Board | Restore routes |
| Root legacy compose / Dynamo stacks | Varies | Legacy local stacks | Banner / docs only | Use as CLRC path | `infra/docker` intended | Ops OD | Ops runbook exclusive Nest/Keycloak/PG | Runbook + smoke | Ops | Restore compose docs |
| Kafka-as-MVP documentation (untracked ADRs) | Untracked ADR candidates | Historical ADR text | None in R0-1B2.1 | Activate as messaging SoT | Messaging OD (C-03) / future ADR work | OD-R01B2-5 | Signed messaging decision | Owner signature | Yes (OD-R01B2-5) | Keep C-03 open |
| `packages/audit-client` | Yes (5) | Transitional client | Client fixes | Claim unified ledger complete | Future tracked `packages/audit` | OQ-7 | Consolidation evidence | Ledger tests on clean clone | Architecture Board | Keep client |
| Root `prisma/` if local | No | Deprecated monolith schema comment locally | None as SoT | Claim canonical schema | `packages/database` (intended; currently 0 tracked) | Data OD | Tracked Prisma project | Migrations + tenant fields | Owner | Keep untracked |

## FastAPI tracking clause

**R0-1B2.1 does not authorize adding `backend/**` to git.** Any future tracking requires a separate owner-approved frozen-legacy task and must not mark FastAPI as canonical.
