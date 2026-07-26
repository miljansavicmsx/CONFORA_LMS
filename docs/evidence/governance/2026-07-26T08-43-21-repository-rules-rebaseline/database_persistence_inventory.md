# Database and Persistence Inventory

**Headline: two competing persistence stacks coexist on disk, and git tracks almost none of the database implementation.**

| Stack | Status | Tracked? |
|-------|--------|:--------:|
| NestJS + Prisma + PostgreSQL 16 + pgvector | Intended canonical | **No** |
| FastAPI + boto3 + DynamoDB | Labeled legacy, still large on disk | **No** |
| SQLAlchemy | Not implemented (backend models are Pydantic DTOs) | n/a |

`git ls-files` returns **0** tracked files for `packages/database/`, `prisma/`, `backend/`, and `infrastructure/`. Only two Prisma-related sources are tracked, both under `apps/api/src/prisma/`.

---

## 1. Prisma schema — **VERIFIED**

| Path | Tracking | Role |
|------|----------|------|
| `packages/database/prisma/schema.prisma` | **UNTRACKED** | Canonical, multi-schema, **109 models** |
| `prisma/schema.prisma` | **UNTRACKED** | Deprecated monolith, **40 models** |

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
  schemas    = ["auth", "lms", "exam", "cert", "gov", "audit", "compliance"]
}
```
(`packages/database/prisma/schema.prisma` lines 14–19)

The root schema self-labels: `// Deprecated monolith schema: canonical Prisma project is packages/database/prisma/schema.prisma`.

## 2. Prisma configuration — **VERIFIED**

```prisma
generator client { provider = "prisma-client-js"; previewFeatures = ["postgresqlExtensions"] }
generator erd    { provider = "prisma-erd-generator"; output = "../../../docs/erd.svg" }
```

`packages/database/package.json` (UNTRACKED): scripts `generate`, `migrate:dev`, `seed`; `"prisma": { "seed": "tsx prisma/seed.ts" }`; `@prisma/client ^6.19.0`. Client output path unset → Prisma default. `apps/api/package.json` (TRACKED) declares `@prisma/client`.

## 3. Migrations — **VERIFIED**

| Path | Tracking | Count |
|------|----------|------:|
| `packages/database/prisma/migrations/` | **UNTRACKED** | **62** migration folders |
| `packages/database/prisma/migrations/migration_lock.toml` | UNTRACKED | provider = postgresql |
| `prisma/migrations/` | **NOT FOUND** | — |

Range: `20260218100000_init` → `20260706120000_b15_6_complaint_notifications_sla`. Notable: `20260218100001_audit_append_only_and_rls`, `20260531120000_g3r_p0_tenant_isolation`.

**Finding:** 62 migrations defining the entire production schema are untracked. Schema history is not reproducible from git.

## 4. Seed files — **VERIFIED**

`packages/database/prisma/seed.ts` (UNTRACKED), `packages/database/prisma/seeds/td-082-pilot-certificant-wallet.ts` (UNTRACKED), `scripts/ops/seed-*-db.ts` (UNTRACKED), `scripts/seed_*.py` DynamoDB demos (UNTRACKED).

```ts
/** Matches P0 migration default tenant — keep in sync with @confora/shared-kernel DEFAULT_TENANT_ID */
const DEFAULT_TENANT_ID = '00000000-0000-4000-8000-000000000001';
```

## 5. Database clients — **PARTIALLY VERIFIED**

| Path | Tracking | Status |
|------|----------|--------|
| `apps/api/src/prisma/prisma-tenant-extension.ts` | **TRACKED** | present |
| `apps/api/src/prisma/tenant-access-violation.filter.ts` | **TRACKED** | present |
| `apps/api/src/prisma/prisma.service.ts` | — | **MISSING on disk** |
| `apps/api/src/prisma/tenant-prisma.util.ts` | — | **MISSING** (imported by tracked extension) |
| `apps/api/src/prisma/prisma-audit-extension.ts` | — | **MISSING** |
| `apps/api/dist/prisma/prisma.service.js` | UNTRACKED | compiled leftover |
| `apps/worker/src/prisma/prisma.service.ts` | UNTRACKED | present |

**CONTRADICTED:** tracked source imports modules that do not exist:

```ts
import { TENANT_SCOPED_PRISMA_MODELS, ... } from './tenant-prisma.util';
```
(`apps/api/src/prisma/prisma-tenant-extension.ts` lines 1–16 — target file absent)

## 6. Raw SQL — **VERIFIED**

- 62 migration `.sql` files (UNTRACKED)
- `packages/database/test/audit-immutability.test.ts`, `audit-chain-integrity.test.ts` use `$executeRawUnsafe` (UNTRACKED)
- `apps/api/dist/prisma/raw-sql-approval.registry.js` (UNTRACKED) — an **approval registry** for raw SQL sites (`sysadmin-platform.service.ts`, `reports.service.ts`, `question-calibration.scheduler.ts`); the governed source files were not confirmed present

## 7. DynamoDB — **VERIFIED (implemented, untracked)**

| Path | Tracking |
|------|----------|
| `backend/deps.py` (boto3 table accessors) | UNTRACKED |
| `infrastructure/terraform/dynamodb_*.tf` (**22** tables) | UNTRACKED |
| `scripts/create_dynamodb_tables.py` | UNTRACKED |
| `docker-compose.yml` (DynamoDB Local) | **TRACKED** |

```python
def get_dynamodb_table(settings: Settings = Depends(get_settings)):
    resource = boto3.resource("dynamodb", **_ddb_resource_kwargs(settings))
    return resource.Table(settings.users_table_name)
```

## 8. PostgreSQL — **VERIFIED**

`.env.example` (**TRACKED**):

```text
# --- PostgreSQL 16 + pgvector ---
DATABASE_URL=postgresql://confora:confora_dev_change_me@localhost:15432/confora
```

SQLAlchemy: **NOT FOUND** in project code (only inside `backend/.venv`). Backend "models" are Pydantic DTOs, not ORM entities.

## 9. Tenant-owned models — **VERIFIED**

**Prisma canonical: 74 of 109 models carry `tenantId`.**

Examples: `User`, `Course`, `Enrollment`, `ExamSession`, `CertificationApplication`, `Certificate`, `CertificateLifecycleEvent`, `RecertificationCase`, `AppealCase`, `ComplaintCase`, `Document`, `Risk`, `InternalAudit`, `CorrectiveAction`, `ManagementReview`, `Ticket`, `AuditEvent`, plus the full appeals/complaints/contact review chains.

**Runtime enforcement set is smaller: 63 models** in `TENANT_SCOPED_PRISMA_MODELS` (from `apps/api/dist/prisma/tenant-prisma.util.js`, UNTRACKED).

**11 models have `tenantId` in schema but are NOT in the runtime enforcement set** — a direct governance gap:

`TenantSchemeEnablement`, `ApplicationReviewAssignment`, `EligibilityReview`, `EligibilityCriterionAssessment`, `ExamAuthorizationReview`, `AuthorizationCheck`, `ExamLocation`, `ExamSessionSchedule`, `ExamEnrollment`, `AppealNotificationLog`, `AppealSlaCheckpoint`

Python side: 18 `backend/models/*.py` files carry `tenant_id` (DTOs for DynamoDB payloads, not tables).

## 10. Models WITHOUT tenant ownership — **VERIFIED (35 Prisma models)**

`Tenant`, `Role`, `LegalEntity`, `IdentityVerification`, `Consent`, `CertificationScope`, `CourseTechCommitteeVote`, `Chapter`, `Lesson`, `CourseAccessibilityPolicy`, `LessonKnowledgePoint`, `LessonProgress`, `NotificationTemplate`, `NotificationDeliveryIdempotency`, `UserInAppNotification`, `NotificationUserPreferences`, `QuestionKnowledgePoint`, `ExamAnswer`, `ProctoringEvent`, `CertificationSchemeRevision`, `CertificationScheme`, `CertificateTemplate`, `ApplicationVerifier`, `DecisionEvidenceSnapshot`, `ApplicationAccommodationRequest`, `CertificateUidSequence`, `DocumentVersion`, `CiPipelineRun`, `AuditFinding`, `RoleAppointment`, `ConflictOfInterestDeclaration`, `OrgChartLayout`, `PlatformSettings`, `ReportBuilderBookmark`, `VerificationAuditTrail`

These fall into three categories, and the rebaseline should treat them differently:

| Category | Examples | Assessment |
|----------|----------|------------|
| Intentionally global | `Tenant`, `Role`, `PlatformSettings`, `CertificationScheme` (tenancy via `TenantSchemeEnablement`) | acceptable by design |
| Child-of-tenant-parent (scoped via FK) | `Chapter` (via `courseId`), `Lesson` (via `chapterId`), `ExamAnswer`, `LessonProgress` | acceptable if parent filtering is enforced |
| **Concerning** | `Risk`, `InternalAudit`, `CorrectiveAction`, `AuditFinding`, `ConflictOfInterestDeclaration`, `IdentityVerification`, `Consent`, `VerificationAuditTrail` | governance/ISO records without tenant scoping |

The third group matches the documented `docs/architecture/G3_TENANT_ISOLATION_GAP_REPORT.md` findings G3-C01/C02/C06 (doc UNTRACKED).

## 11. Generated database artifacts — **PARTIALLY VERIFIED**

| Artifact | On disk | Tracking |
|----------|:-------:|----------|
| `migration_lock.toml` | yes | UNTRACKED |
| `packages/database/node_modules/@prisma/client` | yes | UNTRACKED (ignored) |
| `packages/database/node_modules/.prisma` | **no** | — |
| `apps/api/dist/prisma/*` | yes | UNTRACKED (ignored) |

Generated Prisma client appears incompletely installed (no `.prisma` engine folder alongside `@prisma/client`).

---

## Contradictions

1. **Dual schemas** — root 40-model schema vs `packages/database` 109-model multi-schema; both untracked.
2. **Canonical DB package untracked** — ~125 files, 0 tracked, while `.env.example` and docs assume Prisma/Postgres.
3. **Compose vs env** — tracked `docker-compose.yml` provisions the *legacy* DynamoDB/FastAPI stack; tracked `.env.example` describes the *canonical* Postgres stack.
4. **API Prisma source missing** — `prisma.service.ts` and `tenant-prisma.util.ts` absent while tracked files import them.
5. **Tenant field vs enforcement** — 74 models carry `tenantId`; only 63 are enforced; 11 unenforced.
6. **`CertificationScheme` tenancy differs** between canonical (no `tenantId`, uses enablement) and deprecated root schema (has `tenantId`).
7. **Backend "models" are not ORM entities** — Pydantic + DynamoDB, contradicting the Baseline's normalized-Postgres mandate for core entities.
