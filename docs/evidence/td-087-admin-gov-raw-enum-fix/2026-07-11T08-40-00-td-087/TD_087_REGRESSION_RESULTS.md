# TD-087 Regression Results

## Individual commands

| Command | Status | Evidence / notes |
|---------|--------|------------------|
| `ops:admin-gov-final-acceptance-1` | **PASS** 15/15 | `docs/evidence/admin-governance-final-acceptance/2026-07-11T08-12-58-admin-gov-final-acceptance-1/` |
| `ops:learner-final-acceptance-1` | **PASS** 11/11 | `LEARNER_FINAL_ACCEPTANCE_1R_GO` |
| `ops:s17-public-verify-browser` | **PASS** | `S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED` |
| `ops:f5-3-data-readiness` | **PASS** 50/50 | `docs/evidence/f5-pilot-readiness/2026-07-11T08-15-23/` |
| `audit:f4-frontend-api` | **PASS** | `docs/evidence/f4-8f-legacy-api-usage-audit/2026-07-11T06-15-19/` |
| `ops:f4-9-smoke` (parallel with S17) | **FAIL** 51/64 | Transient 401 auth — parallel load with S17; **not TD-087 related** |
| `ops:f4-9-smoke` (isolated retry) | **PASS** 64/64 | `docs/evidence/f4-9-faza4-smoke/2026-07-11T06-22-37/` |
| `ops:local-pilot-sequential-regression` | **PASS** 6/6 | `docs/evidence/td-085-sequential-regression/2026-07-11T08-33-15-td-085/` |

## Sequential regression detail

| Step | Status |
|------|--------|
| audit:f4-frontend-api | PASS |
| ops:f5-3-data-readiness | PASS |
| ops:s17-public-verify-browser | PASS |
| ops:admin-gov-final-acceptance-1 | PASS 15/15 |
| ops:learner-final-acceptance-1 | PASS |
| ops:f4-9-smoke | PASS 64/64 |

**Verdict:** `TD_085_GO_LOCAL_BASELINE_CONFIRMED` (533s)

## Skipped / transient notes

- **F4-9 first parallel run:** Not counted as PASS — failed 51/64 on HTTP 401 during concurrent S17 browser suite. Isolated rerun and sequential run both PASS. Classified as transient auth contention, not TD-087 regression.

## Governance guard

| Flag | Value |
|------|-------|
| rbac_weakened | false |
| tenant_isolation_weakened | false |
| privacy_weakened | false |
| governance_boundaries_weakened | false |
| prisma_schema_changed | false |
| migrations_changed | false |
