# EXAM-REG-1-E2E-AUTH-RECOVERY Report

| Field | Value |
|-------|-------|
| Evidence | `docs/evidence/exam-registration/2026-07-04T20-59-06-exam-reg-1-e2e-auth-recovery/` |
| Prior slice | `docs/evidence/exam-registration/2026-07-04T19-24-05-exam-reg-1` |
| Verdict | `EXAM_REG_1_E2E_CONFIRMED` |

## Root cause

Playwright reused Vite on port 3001 without `VITE_AUTH_PROVIDER=nest`. Login form posted to legacy FastAPI (unavailable locally), causing 90s dashboard redirect timeout — not exam-registration business logic.

## Auth recovery actions

1. Added `scripts/ops/local-stack-readiness.mjs` — PG/KC/API/health/auth probes before Playwright
2. Added `scripts/ops/ensure-pilot-frontend-env.mjs` — writes `frontend-app/.env.local` for local dev Vite
3. Updated `playwright.config.ts` — pilot E2E on port 3011 with Nest auth env via webServer
4. Added `frontend-app/e2e/pilot-login.ts` — fail-fast login helper (test-only)

## Stack & auth

| Probe | Status |
|-------|--------|
| Keycloak | HEALTHY |
| Learner auth | PASS |
| API token | PASS |
| Playwright login | PASS |

## Playwright

| Spec | Status |
|------|--------|
| exam-reg-1.spec.ts | PASS |
| cert-eligibility-ux-1.spec.ts | PASS |

## Live browser confirmation (exam-reg-1)

- Login: PASS
- /dashboard/exams/register sections A/B/C: CONFIRMED
- Boundary notice: CONFIRMED
- Duplicate registration protection: CONFIRMED
- RBAC staff route denial: CONFIRMED

## Regression guard

- `ops:learner-polish-2`: PASS (LEARNER_POLISH_2_GO_MANUAL_UX_FIXES_CONFIRMED)
- `ops:learner-polish-2-e2e`: PASS (LEARNER_POLISH_2_E2E_CONFIRMED)
- `ops:cert-eligibility-ux-1`: PASS (CERT_ELIGIBILITY_UX_1_GO_BACKEND_DRIVEN_FILTERING_CONFIRMED)
- `ops:documents-certificates-1`: PASS (DOCUMENTS_CERTIFICATES_1_GO_LEARNER_DOCUMENTS_TRUST_DETAILS_CONFIRMED)
- `ops:exam-reg-1`: PASS (EXAM_REG_1_GO_LEARNER_EXAM_REGISTRATION_CONFIRMED)
- `ops:learner-flow-1`: PASS (LEARNER_FLOW_1_GO_LEARNER_JOURNEY_READY)
- `ops:cert-ops-1r`: PASS (CERT_OPS_1R_GO_FULL_LIVE_CONFIRMED)
- `ops:public-ux-1r3`: PASS (PUBLIC_UX_1R3_GO_PUBLIC_EXPERIENCE_LIVE_CONFIRMED)
- `ops:support-contact-1r`: PASS (SUPPORT_CONTACT_1R_GO_LIVE_CONFIRMED)
- `ops:mobile-nav-1`: PASS (MOBILE_NAV_1_GO_RESPONSIVE_UX_READY)
- `ops:local-uat-4b`: PASS (LOCAL_UAT_4B_GO_REFRESHED_LOCAL_BASELINE_CONFIRMED)

## Recommendation

Proceed to **APPEALS-COMPLAINTS-1** — exam registration browser flow confirmed with stable local auth.
