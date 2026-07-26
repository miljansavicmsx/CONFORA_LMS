# OQ-3 backend contradiction analysis

**Status preserved:** OQ-3 remains **OPEN**. This document does **not** select a recovery option.

## Intended direction (approved decision / governance requirement)

- NestJS is the intended canonical backend direction (Baseline §4.2 / §0.1; OQ-3).
- FastAPI is **not** approved as canonical.
- FastAPI may be tracked only via a **separate approved frozen-legacy task**.

## Actual tracked state of pps/api (verified facts)

| Fact | Evidence |
|------|----------|
| 20 tracked files under pps/api/** | git ls-files |
| Tracked entrypoints incomplete | No pps/api/src/main.ts |
| pp.module.ts imports many modules | AiModule, AuditModule, TenantModule, numerous cert modules, etc. |
| Those modules are not in tracked file list | Only uth, cert-governance, cert-wallet, prisma source files tracked |
| Local workspace pps/api/src dirs observed | 4 directories matching sparse subset |
| package.json defines 
est build | Scripts present — insufficient for clean-clone success |
| Clean-clone buildability | **Not confirmed** |

## FastAPI local/tracked status

| Fact | Evidence |
|------|----------|
| ackend/ exists locally | Path present |
| Tracked files | **0** |
| Local routers | **72** ackend/routers/*.py |
| Deployment | R0-3 deploy-backend.yml is containment-only (workflow_dispatch + production environment); production unauthorized (OQ-6) |

## Unresolved recovery choices (options for a later OQ-3 task — NOT decided here)

| Option | Summary | Implications |
|--------|---------|--------------|
| **A — Recover from local/pilot artifacts** | Reconcile local Nest tree into tracked pps/api under controlled promotion | Requires provenance/audit of untracked code; large review |
| **B — Rebuild incrementally** | Treat tracked stub as seed; re-implement modules against Baseline | Slower; clearest clean-clone story |
| **C — Dual-stack with explicit frozen FastAPI track** | Keep Nest incomplete; separately approve FastAPI frozen-legacy tracking | Needs separate owner task; does **not** make FastAPI canonical |
| **D — Owner-defined hybrid** | Combine A/B/C with time-boxed gates | Must preserve SoD, tenant, audit requirements |

## What R0-1B2 must not do

- Close OQ-3.
- Claim pps/api complete/buildable.
- Approve FastAPI as canonical.
- Track FastAPI as part of R0-1B2 architecture promotion.
- Convert strangler "Nest pilot authority" narrative into a clean-clone verified claim without evidence.
