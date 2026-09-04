# CONFORA Architecture Source of Truth

| Field | Value |
|-------|-------|
| **Document ID** | CON-ARCH-SOT-001 |
| **Status** | Normative architecture (R0-1B2.1) |
| **Date** | 2026-07-26 |
| **Owner** | Repository Owner / Architecture |
| **Authority** | Subordinate to approved owner decisions and the Canonical Development Baseline per [GOVERNANCE_HIERARCHY.md](../governance/GOVERNANCE_HIERARCHY.md) |
| **Supersedes (as architecture root)** | Untracked `docs/architecture/STRUCTURE.md` (left in place as local source only; not tracked) |

## Label legend

| Label | Meaning |
|-------|---------|
| `VERIFIED_CURRENT` | Confirmed against the tracked repository / clean-clone evidence |
| `APPROVED_TARGET` | Approved intended direction (not proof of implementation) |
| `PARTIALLY_VERIFIED` | Some tracked evidence exists; completeness not proven |
| `UNVERIFIED_LOCAL_ONLY` | Present on a developer machine; zero or insufficient tracked files |
| `OPEN_DECISION` | Requires owner decision; must not be treated as closed |

---

## 1. Document authority and scope

This document is the **tracked architecture root** for CONFORA after R0-1B2.1.

It does **not**:

- outrank [OWNER_DECISION_REGISTER.md](../governance/OWNER_DECISION_REGISTER.md) or the Baseline;
- supersede ADR-001 (deferred to R0-1B2.2);
- activate messaging ADRs (C-03 remains `OPEN`);
- reopen OQ-3 (OQ-3 is `CLOSED_ACCEPTED`; NestJS/`apps/api` is canonical);
- authorize production deployment.

ADR identifiers mentioned below are **plain-text references** until R0-1B2.2 tracks ADR files. Do not treat untracked `docs/architecture/decisions/**` as normative links.

---

## 2. Verified repository state

| Fact | Label |
|------|-------|
| Integration tip for R0-1B2.1 work includes R0-1B1 authority chain | `VERIFIED_CURRENT` |
| Tracked `apps/api` historically had a sparse subset at R0-1B2.1 (≈20 files); that inventory is superseded by accepted BAR-P01..P08 recovery | `HISTORICAL_SUPERSEDED` |
| Tracked `apps/api` historically **not confirmed buildable**; superseded by accepted BAR-P01..P08 + OQ-3 CR1 clean-clone buildability | `HISTORICAL_SUPERSEDED` |
| `frontend-app` has 108 tracked files and uses Vite | `VERIFIED_CURRENT` |
| `apps/web` and `apps/admin` have **0** tracked files | `VERIFIED_CURRENT` |
| `backend/` (FastAPI) has **0** tracked files; local tree may exist | `UNVERIFIED_LOCAL_ONLY` / untracked |
| `packages/database` is tracked Prisma/PostgreSQL authority after BAR-P02 (historical R0-1B2.1 absence superseded); `packages/auth` / `packages/audit` package absences may remain separate | `VERIFIED_CURRENT` (post-BAR) |
| `packages/shared-kernel` has tracked source (9 files) | `VERIFIED_CURRENT` |
| R0-3 `deploy-backend.yml` is `workflow_dispatch` + Environment `production` containment | `VERIFIED_CURRENT` |
| Production deployment unauthorized; deny-all branch allowlist; RA-R03-1 temporary | `APPROVED_TARGET` constraints via OQ-6 / OD-R03-* |

---

## 3. Approved target architecture

| Layer | Target | Label |
|-------|--------|-------|
| Frontend | Next.js `apps/web` + `apps/admin`, Tailwind, shadcn/ui patterns | `APPROVED_TARGET` |
| Backend | NestJS `apps/api` + worker for async | `APPROVED_TARGET` |
| Data | PostgreSQL + Prisma (intended home `packages/database`) | `APPROVED_TARGET` |
| Identity | Keycloak OIDC / JWT; RBAC + SoD (OQ-5 DIRECTIONAL) | `APPROVED_TARGET` |
| Audit | Append-only ledger; human-oversight for AI | `APPROVED_TARGET` |
| Messaging (MVP requirement) | Baseline §4.7 records **RabbitMQ** as MVP requirement | `APPROVED_TARGET` / requirement — **not** verified deployed; C-03 `OPEN` |
| AI | Assistive only; never autonomous certification authority | `APPROVED_TARGET` |

---

## 4. Current operational architecture

| Surface | Status | Label |
|---------|--------|-------|
| Learner/operator UI | `frontend-app` (Vite + React) is the **operational canonical** frontend for the locked local RC | `VERIFIED_CURRENT` + OQ-4 |
| API (clean clone) | NestJS `apps/api` is the canonical backend (OQ-3 CLOSED_ACCEPTED); recovered via BAR-P01..P08 | `VERIFIED_CURRENT` |
| FastAPI | Not approved canonical; untracked if present locally; frozen-legacy only via separate OD | `APPROVED_TARGET` / disposition decided |

---

## 5. Frontend architecture

| Statement | Label |
|-----------|-------|
| `frontend-app` = current tracked operational canonical frontend | `VERIFIED_CURRENT` |
| Feature growth on Vite limited to approved pilot maintenance | `APPROVED_TARGET` / Gap Note |
| Next.js remains intended target for `apps/web` and `apps/admin` | `APPROVED_TARGET` |
| Operational parity of Next apps is **not** claimed | `VERIFIED_CURRENT` non-claim |
| OQ-4 remains `OPEN` | `OPEN_DECISION` |
| ADR-001 supersession deferred to R0-1B2.2 (future ADR-008) | `OPEN_DECISION` |

See: [FRONTEND_CANONICALIZATION_GAP_NOTE.md](../governance/FRONTEND_CANONICALIZATION_GAP_NOTE.md).

---

## 6. Backend architecture

| Statement | Label |
|-----------|-------|
| NestJS is the canonical backend (`apps/api`) | `APPROVED_TARGET` / `CLOSED_ACCEPTED` (OQ-3) |
| Tracked `apps/api` historical `INTENDED_CANONICAL_INCOMPLETE` / not-buildable state superseded by BAR-P01..P08 | `HISTORICAL_SUPERSEDED` |
| OQ-3 is `CLOSED_ACCEPTED` (historical R0-1B2.1 OPEN / deferred A/B/C/D lettering preserved as history only) | `CLOSED_ACCEPTED` |
| FastAPI `backend/` is not canonical | `APPROVED_TARGET` / owner decision |
| FastAPI tracking requires a separate owner-approved frozen-legacy task | `OPEN_DECISION` gate (unchanged; not OQ-3 re-open) |

---

## 7. Identity, authentication, RBAC and SoD

| Statement | Label |
|-----------|-------|
| Target: JWT + RBAC + SoD + MFA readiness in canonical stack | `APPROVED_TARGET` |
| OQ-5 remains `DIRECTIONAL` | `OPEN_DECISION` |
| `packages/auth` not tracked on clean clone | `VERIFIED_CURRENT` |
| Partial Nest auth helpers exist under tracked `apps/api/src/auth/` | `PARTIALLY_VERIFIED` |
| Complete SoD enforcement is **not** claimed | non-claim |

---

## 8. Tenant isolation

| Statement | Label |
|-----------|-------|
| Requirement: tenant isolation on core entities and request paths | `APPROVED_TARGET` |
| Tracked fragments: `prisma-tenant-extension.ts`, `tenant-access-violation.filter.ts` | `PARTIALLY_VERIFIED` |
| OQ-7 remains `OPEN` | `OPEN_DECISION` |
| Complete tenant isolation / RLS is **not** claimed | non-claim |

Detail: [MULTI_TENANCY_STANDARD.md](./MULTI_TENANCY_STANDARD.md).

---

## 9. Data architecture and Prisma status

| Statement | Label |
|-----------|-------|
| Intended Prisma home: `packages/database` | `APPROVED_TARGET` |
| Tracked files under `packages/database`: **0** | `VERIFIED_CURRENT` |
| Root `prisma/` if present locally is untracked / non-canonical for clean clone | `UNVERIFIED_LOCAL_ONLY` |

---

## 10. Audit and evidence architecture

| Statement | Label |
|-----------|-------|
| Append-only audit ledger is required | `APPROVED_TARGET` |
| `packages/audit-client` tracked (5 files); `packages/audit` untracked (0) | `PARTIALLY_VERIFIED` |
| Complete audit redaction / hash-chain verification on clean clone **not** claimed | non-claim |
| OQ-7 remains `OPEN` | `OPEN_DECISION` |

---

## 11. Messaging and asynchronous processing

| Statement | Label |
|-----------|-------|
| C-03 remains `OPEN` | `OPEN_DECISION` |
| Baseline §4.7: RabbitMQ is the MVP **requirement** | `APPROVED_TARGET` (requirement) |
| Untracked ADR candidates historically reference Kafka | historical / untracked — not linked |
| R0-1B2.1 does **not** activate, amend, or supersede ADR-002 or ADR-007 | constraint |
| Kafka is **not** a verified deployed MVP component | `VERIFIED_CURRENT` non-claim |
| RabbitMQ is **not** claimed as verified operational implementation in this document without tracked reproducible evidence | non-claim |
| `apps/worker` has **0** tracked files | `UNVERIFIED_LOCAL_ONLY` |

---

## 12. Shared packages and bounded contexts

| Package | Tracked files | Label |
|---------|---------------|-------|
| `packages/shared-kernel` | 9 | `PARTIALLY_VERIFIED` |
| `packages/shared-types` | 8 | `PARTIALLY_VERIFIED` |
| `packages/ui` | 11 | `PARTIALLY_VERIFIED` |
| `packages/i18n` | 50 | `PARTIALLY_VERIFIED` |
| `packages/audit-client` | 5 | `PARTIALLY_VERIFIED` |
| `packages/database` / `auth` / `audit` / `ai-governance` | 0 | absent on clean clone |

Detail: [SHARED_KERNEL_STANDARD.md](./SHARED_KERNEL_STANDARD.md).

---

## 13. Legacy and strangler boundaries

| Rule | Label |
|------|-------|
| No unrestricted feature development on frozen legacy surfaces | `APPROVED_TARGET` |
| FastAPI tracking not authorized by this document | constraint |
| Strangler retirement requires owner decision + independent verification | `APPROVED_TARGET` |
| Criteria do **not** prove current Nest readiness | non-claim |

See: [LEGACY_DEPRECATION_MATRIX.md](./LEGACY_DEPRECATION_MATRIX.md), [LEGACY_STRANGLER_RETIREMENT_CRITERIA.md](./LEGACY_STRANGLER_RETIREMENT_CRITERIA.md).

---

## 14. Generated files

| Artifact class | Label |
|----------------|-------|
| `dist/`, coverage, generated SDK outputs | `GENERATED` — never hand-edit; never treat as source of truth |

---

## 15. Deployment containment and production status

| Statement | Label |
|-----------|-------|
| R0-3 containment active | `VERIFIED_CURRENT` |
| Production deployment unauthorized | `APPROVED_TARGET` / OQ-6 |
| Temporary deny-all deployment branch allowlist | owner decision |
| RA-R03-1 admin bypass temporary; review by 2026-08-26 | owner decision |
| R0-7 CI reconstruction still required | `OPEN_DECISION` / deferred task |

---

## 16. Open contradictions

See [ARCHITECTURE_OPEN_QUESTIONS.md](./ARCHITECTURE_OPEN_QUESTIONS.md) for C-02 through C-10. This root does not close them.

---

## 17. Links to tracked governance and architecture documents

| Document | Path |
|----------|------|
| AGENTS | [AGENTS.md](../../AGENTS.md) |
| Baseline | [CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md](../governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md) |
| Hierarchy | [GOVERNANCE_HIERARCHY.md](../governance/GOVERNANCE_HIERARCHY.md) |
| Constitution | [ENGINEERING_CONSTITUTION.md](../governance/ENGINEERING_CONSTITUTION.md) |
| Owner decisions | [OWNER_DECISION_REGISTER.md](../governance/OWNER_DECISION_REGISTER.md) |
| Owner package | [OWNER_DECISION_PACKAGE.md](../governance/OWNER_DECISION_PACKAGE.md) |
| Change control | [CHANGE_CONTROL.md](../governance/CHANGE_CONTROL.md) |
| Standards policy | [STANDARDS_REFERENCE_POLICY.md](../governance/STANDARDS_REFERENCE_POLICY.md) |
| Frontend gap note | [FRONTEND_CANONICALIZATION_GAP_NOTE.md](../governance/FRONTEND_CANONICALIZATION_GAP_NOTE.md) |
| Component registry | [CANONICAL_COMPONENT_REGISTRY.md](./CANONICAL_COMPONENT_REGISTRY.md) |
| Deprecation matrix | [LEGACY_DEPRECATION_MATRIX.md](./LEGACY_DEPRECATION_MATRIX.md) |
| Multi-tenancy | [MULTI_TENANCY_STANDARD.md](./MULTI_TENANCY_STANDARD.md) |
| Shared kernel | [SHARED_KERNEL_STANDARD.md](./SHARED_KERNEL_STANDARD.md) |
| Strangler criteria | [LEGACY_STRANGLER_RETIREMENT_CRITERIA.md](./LEGACY_STRANGLER_RETIREMENT_CRITERIA.md) |
| Open questions | [ARCHITECTURE_OPEN_QUESTIONS.md](./ARCHITECTURE_OPEN_QUESTIONS.md) |

**End of ARCHITECTURE.md**
