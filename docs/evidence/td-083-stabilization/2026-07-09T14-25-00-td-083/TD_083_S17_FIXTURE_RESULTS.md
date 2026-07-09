# TD-083 S17 Fixture Results

**Run:** 2026-07-09T14:10:00 (ops:s17-public-verify-browser)  
**Evidence:** docs/evidence/f5-pilot-readiness/2026-07-09T14-10-00-s17-public-verify-browser/

## Environment

```
POSTGRES_DOCKER_CONTAINER=docker-postgres-1
POSTGRES_DB=confora
PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH=cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945
```

## Hash resolution

| Field | Value |
|-------|-------|
| verify_hash_used | `cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945` |
| verify_hash_source | `env` |
| fixture_precondition_error | null |
| fixture_precondition_detail | null |

## S17 core checks

| Check | Status |
|-------|--------|
| public_route_no_auth_status | PASS |
| valid_lookup_status | PASS |
| invalid_lookup_status | PASS |
| read_only_status | PASS |
| pii_minimization_status | PASS |
| private_dashboard_data_exposed | false |
| final_verdict | S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED |

## Fixture stabilization changes

1. **`scripts/ops/public-verify-hash.mjs`** — shared resolver:
   - Prefers `PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH` when API probe returns `valid=true`.
   - Falls back to DB candidates (`ACTIVE`/`ISSUED` only — removed invalid `VALID` enum).
   - Returns `PRECONDITION_FAILED_FIXTURE_MISSING` with detail when no valid hash found.

2. **`scripts/ops/run-s17-public-verify-browser.mjs`** — uses resolver; skips Playwright on precondition failure.

## Auto-discovery (no env var)

When `PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH` is unset:
- Queries `cert.certificates` for `verification_hash` rows.
- Probes each candidate against `GET /api/public/verify/{hash}`.
- Uses first hash returning `valid=true`, or exits with clear precondition error.

Unit tests in `scripts/ops/public-verify-hash.test.mjs` cover env, DB list, and missing-fixture paths.

## Nested runner notes (out of TD-083 scope)

Embedded checks `ops_public_ux_1r3_status` and `cert_ops_1r_status` remain FAIL in S17 bundle; core public verification browser gate passes independently.
