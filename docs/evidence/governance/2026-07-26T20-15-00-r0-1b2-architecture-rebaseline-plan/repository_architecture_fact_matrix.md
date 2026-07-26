# Repository architecture fact matrix

Legend for each statement: **VF** verified fact | **GR** governance requirement | **AD** approved decision | **RC** recommendation | **UC** unresolved contradiction.

| Path | Exists locally | Tracked files | Classification of presence | Notes |
|------|----------------|---------------|----------------------------|-------|
| pps/api | Yes | 20 | Incomplete tracked Nest stub | **VF**: no main.ts tracked or present; tracked pp.module.ts imports many modules not in tracked tree → **not confirmed buildable on clean clone**. Local src/ currently shows 4 dirs (uth,cert-governance,cert-wallet,prisma). **AD/GR**: Nest intended (OQ-3 OPEN). |
| pps/web | Yes | 0 | Untracked local Next scaffold | **VF**: directory present; **not** operational parity proof. **AD**: OQ-4 OPEN. |
| pps/admin | Yes | 0 | Untracked local Next scaffold | Same as apps/web. |
| pps/worker | Yes | 0 | Untracked | STRUCTURE claims Kafka consumers — **UC** with Baseline RabbitMQ. |
| pps/ai-service | Yes | 0 | Untracked README/stub likely | ADR-004/006 reference; unverified. |
| pps/examiner | Yes | 0 | Untracked | Registry Unknown. |
| rontend-app | Yes | 108 | Operational tracked Vite UI | **AD**: OQ-4 current operational canonical frontend. **VF**: package scripts use ite. |
| ackend/ | Yes | 0 | Untracked FastAPI tree | **VF**: 72 ackend/routers/*.py locally. **AD**: not canonical; frozen-legacy track only via separate task. |
| packages/shared-kernel | Yes | 9 | Partial tracked impl | **VF**: src entities/tenant present — doc claim "placeholder only" is outdated. |
| packages/shared-types | Yes | tracked>0 | Tracked | Shared RBAC enums etc. |
| packages/ui, i18n, config, sdk, i-client, i-prompts, 
otification-templates, udit-client | Yes | tracked | Mixed maturity | Inventory only. |
| packages/database | Yes local | 0 | Untracked | ADR-003 intended home; **not** on clean clone. |
| packages/auth, udit, i-governance, 	ypes | Yes local | 0 | Untracked | SHARED_KERNEL_STANDARD targets. |
| prisma/ (root) | Yes | 0 | Untracked | Legacy/alternate schema location. |
| .github/workflows/deploy-backend.yml | Yes | tracked | Containment | **AD/VF**: workflow_dispatch + environment: production; OQ-6. |

## Buildability note (pps/api)

| Check | Result | Class |
|-------|--------|-------|
| package.json tracked with nest build script | Yes | VF |
| src/main.ts | Missing | VF |
| Tracked modules sufficient for AppModule imports | No | VF |
| Clean-clone build confirmation | Not confirmed | VF / AD OQ-3 OPEN |
| Directory presence ⇒ operational | Forbidden inference | GR |

## Messaging

| Source | Claim | Class |
|--------|-------|-------|
| Baseline §4.7 | RabbitMQ MVP; Kafka post-MVP via ADR | GR |
| ADR-002 | Apache Kafka | UC vs Baseline (C-03) |
| ADR_ALIGNMENT_NOTE | RabbitMQ operational MVP; Kafka forward-looking | RC/local note (untracked) |
| STRUCTURE.md | worker Kafka consumers | UC |

## Auth / tenant / audit (tracked surface only)

| Artifact | Tracked | Inference allowed |
|----------|---------|-------------------|
| pps/api/src/prisma/prisma-tenant-extension.ts | Yes | Presence of tenant enforcement helper code — **not** full OQ-7 verification |
| pps/api/src/prisma/tenant-access-violation.filter.ts | Yes | Same |
| pps/api/src/auth/actor-db-access.ts | Yes | Partial auth DB access helper |
| Full Keycloak JWT strategy / TenantModule / AuditLedgerService | Not in tracked file list | Do not claim implemented on clean clone |
