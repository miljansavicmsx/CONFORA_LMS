# TD-082 Live Seed Verify 1 — Report

**Task ID:** TD-082-LIVE-SEED-VERIFY-1  
**Timestamp:** 2026-07-09T13:02:55+02:00  
**Scope:** Live local verification only (Docker Postgres, Keycloak, API :4000, frontend :3001)

## Objective

Run TD-082 certificant wallet seed against the live local development database and verify CPD/recertification UI works without `?certificateId=` fallback.

## Executive summary

Live seed, API wallet selector, and UI CPD selector verification **passed**. TD-082 fixture `CON-PILOT-000082` is present for `pilot.learner2@confora.test` with OPEN recertification case. Minor local-state notes apply (multi-cert wallet, wrong-tenant 500, S17 fixture gap).

**Final verdict:** `TD_082_LIVE_SEED_VERIFY_1_GO_WITH_MINOR_LOCAL_STATE_NOTE`

## Preflight

All infrastructure checks passed. See [TD_082_LIVE_SEED_VERIFY_1_PREFLIGHT.md](./TD_082_LIVE_SEED_VERIFY_1_PREFLIGHT.md).

## Seed

- Command: `pnpm run ops:seed-pilot-cert-wallet`
- Two consecutive runs succeeded (idempotent)
- DB counts: 1 certificate, 1 recert case, 1 USR_CERT role

See [TD_082_LIVE_SEED_VERIFY_1_SEED_RESULTS.md](./TD_082_LIVE_SEED_VERIFY_1_SEED_RESULTS.md).

## API verification

`GET /v1/me/certificates` as certificant: non-empty, includes `CON-PILOT-000082` with selector fields and eligibility flags. Privacy checks passed on wallet payload. Anonymous 401; other candidate and wrong-tenant scopes denied without leak.

`GET /v1/me/recertification/CON-PILOT-000082`: HTTP 200, OPEN case with CPD inputs.

See [TD_082_LIVE_SEED_VERIFY_1_API_RESULTS.md](./TD_082_LIVE_SEED_VERIFY_1_API_RESULTS.md).

## UI verification

Playwright (2/2 pass):

1. `/dashboard/my-recertifications` — selector visible, `CON-PILOT-000082` listed, no fallback hint, CPD hours input usable after manual select (5 eligible certs in local DB).
2. With `?certificateId=CON-PILOT-000082` — fallback hint shown as designed.

See [TD_082_LIVE_SEED_VERIFY_1_UI_RESULTS.md](./TD_082_LIVE_SEED_VERIFY_1_UI_RESULTS.md).

## Regressions

| Gate | Result |
|------|--------|
| audit:f4-frontend-api | GO |
| ops:f5-3-data-readiness | GO |
| ops:learner-final-acceptance-1 | GO |
| ops:admin-gov-final-acceptance-1 | GO |
| ops:s17-public-verify-browser | BLOCKED (unrelated fixture) |

See [TD_082_LIVE_SEED_VERIFY_1_REGRESSION_RESULTS.md](./TD_082_LIVE_SEED_VERIFY_1_REGRESSION_RESULTS.md).

## Code changes during live verify (justified)

| Change | Rationale |
|--------|-----------|
| Mount `RecertificationController` in `CertWalletModule` | Route was unregistered in pilot API bootstrap |
| `recertification.service` uid/UUID + DB user resolution | Align with wallet Keycloak→DB user mapping; complete TD-082 lookup support |
| Pilot allowlist: `/dashboard/my-recertifications` | Page was blocked by nest-auth-pilot guard |
| Rebuild `@confora/i18n` | Stale dist missing `CANDIDATE_PORTAL_NS` export |
| E2E spec multi-cert behavior | Match TD-081 auto-select rule (single eligible only) |

No Prisma schema or migration changes. No RBAC, tenant, privacy, or governance weakening.

## Out of scope / not claimed

- Staging, production, or external pilot readiness
- Real personal data
- S17 public verification fixture repair

## Artifacts

- [summary.json](./summary.json)
- [api-results.json](./api-results.json)
