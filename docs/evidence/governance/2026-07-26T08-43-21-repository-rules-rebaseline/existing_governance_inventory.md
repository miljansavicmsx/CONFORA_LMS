# Existing Governance Inventory

**Headline finding (VERIFIED): the repository tracks its compliance evidence but not the standards it complies with.**

```text
git ls-files docs                    → 1087 files
git ls-files docs/evidence           → 1087 files
tracked under docs/ outside evidence →    0 files
```

Every ADR, standard, architecture document and the canonical Baseline exists on disk and is **untracked**. `.cursor/rules/**` is additionally **gitignored**.

---

## 1. `.cursor/rules/**` — **VERIFIED on disk / IGNORED + UNTRACKED in git**

```text
.gitignore:72:.cursor/    .cursor/rules/00-project-governance.mdc
.gitignore:72:.cursor/    .cursor/
```

`git ls-files ".cursor/"` → **0**.

| Rule file | Mandate |
|-----------|---------|
| `confora-baseline.mdc` | Read and comply with the Baseline; Baseline overrides conflicting documents; never generate Baseline-violating code |
| `00-project-governance.mdc` | Standards-driven platform; English implementation, i18n only; evaluate domain/security/audit/AI/tenant/RBAC/certification impact before coding |
| `01-architecture.mdc` | DDD domains; separation of concerns and duties; no business logic in controllers or UI; explicit services and DTOs |
| `02-backend.mdc` | NestJS/Postgres/Prisma; validate DTOs; RBAC, tenant isolation and audit on critical operations |
| `03-frontend.mdc` | WCAG 2.2, i18n, semantic HTML; Next.js/React/Tailwind/shadcn |
| `04-database.mdc` | Postgres + pgvector; mandatory `created_at`/`updated_at`/`created_by`/`tenant_id`; certification records immutable after approval |
| `05-ai-governance.mdc` | AI assistive only; never final certification decisions; model/prompt-hash/reviewer metadata; human oversight |
| `06-security.mdc` | ISO 27001 controls; no secrets in code; never trust client authorization; log security events |
| `07-testing.mdc` | Mandatory tests for RBAC, certification, assessment, AI governance, audit logging, API validation, tenant isolation; never silently disable tests |

**Governance implication:** nine binding rule files cannot be versioned, code-reviewed, or diffed. Each developer's local copy is authoritative for their own session, and drift between copies is undetectable.

## 2. `.cursorrules` — **NOT FOUND**

`Test-Path .cursorrules` → `False`. Only the modern `.cursor/rules/*.mdc` format is used.

## 3. `AGENTS.md` — **VERIFIED (TRACKED)**

The only tracked governance instrument. Mandates:

- Authoritative document is `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md`
- Agents SHALL read and follow the Baseline, treat it as higher authority than any other document, report conflicts, and **refuse implementations that violate governance requirements**
- Compliance: ISO/IEC 17024, ISO 21001, ISO/IEC 27001, GDPR, AI governance, SoD, multi-tenant isolation, immutable audit trail, evidence preservation
- AI is assistive only; certification decisions require human review

**CRITICAL CONTRADICTION:** the one tracked governance file delegates all authority to an **untracked** file. A clone from git cannot obey `AGENTS.md`.

## 4. `.cursorignore` — **VERIFIED (TRACKED)**

```text
node_modules, dist, build, coverage, .next, .cache, .tmp, logs, *.log,
*.sqlite, *.db, .env*, docker-data, uploads, generated, prisma/migrations
```

**Finding:** `prisma/migrations` is excluded from Cursor indexing. Migrations are the source of truth for schema history — including the append-only audit triggers and tenant isolation changes — so agents working in this repository are blind to them by configuration. Combined with `packages/database` being untracked, schema history is doubly invisible.

`.cursorignore` does not cover `.terraform/` or compiled emit under `packages/*/src/`.

## 5. Architecture documents — **VERIFIED on disk / UNTRACKED**

`docs/architecture/` — **41 files** (33 top-level + 8 under `decisions/`), all untracked:

- `STRUCTURE.md`, `CANONICAL_COMPONENT_REGISTRY.md`, `LEGACY_DEPRECATION_MATRIX.md`
- **G3 tenant series** (8): isolation gap report, model, remediation, test plan, seed, API matrix, P0 report
- **G4 auth series** (8): surface inventory, conflict, canonicalization, bypass, MFA, roles, tenant claim, roadmap
- **G5 audit series** (5): inventory, taxonomy, conflict, unified ledger, legacy audit deprecation
- **G6 strangler series** (9): domain inventory, sequence, compatibility, data/frontend/legacy route mapping, risk, first candidate, strangler report

This is a substantial and mature architecture corpus. None of it is in git.

## 6. ADRs — **VERIFIED on disk / UNTRACKED**

`docs/architecture/decisions/**`, all untracked, all status **Accepted**:

| ADR | Title |
|-----|-------|
| ADR-001 | Frontend Architecture |
| ADR-002 | Backend Architecture |
| ADR-003 | Database Strategy |
| ADR-004 | Vector Search and RAG |
| ADR-005 | Authentication and Authorization |
| ADR-006 | AI Governance |
| ADR-007 | Audit Architecture |

Plus `decisions/README.md` (index; notes a Baseline §18 `docs/adr/` alias).

ADR-001 is directly contradicted by `docs/governance/FRONTEND_CANONICALIZATION_GAP_NOTE.md` — see `canonical_legacy_inventory.md` §2. An Accepted ADR that current practice overrides, with no superseding ADR, is itself a governance defect.

## 7. Canonical component registry — **VERIFIED (UNTRACKED)**

`docs/architecture/CANONICAL_COMPONENT_REGISTRY.md`, doc ID `CON-ARCH-REGISTRY-001`. Legend: Canonical / Transitional / Legacy / Unknown. Maps Nest `apps/api` and `apps/web`/`apps/admin` as Canonical; `backend/` FastAPI as Legacy; Vite `frontend-app` and `frontend-public` as Transitional.

## 8. Legacy deprecation matrix — **VERIFIED (UNTRACKED)**

| Path | Role |
|------|------|
| `docs/LEGACY_DEPRECATION_PLAN.md` | authoritative phased plan |
| `docs/architecture/LEGACY_DEPRECATION_MATRIX.md` | G1 master matrix |
| `docs/architecture/G5_LEGACY_AUDIT_DEPRECATION_PLAN.md` | audit-specific |
| `docs/governance/LEGACY_STRANGLER_RETIREMENT_CRITERIA.md` | retirement gates (Phase 0 coexistence; retirement not executed) |

## 9. Multi-tenancy standard — **VERIFIED (UNTRACKED)**

`docs/MULTI_TENANCY_STANDARD.md` — self-described **"Authoritative — non-negotiable"**; defines `tenant_id` requirements, API tenant context, and RBAC/audit/AI/storage tenancy rules. Companion: `docs/MULTI_TENANT.md` and the G3 series. Baseline §15 restates the mandate.

Actual enforcement status: see `tenant_isolation_inventory.md` — PARTIALLY VERIFIED with four bypasses.

## 10. Shared-kernel standard — **VERIFIED (UNTRACKED)**

`docs/SHARED_KERNEL_STANDARD.md` — authoritative; defines `packages/shared-kernel` contracts; forbids HTTP, ORM and React inside the kernel; notes that packages were placeholders when authored. `packages/shared-kernel` is now TRACKED (9 files) and appears to respect the constraint.

## 11. AI governance documents — **VERIFIED on disk / UNTRACKED**

| Path | Status |
|------|--------|
| `docs/AI_GOVERNANCE_MODEL.md` | UNTRACKED |
| `docs/AI_CONFIDENCE_STANDARD.md` | UNTRACKED |
| `docs/AI_GUIDANCE_PRINCIPLES.md` | UNTRACKED |
| `docs/AI_RECOMMENDATION_TAXONOMY.md` | UNTRACKED |
| `docs/architecture/decisions/ADR-006-ai-governance.md` | UNTRACKED |
| `.cursor/rules/05-ai-governance.mdc` | IGNORED + UNTRACKED |
| `Confora Ai Development Governance Framework V1.pdf` (repo root) | UNTRACKED |

`AI_GOVERNANCE_MODEL.md` mandates human-in-the-loop, transparency, prohibition of certification-outcome language, and confidence bands.

**Partial good news:** the AI *implementation* packages are tracked and were audited under RH39–RH46. `packages/ai-prompts` (10 files) is fail-closed with a closed prompt-ID allowlist; `packages/ai-client` (5 files) is inert at import and routes only to the internal gateway with `disclosure_shown` required and `human_oversight_required` defaulting to true. These are among the few areas where tracked code demonstrably matches the documented policy.

## 12. Generated-file manifests — **NOT FOUND**

`docs/GENERATED_FILES.md`, root `GENERATED_FILES.md`, `codegen-manifest.json` — none exist. The only related material is RH48A evidence discussing `packages/ai-client` compiled artifacts, which is run evidence rather than a canonical registry. See `generated_files_inventory.md`.

## 13. Canonical Development Baseline — **VERIFIED EXISTS / UNTRACKED — CRITICAL**

| Check | Result |
|-------|--------|
| Path | `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md` |
| Exists on disk | **Yes** |
| Tracked | **No** |
| Cited as authority by | `AGENTS.md` (TRACKED), `.cursor/rules/confora-baseline.mdc` (IGNORED) |

Document ID `CON-ARCH-BASELINE-001`, Status **CANONICAL**. Key mandates:

- Source hierarchy: Baseline > GDPR policy > `AGENTS.md` > TECH_DEBT > others
- Non-negotiables: auditability, tenant isolation, SoD, human oversight, AI transparency; forbid fake compliance and AI-only certification decisions
- Canonical stack: Next.js `apps/web` + `apps/admin`, NestJS `apps/api`, PostgreSQL 16 + Prisma, Keycloak, RabbitMQ for MVP, pgvector
- IAL-1/IAL-2 identity assurance (no IAL-3 in MVP); GDPR retention table
- AI assistive only, with prompt and model hashing
- WCAG 2.2; locales `bs-BA` and `en-US`
- Tenant isolation tests mandatory

---

## Governance documentation posture

| Layer | In git? | On disk? |
|-------|:-------:|:--------:|
| `AGENTS.md`, `.cursorignore`, `.gitignore` | Yes | Yes |
| `.cursor/rules/**` (9 files) | **No — ignored** | Yes |
| Baseline, ADRs, standards under `docs/` (non-evidence) | **No** | Yes (~342 files in major subdirs + ~286 root-level `docs/*.md`) |
| `docs/evidence/**` | **Yes (1087 = 100% of tracked docs)** | Yes |
| Root specification documents (`.docx`, `.pdf`, `.md`) | Mostly **No** | Yes |

## Contradictions and gaps

1. **The authority chain is broken in git.** Tracked `AGENTS.md` mandates an untracked Baseline. The same pattern applies to ADRs, the multi-tenancy standard, the shared-kernel standard, the deprecation plan and the canonical registry.
2. **`.cursor/` is fully gitignored** — agent governance rules cannot be versioned or reviewed, and diverge silently between machines.
3. **Documentation posture is inverted** — evidence tracked, standards untracked.
4. **ADR-001 is Accepted but overridden in practice** with no superseding ADR.
5. **Registry vs G5 disagree** on whether `@confora/audit-client` is canonical or legacy.
6. **`.cursorignore` hides `prisma/migrations`** from agent indexing while migrations carry the audit and tenancy controls.
7. **No canonical generated-file manifest** exists.
8. **Documented controls consistently outrun implemented controls** — tenant isolation, SoD, audit redaction and RBAC are all described more completely than they are enforced.
