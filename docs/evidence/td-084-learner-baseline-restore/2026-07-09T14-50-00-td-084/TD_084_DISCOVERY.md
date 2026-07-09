# TD-084 Discovery

**Task:** Restore learner final acceptance baseline after TD-083  
**Date:** 2026-07-09

## Evidence compared

| Run | Folder | Verdict | Screens |
|-----|--------|---------|---------|
| Prior GO (1R) | `docs/evidence/learner-final-acceptance/2026-07-08T21-14-51-learner-final-acceptance-1r/` | LEARNER_FINAL_ACCEPTANCE_1R_GO | 11/0 |
| TD-083 regression | `docs/evidence/learner-final-acceptance/2026-07-09T14-17-28-learner-final-acceptance-1r/` | BLOCKED_FUNCTIONAL_DEFECT | 2/9 |
| TD-084 clean rerun | `docs/evidence/learner-final-acceptance/2026-07-09T14-35-29-learner-final-acceptance-1r/` | LEARNER_FINAL_ACCEPTANCE_1R_GO | 11/0 |

## Failing tests (TD-083 regression)

The runner maps all screen statuses to a single Playwright pass/fail flag. When Playwright fails, **all** UI screens report FAIL even if only one test broke:

| Screen | TD-083 status | TD-084 clean status |
|--------|---------------|---------------------|
| Login / auth/me | PASS | PASS |
| Dashboard | FAIL | PASS |
| Moje edukacije | FAIL | PASS |
| Katalog | FAIL | PASS |
| Prijava za ispit | FAIL | PASS |
| Prijave za certifikaciju | FAIL | PASS |
| Moji certifikati | FAIL | PASS |
| Public verification | FAIL | PASS |
| Podrška/kontakt | FAIL | PASS |
| Žalbe i prigovori | FAIL | PASS |
| RBAC negative (API) | PASS | PASS |

`raw_enum_check_status` was `NOT_RUN` in TD-083 failure because Playwright did not complete.

## API vs frontend

TD-083 failed run `api-probes.json`:

```json
{
  "stackOk": true,
  "loginProbe": { "status": "PASS", "ok": true },
  "meProbe": { "ok": true, "hasEmail": true, "tenantPresent": true, "staffRoleDenied": true },
  "rbacProbes": { "learnerDeniedExport": true }
}
```

**Conclusion:** API and auth were healthy. Failure was in the Playwright browser layer, not backend data or TD-083 tenant fixes.

## Route allowlist

No changes to learner route allowlist between GO and NO-GO runs. `nest-auth-pilot.ts` still allows:

- `/dashboard/learner/education`
- `/courses`

Unit tests in `nest-auth-pilot.test.ts` unchanged.

## Auth / tenant resolution after TD-083

TD-083 changed wallet/recert tenant handling (403 on mismatch) and `/auth/me` identity resolution (User findUnique bypass). TD-084 clean rerun confirms:

- `pilot.learner@confora.test` login: PASS
- `/auth/me`: 200 with userId and tenant
- Wallet and education APIs reachable
- No regression from TD-083 tenant behavior on learner flows

## Root cause hypothesis

**Parallel Playwright contention during TD-083 regression.**

At `2026-07-09T14:17:22` TD-083 launched simultaneously:

- `ops:learner-final-acceptance-1`
- `ops:admin-gov-final-acceptance-1`
- `ops:f5-3-data-readiness`
- `ops:td-083-tenant-negative-api`
- `ops:s17-public-verify-browser` (shortly after)

Learner and admin-gov both run full Playwright suites against `localhost:3001` / Chromium. Under concurrent load:

- Login API probe succeeds (isolated HTTP)
- Browser navigation/timing fails (education heading, catalog shell timeouts)
- Pattern matches prior flake fixes documented in LEARNER_FINAL_ACCEPTANCE_1R_FIXES.md

TD-084 isolated rerun (no parallel Playwright) restored 11/11 without code changes.

## Stale frontend / cache

Not the primary cause:

- Frontend returned 200 on preflight
- Same frontend build served GO on 2026-07-08 and TD-084 clean run
- No frontend rebuild between TD-083 failure and TD-084 success

## Screenshots / traces

TD-083 failure evidence folder contains no Playwright trace artifacts (bounded-logs not retained). TD-084 clean run produced screenshots under `docs/evidence/learner-final-acceptance/2026-07-09T14-35-29-learner-final-acceptance-1r/screenshots/`.
