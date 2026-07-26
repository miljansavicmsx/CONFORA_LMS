# Audit and Evidence Inventory

**Summary: the canonical audit ledger is well designed and largely implemented, but the implementation is either untracked or present only as compiled `dist/` output. The tracked tree cannot rebuild it.**

---

## 1. Canonical audit ledger — **PARTIALLY VERIFIED**

Policy is unambiguous. `docs/architecture/G5_LEGACY_AUDIT_DEPRECATION_PLAN.md` (UNTRACKED):

> **Do not delete legacy audit code.** **Do not extend legacy audit paths for new canonical features.** **All new compliance-relevant events MUST use PostgreSQL `audit."AuditEvent"` via `AuditLedgerService` or `@confora/audit-client`.**

| Path | Tracking | Role |
|------|----------|------|
| `packages/database/prisma/schema.prisma` (`model AuditEvent`) | UNTRACKED | Postgres system of record |
| `packages/database/prisma/migrations/20260218100000_init/migration.sql` | UNTRACKED | creates `audit."AuditEvent"` |
| `packages/database/prisma/migrations/20260218100001_audit_append_only_and_rls/migration.sql` | UNTRACKED | append-only triggers |
| `apps/api/src/audit/**` | **NOT FOUND on disk; never in git history** | documented Nest writer |
| `apps/api/dist/audit/audit-ledger.service.js` | UNTRACKED | compiled ledger, still present |
| `backend/services/audit_service.py` | UNTRACKED | legacy DynamoDB writer |

```prisma
model AuditEvent {
  id        BigInt  @id @default(autoincrement())
  tenantId  String? @map("tenant_id") @db.Uuid
  ...
  prevHash  String  @map("prev_hash")
  thisHash  String  @map("this_hash")
  @@schema("audit")
}
```

Legacy self-deprecates in its own docstring:

```python
""".. deprecated:: G5
   DEPRECATED — do not extend. Canonical audit ledger is PostgreSQL
   ``audit.AuditEvent`` via Nest ``AuditLedgerService`` / ``@confora/audit-client``."""
```

**CONTRADICTED sub-finding.** A tracked file imports the missing audit module:

```ts
import { auditActorFromUser } from '../audit/audit-actor.util';
import { AuditLedgerService } from '../audit/audit-ledger.service';
```
(`apps/api/src/cert-wallet/me-certificates.service.ts` — TRACKED; `apps/api/src/audit/` — MISSING)

## 2. Audit clients — **PARTIALLY VERIFIED**

| Path | Tracking |
|------|----------|
| `packages/audit-client/src/index.ts` | **TRACKED** |
| `packages/audit-client/src/append.test.ts` | **TRACKED** |
| `packages/shared-kernel/src/audit-context.ts` | **TRACKED** (actor type only) |
| `apps/api/package.json` → `"@confora/audit-client": "workspace:*"` | **TRACKED** |
| `packages/audit/README.md` (stub "migrate here") | UNTRACKED |

Public API: `auditLedgerAppendSchema` (Zod), `createAuditClient(config)` returning `append()` which POSTs to `${baseUrl}/v1/audit`, plus `AuditLedgerAppendInput` and deprecated aliases.

**Finding: `createAuditClient(` has zero callers** across apps, packages, scripts, frontend and backend. The package's primary runtime API is unused. The Nest dist controller imports only the Zod schema for DTO validation; the tracked wallet service calls `AuditLedgerService.log` in-process instead.

## 3. Audit event definitions — **PARTIALLY VERIFIED**

| Source | Tracking | Nature |
|--------|----------|--------|
| `backend/services/audit_service.py` frozensets (`CERTIFICATE_ISSUED`, `SOD_HARD_BLOCK`, …) | UNTRACKED | string catalogs by domain |
| `backend/models/audit_event.py` (`AuditCategory`, severity/outcome) | UNTRACKED | DynamoDB shape |
| `apps/api/dist/**/*-audit.constants.js` (e.g. `APPEAL_SUBMITTED`) | UNTRACKED | per-module constants |
| `@confora/audit-client` | TRACKED | `action: z.string()` — **no enum catalog** |
| Single shared `AuditEventType` enum | — | **NOT FOUND** |

Event types are free-form strings. There is no tracked, authoritative event catalog, so no mechanism prevents divergent action names.

## 4. Append-only, hash chain, RLS, verification — **PARTIALLY VERIFIED**

```sql
CREATE OR REPLACE FUNCTION audit.forbid_audit_event_mutation()
  ... RAISE EXCEPTION 'audit."AuditEvent" is append-only (UPDATE and DELETE are forbidden)';
CREATE TRIGGER trg_audit_event_forbid_update BEFORE UPDATE ON audit."AuditEvent" ...
CREATE TRIGGER trg_audit_event_forbid_delete BEFORE DELETE ON audit."AuditEvent" ...
```
(`packages/database/prisma/migrations/20260218100001_audit_append_only_and_rls/migration.sql` lines 1–21 — UNTRACKED)

| Control | Implementation | Assessment |
|---------|----------------|------------|
| Append-only UPDATE/DELETE block | DB triggers | designed; **live application unverifiable from git** |
| Hash chain | `SHA-256(prevHash + canonicalJson)`, genesis `'0'×64` (`apps/api/dist/audit/audit-hash.js`) | dist only, **source missing** |
| Daily integrity verification | `AuditIntegrityScheduler.verifyLast24Hours`, `@Cron(EVERY_DAY_AT_1AM)` → `AUDIT_CHAIN_BROKEN` alert | dist only |
| Immutability tests | `packages/database/test/audit-immutability.test.ts`, `audit-chain-integrity.test.ts` | UNTRACKED |
| **RLS on `AuditEvent`** | — | **NOT FOUND** |

**Naming defect (VERIFIED).** The migration named `audit_append_only_and_rls` enables RLS on `auth.users`, enrollments, certificates and appeals — but contains **no** `ALTER TABLE audit."AuditEvent" ENABLE ROW LEVEL SECURITY`. The audit table gets append-only triggers, not RLS. The name overstates what was delivered.

**Hash format incompatibility (VERIFIED).** Nest computes `sha256(prev + canonicalJson)`; the legacy DynamoDB integrity service computes `sha256(prev + '|' + payloadHash)`. The two chains are not interoperable, so legacy audit history cannot be verified under the canonical algorithm.

## 5. Audit redaction — **PARTIALLY VERIFIED (weak)**

| Mechanism | Path | Scope |
|-----------|------|-------|
| Skip `password` / `refresh_token` in body pick | `apps/api/dist/audit/auditable.interceptor.js` (UNTRACKED) | decorator allowlist only |
| `oldValue`/`newValue` stored via `jsonish` | dist ledger | **no general PII redaction observed** |
| `strip_sensitive_metadata` (`secret|password|token|…`) | `backend/services/audit_integrity_service.py` (UNTRACKED) | legacy only |
| Metadata strip on read | `backend/services/query_visibility_service.py` lines 330–335 (UNTRACKED) | read path |
| IP/value redaction | `backend/services/admin_sys_inspection_service.py` (UNTRACKED) | inspection UI |

**Write-path PII redaction for the canonical ledger is essentially absent.** Given that `oldValue`/`newValue` capture arbitrary entity state, this is a GDPR-relevant gap for a ledger that is deliberately immutable — redaction after the fact is blocked by the append-only triggers.

## 6. Evidence folders — **VERIFIED**

- **72** top-level categories under `docs/evidence/` on disk
- **1087** files tracked under `docs/evidence/` — i.e. **100% of all tracked `docs/`**

Largest categories by on-disk file count:

| Category | ~files | Category | ~files |
|----------|-------:|----------|-------:|
| `p1-b10-4-certification-decision-smoke` | 16442 | `f5-ui` | 11670 |
| `ui-shell` | 7213 | `local-uat` | 6913 |
| `p1-b11-4-certificate-issuance-smoke` | 6112 | `f5-pilot-readiness` | 3444 |
| `f4-8a-frontend-api-inventory` | 2292 | `f4-8f-legacy-api-usage-audit` | 2250 |
| `repo-health` | 585 | `external-pilot-technical-readiness` | 444 |
| `admin-governance-final-acceptance` | 392 | `learner-final-acceptance` | 243 |
| `education-mvp` | 205 | `legal-gdpr` | 124 |

## 7. Completion and acceptance reports — **VERIFIED as artifacts**

| Evidence | Verdict |
|----------|---------|
| `docs/evidence/learner-final-acceptance/.../LEARNER_FINAL_ACCEPTANCE_1_REPORT.md` | `LEARNER_FINAL_ACCEPTANCE_GO` |
| `docs/evidence/admin-governance-final-acceptance/...` | `ADMIN_GOV_FINAL_ACCEPTANCE_GO` |
| `docs/evidence/local-pilot-final-rollup/2026-07-08T22-22-01-.../summary.json` | F4-9/F5/admin/learner GO rollup |
| `docs/evidence/f5-pilot-readiness/.../staff-mfa-3...` | `STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF` |
| `docs/evidence/external-pilot-technical-readiness/.../a02-r3...` | `READY_FOR_ACTUAL_SECURITY_DELEGATE_SIGNOFF` |
| `docs/evidence/legal-gdpr/.../dpo-legal-*` | templates / **NOT_SIGNED** / pending |

**These record past gate outcomes. They are not evidence that the current tracked tree is buildable, deployable, or DB-enforced.** Several explicitly remain pending a security delegate or DPO signature.

## 8. Repository-health reports — **VERIFIED**

- **48** wave directories under `docs/evidence/repo-health/`
- Wave IDs in order: `1`–`43a`, `44`, `45`, `46`, `47`, `48a` (i.e. 1–42, 43a, 44–47, 48a)
- Audit-relevant waves: **12** (config/SDK), **14–15** (audit-client review + import), **32** (MJML), **39–41** (AI prompts), **42/43a** (apps-api AI source), **45–46** (ai-client), **47** (rebaseline), **48a** (gitignore hygiene)
- **RH48A files on disk are UNTRACKED** — the newest wave is not yet committed

---

## Audit posture

| Layer | State |
|-------|-------|
| Documented canonical | Postgres `audit."AuditEvent"` + Nest `AuditLedgerService` — docs UNTRACKED |
| Tracked implementation | Thin: `@confora/audit-client`, `AuditActorContext`, one service importing a missing module |
| On-disk untracked | Schema, migrations, tests, Nest `dist` audit module, full FastAPI audit stack |
| Critical gap | `apps/api/src/audit/` **source missing** — ledger not rebuildable from git |
| DB controls | Append-only triggers designed; **no RLS on AuditEvent** |
| PII redaction | Not enforced on canonical write path |
| Evidence corpus | Large and well organised (72 categories, 48 RH waves) |

## Contradictions and gaps

1. Canonical Nest audit **source absent** while tracked code imports it and untracked `dist/` still holds the implementation.
2. Migration named `..._append_only_and_rls` does **not** apply RLS to `AuditEvent`.
3. Two ledgers on disk: Postgres (intended) and DynamoDB (deprecated but coded).
4. **Registry vs G5 conflict** — G5 says use `@confora/audit-client`; `CANONICAL_COMPONENT_REGISTRY.md` marks it **Legacy** and points to `packages/audit`, which is a README stub.
5. `createAuditClient` never called.
6. Incompatible hash-chain formats between canonical and legacy.
7. No PII redaction on the immutable write path.
8. Enforcement code untracked → neither git history nor CI can demonstrate append-only or chain integrity from a clean clone.
9. RH48A evidence exists on disk but is untracked.
