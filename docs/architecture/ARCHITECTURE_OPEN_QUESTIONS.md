# CONFORA Architecture Open Questions Register

| Field | Value |
|-------|-------|
| **Document ID** | CON-ARCH-OQREG-001 |
| **Status** | Normative architecture pointer register (R0-1B2.1) |
| **Date** | 2026-07-26 |
| **Authority** | Does **not** duplicate or supersede [OWNER_DECISION_REGISTER.md](../governance/OWNER_DECISION_REGISTER.md) |

Use this register for architecture readers. Binding statuses and decisions remain in the Owner Decision Register.

---

## C-02 / OQ-3 — Nest intended vs incomplete tracked API

| Field | Value |
|-------|-------|
| Contradiction ID | C-02 |
| Status | OPEN |
| Verified facts | Nest intended; tracked `apps/api` 20 files; not confirmed buildable; FastAPI untracked |
| Governing decision | OQ-3 OPEN; FastAPI not canonical |
| Missing owner decision | Recovery option A/B/C/D (deferred OD-R01B2-6) |
| Affected | `apps/api`, `backend/`, registry, strangler |
| Permitted interim | Document incompleteness; Nest-directed new design under Baseline |
| Prohibited interim | Claim buildable; track FastAPI without OD; close OQ-3 |
| Target task | Separate OQ-3 remediation |
| Exit criteria | Owner recovery OD + clean-clone build evidence |

## C-03 — Messaging RabbitMQ vs Kafka

| Field | Value |
|-------|-------|
| Contradiction ID | C-03 |
| Status | OPEN |
| Verified facts | Baseline §4.7 RabbitMQ MVP **requirement**; untracked ADR candidates mention Kafka; no verified deployed MVP broker claimed here |
| Governing decision | OD-R01B2-5 deferred for active messaging ADR |
| Missing owner decision | Messaging signature before ADR-002/007 activation |
| Affected | ARCHITECTURE §11; future ADR-002/007 |
| Permitted interim | Cite Baseline §4.7 as requirement only |
| Prohibited interim | Activate Kafka or RabbitMQ as verified MVP via R0-1B2.1 |
| Target task | R0-1B2.2 after OD-R01B2-5 |
| Exit criteria | Signed OD + tracked ADR rebaseline |

## C-04 / OQ-5 — Identity / RBAC / SoD

| Field | Value |
|-------|-------|
| Contradiction ID | C-04 |
| Status | DIRECTIONAL (OQ-5) |
| Verified facts | `packages/auth` 0 tracked; partial Nest auth helpers |
| Governing decision | OQ-5 DIRECTIONAL |
| Missing owner decision | Completion/parity gate for identity stack |
| Affected | Auth packages, ADR-005 (future) |
| Permitted interim | Target Keycloak/JWT/RBAC/SoD as intended |
| Prohibited interim | Claim complete SoD/RBAC |
| Target task | Identity remediation / R0-1B2.2 ADR-005 |
| Exit criteria | Tracked contracts + verification evidence |

## C-05 / OQ-4 — Frontend ADR-001 vs frontend-app

| Field | Value |
|-------|-------|
| Contradiction ID | C-05 |
| Status | OPEN |
| Verified facts | `frontend-app` operational (108 tracked); `apps/web`/`admin` 0 tracked |
| Governing decision | OQ-4 OPEN; Gap Note tracked |
| Missing owner decision | ADR-008 supersession (R0-1B2.2 / OD-R01B2-2) |
| Affected | Frontend, registry |
| Permitted interim | Pilot maintenance on Vite; Next as target |
| Prohibited interim | Claim Next parity; rewrite ADR-001 history in this wave |
| Target task | R0-1B2.2 |
| Exit criteria | ADR-008 + Gap Note exits |

## C-06 / OQ-7 — Tenant / audit verification

| Field | Value |
|-------|-------|
| Contradiction ID | C-06 |
| Status | OPEN |
| Verified facts | Partial tenant filter/extension tracked; database/audit packages incomplete |
| Governing decision | OQ-7 OPEN |
| Missing owner decision | Remediation sequencing |
| Affected | MULTI_TENANCY_STANDARD; audit packages |
| Permitted interim | State requirements vs partial evidence |
| Prohibited interim | Claim complete isolation/RLS/redaction |
| Target task | OQ-7 remediation |
| Exit criteria | Verification pack on clean clone |

## C-07 / OQ-6 — Deployment containment

| Field | Value |
|-------|-------|
| Contradiction ID | C-07 |
| Status | MERGED_WITH_CONDITIONS (containment) |
| Verified facts | `workflow_dispatch` deploy-backend; production unauthorized |
| Governing decision | OQ-6; OD-R03-*; RA-R03-1 |
| Missing owner decision | Production enablement (not now) |
| Affected | Deploy docs/workflows |
| Permitted interim | Containment controls |
| Prohibited interim | Imply production authorized |
| Target task | Post OQ-3 / reviewer / allowlist remediation |
| Exit criteria | Explicit production OD |

## C-08 — Registry over-claims

| Field | Value |
|-------|-------|
| Contradiction ID | C-08 |
| Status | ADDRESSED IN R0-1B2.1 DOC (monitoring) |
| Verified facts | Prior untracked registry used unqualified Canonical labels |
| Governing decision | OD-R01B2-9 expanded vocabulary |
| Missing owner decision | None for vocabulary (applied) |
| Affected | `CANONICAL_COMPONENT_REGISTRY.md` |
| Permitted interim | Two-dimension status model |
| Prohibited interim | Directory ⇒ operational |
| Target task | Keep registry honest in future edits |
| Exit criteria | Ongoing review |

## C-09 — Shared-kernel drift

| Field | Value |
|-------|-------|
| Contradiction ID | C-09 |
| Status | OPEN (doc drift reduced) |
| Verified facts | Tracked shared-kernel src exists; older docs called it placeholder |
| Governing decision | OD-R01B2-1 scope includes shared-kernel rebaseline |
| Missing owner decision | None blocking |
| Affected | `SHARED_KERNEL_STANDARD.md` |
| Permitted interim | Describe partial tracked implementation |
| Prohibited interim | Claim complete kernel/platform packages |
| Target task | Package completion work |
| Exit criteria | Package completeness evidence |

## C-10 — Untracked self-declared canonical docs

| Field | Value |
|-------|-------|
| Contradiction ID | C-10 |
| Status | OPEN for remaining untracked corpus |
| Verified facts | Many `docs/architecture/G*.md`, Bible, decisions/** remain untracked |
| Governing decision | OD-R01B2-7 evidence-only for G3–G6/Bible; ADR move in R0-1B2.2 |
| Missing owner decision | Per-doc promotion beyond R0-1B2.1 |
| Affected | Untracked architecture corpus |
| Permitted interim | Use as inputs only |
| Prohibited interim | Cite as tracked normative via broken links |
| Target task | R0-1B2.2 / later waves |
| Exit criteria | Tracked paths or explicit archive |
