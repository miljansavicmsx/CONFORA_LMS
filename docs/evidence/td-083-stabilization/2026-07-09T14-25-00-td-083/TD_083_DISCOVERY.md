# TD-083 Discovery

**Task:** Tenant negative response and S17 fixture stabilization  
**Date:** 2026-07-09  
**Prior verdict:** TD_082_LIVE_SEED_VERIFY_1_GO_WITH_MINOR_LOCAL_STATE_NOTE

## 1. Wrong-tenant HTTP 500 path

### Symptom (TD-082)
`GET /v1/me/certificates` for `pilot.wrong-tenant@confora.test` returned **HTTP 500** with zero items (no data leakage, but unsafe error surface).

### Root cause
1. JWT carries `tenant_id=11111111-1111-4111-8111-111111111111` while DB user lives in `00000000-0000-4000-8000-000000000001`.
2. `MeCertificatesService.resolveWalletAccess()` performed a second `user.findUnique` selecting `tenantId`.
3. Prisma tenant extension enforced cross-tenant read on `User` → threw `TenantAccessViolationError: Cross-tenant findUnique denied`.
4. Error was unhandled → Nest returned **500** with internal stack trace risk.

### Holder resolution flow (before fix)
```
JWT actor → resolveAuthUserId (sub/email) → userId
         → user.findUnique({ select: tenantId })  ← tenant extension blocks wrong JWT tenant
         → TenantAccessViolationError → 500
```

### Chosen behavior (after fix)
| Case | Endpoint | Response |
|------|----------|----------|
| Wrong-tenant JWT vs DB tenant | `GET /v1/me/certificates`, recert holder resolution | **403** `Tenant mismatch.` |
| Missing tenant claim | wallet / recert | **403** `Missing tenant_id claim` |
| Anonymous | wallet | **401** |
| Identity resolution (`/auth/me`) | auth | **200** with resolved DB `userId` (identity allowed; wallet still blocked) |

Implementation:
- `resolveActorDbAccess()` centralizes holder resolution and maps expected violations to `ForbiddenException`.
- `TenantAccessViolationFilter` maps stray `TenantAccessViolationError` → **403** (no stack trace).
- Prisma extension skips tenant ownership validation on `User` `findUnique`/`findUniqueOrThrow` so identity resolution can read true DB tenant before app-level checks.

## 2. S17 public verification fixture

### Symptom (TD-082)
`valid_lookup_status` failed when `PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH` was unset or DB discovery failed silently.

### Root causes
1. `discoverLiveVerifyHash()` SQL used invalid enum `'VALID'` in `status IN ('ACTIVE','ISSUED','VALID')` → PostgreSQL error → null hash.
2. Runner fell through to misleading browser assertion failures instead of clear precondition exit.

### Fixture sources
| Source | Hash | Notes |
|--------|------|-------|
| Env var | `cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945` | TD-082 seeded cert; API returns `valid=true` |
| DB auto-discovery | `cert.certificates.verification_hash` where `status IN ('ACTIVE','ISSUED')` | Probed via `GET /api/public/verify/{hash}` |
| Missing fixture | — | Exit with `PRECONDITION_FAILED_FIXTURE_MISSING` before Playwright |

### Shared module
`scripts/ops/public-verify-hash.mjs` — `resolvePublicVerifyHash()` with env preference, DB candidate list, API probe, structured precondition errors.

## 3. Files inspected

| Area | Path |
|------|------|
| Wallet service | `apps/api/src/cert-wallet/me-certificates.service.ts` |
| Recert holder | `apps/api/src/cert-governance/recertification.service.ts` |
| Auth resolution | `apps/api/src/auth/resolve-db-user.ts`, `actor-db-access.ts` |
| Tenant guard | `apps/api/src/prisma/prisma-tenant-extension.ts`, `tenant-access-violation.filter.ts` |
| S17 runner | `scripts/ops/run-s17-public-verify-browser.mjs` |
| Hash resolver | `scripts/ops/public-verify-hash.mjs` |
| TD-083 probes | `scripts/ops/run-td-083-tenant-negative-api.mjs` |

## 4. Constraints confirmed

- No Prisma schema or migration changes.
- RBAC, tenant isolation, and public/private boundaries preserved.
- Public verification remains read-only and unauthenticated.
