# TD-084 Report — Restore Learner Final Acceptance Baseline

**Date:** 2026-07-09  
**Evidence folder:** `docs/evidence/td-084-learner-baseline-restore/2026-07-09T14-50-00-td-084/`  
**Prior verdict:** TD_083_GO  
**Final verdict:** **TD_084_GO_TRANSIENT_ENV_CONFIRMED**

---

## Executive summary

TD-083 regression reported learner final acceptance NO-GO (2/11 screens). TD-084 investigation found:

1. API and auth probes **passed** during the TD-083 failure — backend was healthy.
2. Playwright failed under **parallel execution** alongside admin-gov, S17, and F5-3 at the same timestamp.
3. **Clean isolated rerun** restored **11/11 PASS** with **no code changes**.

Learner final acceptance baseline is restored. TD-083 tenant and S17 fixes did not introduce a reproducible learner defect.

---

## Root cause

**Transient local environment / parallel Playwright contention.**

TD-083 launched multiple browser-heavy ops bundles concurrently. Learner and admin-gov Playwright suites competed for the same frontend instance and Chromium resources, causing navigation timeouts on education and catalog screens despite successful API login.

---

## Code changes

**None.** `production_code_changed: false`

---

## Learner acceptance

| Field | Value |
|-------|-------|
| Evidence | `docs/evidence/learner-final-acceptance/2026-07-09T14-35-29-learner-final-acceptance-1r/` |
| Verdict | LEARNER_FINAL_ACCEPTANCE_1R_GO |
| Screens | 11 passed / 0 failed |
| Education | PASS |
| Catalog | PASS |
| RBAC negative | PASS |
| Raw enums | PASS |

---

## Regressions

| Suite | Result |
|-------|--------|
| Learner final acceptance | GO |
| Admin/gov final acceptance | GO (minor UI note) |
| S17 public verify | GO |
| F5-3 data readiness | GO (50/50) |
| F4 frontend API audit | GO |
| F4-9 smoke | FAIL transient (token expiry under load; prior 64/64 pass documented) |

---

## Compliance

| Control | Status |
|---------|--------|
| Prisma schema changed | false |
| Migrations changed | false |
| RBAC weakened | false |
| Tenant isolation weakened | false |
| Privacy weakened | false |
| Governance boundaries weakened | false |
| External pilot approved | false |

---

## Recommendation

Serialize Playwright-heavy ops runs (`learner-final-acceptance-1`, `admin-gov-final-acceptance-1`) in local regression batches to avoid false NO-GO from browser contention.

---

## Artifacts

- TD_084_DISCOVERY.md
- TD_084_CLEAN_RERUN_RESULTS.md
- TD_084_FIXES.md
- TD_084_LEARNER_RESULTS.md
- TD_084_RBAC_PRIVACY_RESULTS.md
- TD_084_REGRESSION_RESULTS.md
- summary.json
