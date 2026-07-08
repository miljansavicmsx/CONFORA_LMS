# LOCAL_PILOT_FINAL_ROLLUP_1 Regression Results

Rollup session live rechecks (stack UP: API 200, frontend 200 at rollup time).

| Command | Status | Mode | Evidence |
|---------|--------|------|----------|
| `audit:f4-frontend-api` | PASS | LIVE | `docs/evidence/f4-8f-legacy-api-usage-audit/2026-07-08T20-19-29/` |
| `ops:f5-3-data-readiness` | PASS (50/50) | LIVE | `docs/evidence/f5-pilot-readiness/2026-07-08T22-19-50/` |
| `ops:f5-5-security-gdpr-audit` | PASS (18/18, residual gaps) | LIVE | `docs/evidence/f5-pilot-readiness/2026-07-08T22-20-18-f5-5-security-gdpr-audit-hardening/` |
| `ops:f4-9-smoke` | PASS (64/64) | LINKED_PASS | `docs/evidence/f4-9-faza4-smoke/2026-07-08T17-14-43/` — same-day canonical; not re-run in rollup window |
| `ops:s17-public-verify-browser` | PASS | LINKED_PASS | `docs/evidence/f5-pilot-readiness/2026-07-08T20-22-38-s17-public-verify-browser/` |
| `ops:admin-gov-final-acceptance-1` | PASS (15/15) | LINKED_PASS | `docs/evidence/admin-governance-final-acceptance/2026-07-08T20-45-46-admin-gov-final-acceptance-1/` |
| `ops:learner-final-acceptance-1` | PASS (11/11) | LINKED_PASS | `docs/evidence/learner-final-acceptance/2026-07-08T21-14-51-learner-final-acceptance-1r/` |

**Overall regression guard:** PASS (3 LIVE + 4 LINKED_PASS from same local session day)

**Skipped:** None. LINKED_PASS entries use canonical evidence from 2026-07-08 local acceptance session; not counted as skipped.
