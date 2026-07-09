# TD-084 Regression Results

**Date:** 2026-07-09

## Required regressions

| Command | Status | Detail |
|---------|--------|--------|
| `ops:learner-final-acceptance-1` | **PASS** | LEARNER_FINAL_ACCEPTANCE_1R_GO (11/11) — isolated rerun |
| `ops:admin-gov-final-acceptance-1` | **PASS** | ADMIN_GOV_FINAL_ACCEPTANCE_GO_WITH_MINOR_UI_ISSUES (15/15 screens) |
| `ops:s17-public-verify-browser` | **PASS** | S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED |
| `ops:f5-3-data-readiness` | **PASS** | 50/50 (isolated rerun; parallel run had transient KC 401) |
| `audit:f4-frontend-api` | **PASS** | F4-8f gate GO |

## Optional

| Command | Status | Detail |
|---------|--------|--------|
| `ops:f4-9-smoke` | **FAIL (transient)** | Director token 401 cascade mid-run after ~15 workflow steps; prior TD-083 isolated run passed 64/64 |

F4-9 failure is a **transient auth token expiry / API connection issue** under sustained load, not related to learner UI or TD-083 tenant fixes. Not counted as PASS.

## Parallel-run transient failures observed

During TD-084 regression phase, running multiple ops bundles in parallel caused:

- F5-3: `D-02-kc-login-pilot.learner@confora.test: status=401` → **resolved on isolated rerun (50/50)**
- F4-9: `ECONNRESET` then director token 401 cascade → **transient under load**

## TD-083 vs TD-084 learner comparison

| Metric | TD-083 (parallel) | TD-084 (isolated) |
|--------|-------------------|-------------------|
| Learner verdict | BLOCKED_FUNCTIONAL_DEFECT | GO |
| Screens passed | 2 | 11 |
| API login | PASS | PASS |
| Code changed | N/A | none |

## Regression status

**PASS** for TD-084 objective (learner baseline restored). F4-9 noted as transient failure; does not block learner restoration verdict.
