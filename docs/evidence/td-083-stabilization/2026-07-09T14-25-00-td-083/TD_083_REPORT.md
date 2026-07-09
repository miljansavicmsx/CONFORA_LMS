# TD-083 Report — Tenant Negative Response and S17 Fixture Stabilization

**Date:** 2026-07-09  
**Evidence folder:** `docs/evidence/td-083-stabilization/2026-07-09T14-25-00-td-083/`  
**Prior verdict:** TD_082_LIVE_SEED_VERIFY_1_GO_WITH_MINOR_LOCAL_STATE_NOTE  
**Final verdict:** **TD_083_GO**

---

## Executive summary

TD-083 resolves two minor stabilization issues identified during TD-082 live seed verification:

1. **Wrong-tenant wallet probe** no longer returns HTTP 500. It now returns **403 Forbidden** (`Tenant mismatch.`) with zero items and no certificate leakage.
2. **S17 public verification** is repeatable locally via env hash, DB auto-discovery, or a clear `PRECONDITION_FAILED_FIXTURE_MISSING` exit before browser assertions.

No Prisma schema or migration changes. RBAC, tenant isolation, privacy, and public verification boundaries are preserved.

---

## Objectives

| Objective | Status |
|-----------|--------|
| Wrong-tenant safe non-500 response | ✅ 403 |
| No default-tenant certificate leakage | ✅ |
| S17 env hash resolution | ✅ |
| S17 DB auto-discovery / precondition error | ✅ |
| Unit + live probe tests | ✅ |
| Regression (F5-3, F4 audit, F4-9, Admin/Gov, S17) | ✅ (learner UI out of scope) |

---

## Wrong-tenant fix

### Root cause
Prisma tenant extension blocked `User.findUnique` when JWT `tenant_id` differed from DB `tenant_id`, producing unhandled `TenantAccessViolationError` → 500.

### Solution
- `resolveActorDbAccess()` — centralized holder resolution with explicit 403 for tenant mismatch.
- `TenantAccessViolationFilter` — global mapping of stray tenant violations to 403.
- Prisma extension — skip ownership validation on `User` `findUnique` for identity resolution; app-level check still blocks wallet access.

### Chosen behavior
**403** `Tenant mismatch.` on `GET /v1/me/certificates` and recert holder paths when JWT tenant ≠ DB tenant.

---

## S17 fixture fix

### Root cause
Invalid SQL enum `'VALID'` in hash discovery query; runner proceeded to misleading browser failures.

### Solution
- `scripts/ops/public-verify-hash.mjs` — env preference, DB probe (`ACTIVE`/`ISSUED`), API validation, structured precondition errors.
- `run-s17-public-verify-browser.mjs` — integrated resolver; skips Playwright on missing fixture.

### Live result
`verify_hash_source=env`, `valid_lookup_status=PASS`, `S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED`.

---

## Files changed

### API
- `apps/api/src/auth/resolve-db-user.ts` — returns `tenantId` from resolution
- `apps/api/src/auth/actor-db-access.ts` — new shared holder access helper
- `apps/api/src/auth/actor-db-access.spec.ts`
- `apps/api/src/auth/resolve-db-user.spec.ts`
- `apps/api/src/cert-wallet/me-certificates.service.ts` — uses `resolveActorDbAccess`
- `apps/api/src/cert-governance/recertification.service.ts` — uses `resolveActorDbAccess`
- `apps/api/src/prisma/tenant-access-violation.filter.ts` — new global filter
- `apps/api/src/app.module.ts` — registers filter
- `apps/api/src/prisma/prisma-tenant-extension.ts` — User findUnique identity bypass
- `apps/api/src/cert-wallet/me-certificates.service.spec.ts`
- `apps/api/test/td-082-pilot-certificant-wallet.e2e-spec.ts`

### Ops / scripts
- `scripts/ops/public-verify-hash.mjs` — new
- `scripts/ops/public-verify-hash.test.mjs` — new
- `scripts/ops/run-s17-public-verify-browser.mjs`
- `scripts/ops/run-td-082-live-seed-verify-api.mjs`
- `scripts/ops/run-td-083-tenant-negative-api.mjs` — new
- `package.json` — `ops:td-083-tenant-negative-api` script

---

## Compliance attestation

| Control | Changed / weakened |
|---------|-------------------|
| Prisma schema | false |
| Migrations | false |
| RBAC | not weakened |
| Tenant isolation | not weakened |
| Privacy | not weakened |
| Public verification | not weakened |
| External pilot approved | false |
| Staging/production ready | not claimed |

---

## Artifacts

| File | Purpose |
|------|---------|
| TD_083_DISCOVERY.md | Root cause analysis |
| TD_083_TENANT_NEGATIVE_RESULTS.md | Live wrong-tenant probes |
| TD_083_S17_FIXTURE_RESULTS.md | S17 hash/fixture verification |
| TD_083_PRIVACY_RBAC_RESULTS.md | RBAC + privacy matrix |
| TD_083_TEST_RESULTS.md | Unit + probe tests |
| TD_083_REGRESSION_RESULTS.md | Full regression suite |
| summary.json | Machine-readable verdict |

---

## Recommended follow-up (out of scope)

- Learner final acceptance education/catalog UI defects.
- S17 nested `ops:public-ux-1r3` and `ops:cert-ops-1r` bundle failures.
