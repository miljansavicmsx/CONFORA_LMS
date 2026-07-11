# TD-085 Discovery

## Problem

TD-084 confirmed learner final acceptance fails with false NO-GO when Playwright-heavy ops bundles run in parallel (learner + admin-gov + S17 + F5-3).

## Existing runners inspected

| Runner | Script | Parallel risk |
|--------|--------|---------------|
| Learner final acceptance | `run-learner-final-acceptance-1.mjs` | Playwright chromium |
| Admin/gov final acceptance | `run-admin-gov-final-acceptance-1.mjs` | Playwright chromium |
| S17 public verify | `run-s17-public-verify-browser.mjs` | Playwright + nested ops |
| F5-3 data readiness | `run-f5-3-data-readiness-check.mjs` | Keycloak login probes |
| F4-9 smoke | `run-f4-9-faza4-smoke.mjs` | Sustained API + KC tokens |
| F4 audit | `audit-f4-frontend-api-usage.mjs` | Static scan (safe first) |

## Sequential order rationale

1. **audit:f4-frontend-api** — fast governance gate; hard-stop on failure
2. **ops:f5-3-data-readiness** — data/API probes before browser suites
3. **ops:s17-public-verify-browser** — public verify before authenticated UI
4. **ops:admin-gov-final-acceptance-1** — staff Playwright (alone)
5. **ops:learner-final-acceptance-1** — learner Playwright (alone)
6. **ops:f4-9-smoke** — sustained API smoke last (token load)

## Implementation

`scripts/ops/run-local-pilot-sequential-regression.mjs` — `spawnSync` per npm script; no parallel child processes.
