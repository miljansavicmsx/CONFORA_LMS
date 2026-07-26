# Tenant Isolation Inventory

Multi-tenant isolation is a non-negotiable in `docs/MULTI_TENANCY_STANDARD.md` (UNTRACKED) and the Baseline. This file records what is actually enforced.

**Summary: isolation is PARTIALLY VERIFIED with four documented, code-level bypass paths. The Nest enforcement layer is tracked but non-functional because its dependencies are missing.**

---

## 1. Tenant context propagation — **PARTIALLY VERIFIED / CONTRADICTED**

| Mechanism | Path | Status |
|-----------|------|--------|
| JWT claim parsing | `packages/shared-kernel/src/tenant.ts` (`parseTenantClaim`) | **TRACKED** |
| `TenantContext` interface incl. `isPlatformScope` | same file | **TRACKED** |
| Async-local-storage accessor `getActiveTenantIdForPrisma` | imported from `../tenant/tenant-context.store` | **IMPORT TARGET NOT FOUND** |
| Prisma tenant extension | `apps/api/src/prisma/prisma-tenant-extension.ts` | **TRACKED** |
| FastAPI per-call tenant assertion | `backend/core/tenant_guard.py` | UNTRACKED |
| FastAPI tenant scope helpers | `backend/core/tenant_scope.py` | UNTRACKED |

```ts
const tenantId = getActiveTenantIdForPrisma();
if (!tenantId || !TENANT_SCOPED_PRISMA_MODELS.has(model)) {
  return query(args);
}
```
(`apps/api/src/prisma/prisma-tenant-extension.ts` lines 133–137 — TRACKED)

Both symbols on that line come from files that **do not exist** (`../tenant/tenant-context.store`, `./tenant-prisma.util`). The tracked enforcement layer cannot execute.

FastAPI has **no global async context**; isolation is opt-in per endpoint and per service call.

## 2. Tenant guards and query filters — **PARTIALLY VERIFIED**

| Control | Path | Status |
|---------|------|--------|
| Prisma query extension (read/create tenant merge) | `apps/api/src/prisma/prisma-tenant-extension.ts` | TRACKED |
| 403 filter for tenant violations | `apps/api/src/prisma/tenant-access-violation.filter.ts` | TRACKED |
| Model allowlist + merge helpers | `apps/api/src/prisma/tenant-prisma.util.ts` | **NOT FOUND** |
| `assert_same_tenant` | `backend/core/tenant_guard.py` | UNTRACKED |
| Callers (support, certification, finance_admin, reports, authorization_service) | `backend/**` | UNTRACKED |
| Row-Level Security | `packages/database/prisma/migrations/20260218100001_.../migration.sql` | UNTRACKED |

RLS **is** enabled by that migration on `auth.users`, enrollments, certificates and appeals (lines 53–64) — but the migration is untracked and its application to any live database cannot be verified from git.

## 3. Known bypass paths — **VERIFIED (all four are in code, not speculation)**

### Bypass 1 — Prisma `update`/`delete` skip tenant merge (TRACKED code)

```ts
if (TENANT_WRITE_WHERE_OPERATIONS.has(operation)) {
  ...
  // Prisma update/delete require WhereUniqueInput — cannot merge tenantId via AND.
  if (operation === 'update' || operation === 'delete') {
    return a;
  }
```
(`apps/api/src/prisma/prisma-tenant-extension.ts` lines 38–44)

A caller holding a record ID can update or delete across tenants unless the service layer checks ownership independently. This is the most serious isolation finding in tracked code.

### Bypass 2 — extension no-ops when tenant context is unset (TRACKED code)

Line 135: `if (!tenantId || !TENANT_SCOPED_PRISMA_MODELS.has(model)) return query(args);` — an unset ALS context silently disables all filtering. This is **fail-open**, not fail-closed.

### Bypass 3 — FastAPI allows when resource tenant is missing (UNTRACKED code)

```python
"""
sys_admin (u actor_roles) ima cross-tenant pregled.
Nedostajući resource tenant: ne blokira (nasljeđeno ponašanje / legacy redovi).
"""
if "sys_admin" in roles:
    return
```
(`backend/core/tenant_guard.py` lines 17–24)

Two bypasses in one function: `sys_admin` cross-tenant access, and legacy rows with a null tenant are allowed through.

### Bypass 4 — untenanted courses treated as globally visible (UNTRACKED code)

`backend/core/tenant_scope.py` — `course_visible_to_viewer_tenant` treats courses without `tenantId` as global.

### Additional exception (documented, narrow)

```ts
function shouldSkipTenantOwnershipValidation(model: string, operation: string): boolean {
  // Auth identity resolution must read the user's true tenant_id before application-level checks.
  return model === 'User' && TENANT_UNIQUE_READ_OPERATIONS.has(operation);
}
```
(lines 81–84 — TRACKED). This one is justified and correctly commented.

## 4. Schema-level gaps

From `database_persistence_inventory.md`:

- **11 models** carry `tenantId` but are absent from `TENANT_SCOPED_PRISMA_MODELS` — no runtime filtering despite having the column.
- **Governance/ISO models without any tenant column:** `Risk`, `InternalAudit`, `CorrectiveAction`, `AuditFinding`, `ConflictOfInterestDeclaration`, `IdentityVerification`, `Consent`, `VerificationAuditTrail`.

This matches `docs/architecture/G3_TENANT_ISOLATION_GAP_REPORT.md` (UNTRACKED):

```text
| G3-C01 | Schema | `Risk`, `InternalAudit`, ... have **no `tenantId`**
| G3-C02 | API    | `GovernanceService` lists/creates ... **without tenant filter**
| G3-C06 | Prisma | Gov models **not** in `TENANT_SCOPED_PRISMA_MODELS`
```

**Classification note:** G3-C01 and G3-C06 are **VERIFIED** against the current schema and runtime set. G3-C02 is **ASSUMED** — `governance.service.ts` does not exist on disk, so the API-level claim cannot be re-verified.

## 5. Tenant isolation tests — **PARTIALLY VERIFIED**

| Artifact | Tracking | Coverage |
|----------|----------|----------|
| `apps/api/src/auth/actor-db-access.spec.ts` | **TRACKED** | JWT/DB tenant alignment, wrong-tenant |
| `apps/api/test/td-082-pilot-certificant-wallet.e2e-spec.ts` | **TRACKED** | "wrong-tenant JWT returns 403 without wallet leakage" |
| `packages/shared-kernel/src/tenant.test.ts` | **TRACKED** | `parseTenantClaim` units |
| `scripts/ops/run-td-083-tenant-negative-api.mjs` | **TRACKED** | live `WRONG_TENANT` / `NO_TENANT` probes |
| `backend/tests/test_tenant_*.py`, `test_dashboard_tenant_scope.py` | UNTRACKED | broader FastAPI scope |

Tracked coverage exists but is narrow: it covers **read** paths and JWT alignment. **No tracked test covers Bypass 1 (cross-tenant update/delete) or Bypass 2 (unset context fail-open).** The `.cursor/rules/07-testing.mdc` requirement that tenant isolation be tested is therefore only partially satisfied, and the untested areas are precisely the known bypasses.

---

## Tenant isolation posture

| Layer | State |
|-------|-------|
| Standard documented | Yes (`docs/MULTI_TENANCY_STANDARD.md`, UNTRACKED, "non-negotiable") |
| Schema support | 74/109 Prisma models carry `tenantId` |
| Runtime enforcement (Nest) | Tracked but **non-executable** (missing deps); fail-open by design when context unset |
| Runtime enforcement (FastAPI) | Real but opt-in, untracked, with `sys_admin` and null-tenant bypasses |
| DB-level RLS | Defined in an untracked migration; application unverifiable from git |
| Test coverage | Narrow; known bypasses untested |

**Do not record tenant isolation as an implemented control.** It is PARTIALLY VERIFIED with identified, code-level gaps.
