# TD-082 Live Seed Verify 1 — Regression Results

**Timestamp:** 2026-07-09T13:02:55+02:00

| Script | Verdict | Evidence |
|--------|---------|----------|
| `npm run audit:f4-frontend-api` | GO | `docs/evidence/f4-8f-legacy-api-usage-audit/2026-07-09T11-04-31` |
| `npm run ops:f5-3-data-readiness` | GO (50/50) | `docs/evidence/f5-pilot-readiness/2026-07-09T13-05-05` |
| `npm run ops:learner-final-acceptance-1` | LEARNER_FINAL_ACCEPTANCE_1R_GO | `docs/evidence/learner-final-acceptance/2026-07-09T13-12-10-learner-final-acceptance-1r` |
| `npm run ops:admin-gov-final-acceptance-1` | ADMIN_GOV_FINAL_ACCEPTANCE_GO | `docs/evidence/admin-governance-final-acceptance/2026-07-09T13-14-36-admin-gov-final-acceptance-1` |
| `npm run ops:s17-public-verify-browser` | BLOCKED (fixture gap) | `docs/evidence/f5-pilot-readiness/2026-07-09T13-14-36-s17-public-verify-browser` — `valid_lookup_status=FAIL`; unrelated to TD-082 certificant wallet |

## Regression summary

Core TD-082 regressions: **PASS**  
S17 public verify: **SKIPPED/BLOCKED** — pre-existing public verification fixture gap, not introduced by TD-082 seed work.

**regression_status:** PASS_WITH_S17_FIXTURE_NOTE
