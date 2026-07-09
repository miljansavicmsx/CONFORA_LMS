# TD-083 Regression Results

**Date:** 2026-07-09

## Required regression runs

| Command | Verdict | Detail |
|---------|---------|--------|
| `ops:s17-public-verify-browser` | **GO** | S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED |
| `ops:learner-final-acceptance-1` | **NO-GO** | LEARNER_FINAL_ACCEPTANCE_1R_BLOCKED_FUNCTIONAL_DEFECT (education/catalog UI — pre-existing, unrelated to TD-083) |
| `ops:admin-gov-final-acceptance-1` | **GO** | ADMIN_GOV_FINAL_ACCEPTANCE_GO (15/15) |
| `ops:f5-3-data-readiness` | **GO** | 50/50 (wrong-tenant /auth/me userId restored) |
| `audit:f4-frontend-api` | **GO** | F4-8f gate passed |
| `ops:f4-9-smoke` | **GO** | 64/64 |

## TD-083-specific regressions

| Area | Before TD-083 | After TD-083 |
|------|---------------|--------------|
| Wrong-tenant wallet | 500 | 403 (fixed) |
| Wrong-tenant /auth/me | 403 (regression during fix) | 200 with userId (fixed via User findUnique skip) |
| F5-3 D-04 wrong-tenant userId | null (FAIL) | resolved (PASS) |
| S17 valid_lookup | FAIL (fixture) | PASS |
| F5-3 overall | 48/50 | 50/50 |

## Out-of-scope failures (not blocking TD-083)

- **Learner final acceptance:** education_screen, catalog_screen, rbac_negative UI failures — functional UI defects outside tenant/S17 scope.
- **S17 nested:** `ops_public_ux_1r3_status=FAIL`, `cert_ops_1r_status=FAIL` — separate ops bundles; core S17 browser gate passes.

## Regression status

**PASS** for TD-083 stabilization objectives (tenant negative + S17 fixture).  
Learner UI acceptance remains a separate tracked defect.
