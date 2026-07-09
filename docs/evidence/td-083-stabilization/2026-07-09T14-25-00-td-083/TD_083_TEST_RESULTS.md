# TD-083 Test Results

**Date:** 2026-07-09

## Unit tests

### API (Jest)

| Suite | Tests | Result |
|-------|-------|--------|
| `src/auth/actor-db-access.spec.ts` | 3 | PASS |
| `src/auth/resolve-db-user.spec.ts` | 3 | PASS |
| `src/cert-wallet/me-certificates.service.spec.ts` | 7 | PASS |

**Total:** 13/13 passed

### Ops scripts (node:test)

| Suite | Tests | Result |
|-------|-------|--------|
| `scripts/ops/public-verify-hash.test.mjs` | 4 | PASS |

Covers:
- 64-char hex validation
- DB query uses `ACTIVE`/`ISSUED` only (no invalid `VALID` enum)
- Env hash resolution when API probe passes
- `PRECONDITION_FAILED_FIXTURE_MISSING` when fixture absent

## E2E

| Suite | Case | Result |
|-------|------|--------|
| `apps/api/test/td-082-pilot-certificant-wallet.e2e-spec.ts` | wrong-tenant wallet returns 403 | updated |

## Live API probes

`ops:td-083-tenant-negative-api` — **6/6 PASS**

| Probe | Result |
|-------|--------|
| anonymous_denied | PASS |
| no_tenant_denied | PASS |
| wrong_tenant_safe_response | PASS |
| wrong_tenant_no_leakage | PASS |
| other_candidate_scope | PASS |
| privacy_no_forbidden_keys | PASS |

## S17 hash resolution (live)

With env hash set: `verify_hash_source=env`, `valid_lookup_status=PASS`.
