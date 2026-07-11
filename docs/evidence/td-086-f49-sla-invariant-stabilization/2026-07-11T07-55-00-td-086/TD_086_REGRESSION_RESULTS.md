# TD-086 Regression Results

## Individual commands (TD-086 session)

| Command | Status | Evidence / notes |
|---------|--------|------------------|
| `ops:f4-9-smoke` (run 1) | **PASS** 64/64 | `docs/evidence/f4-9-faza4-smoke/2026-07-11T05-19-55/` |
| `ops:f4-9-smoke` (run 2) | **PASS** 64/64 | `docs/evidence/f4-9-faza4-smoke/2026-07-11T05-20-55/` |
| `audit:f4-frontend-api` | **PASS** | `docs/evidence/f4-8f-legacy-api-usage-audit/2026-07-11T05-22-18/` |
| `ops:f5-3-data-readiness` | **PASS** 50/50 | `docs/evidence/f5-pilot-readiness/2026-07-11T07-22-33/` |
| `ops:s17-public-verify-browser` (attempt 1) | **FAIL** | Frontend :3001 down — `S17_PUBLIC_VERIFY_BROWSER_BLOCKED_FRONTEND_OR_FIXTURE_GAP` |
| `ops:s17-public-verify-browser` (attempt 2) | **PASS** | Frontend started; `S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED` |
| `ops:admin-gov-final-acceptance-1` (standalone ×2) | **FAIL** | 14/15 Playwright — 1 raw enum in education audit log (`education.report.read`); **unrelated to TD-086** |
| `ops:learner-final-acceptance-1` | **PASS** 11/11 | `docs/evidence/learner-final-acceptance/2026-07-11T07-48-48-learner-final-acceptance-1r/` |

## Sequential regression

| Field | Value |
|-------|-------|
| **Command** | `npm run ops:local-pilot-sequential-regression` |
| **Evidence** | `docs/evidence/td-085-sequential-regression/2026-07-11T07-44-01-td-085/` |
| **Duration** | 420s |
| **Result** | **PASS** 6/6 |
| **Verdict** | `TD_085_GO_LOCAL_BASELINE_CONFIRMED` |

| Step | Status |
|------|--------|
| audit:f4-frontend-api | PASS |
| ops:f5-3-data-readiness | PASS |
| ops:s17-public-verify-browser | PASS |
| ops:admin-gov-final-acceptance-1 | PASS |
| ops:learner-final-acceptance-1 | PASS |
| ops:f4-9-smoke | PASS |

## Skipped / environmental notes

- **S17 attempt 1**: SKIPPED as pass — frontend not running; retried successfully after `cd frontend-app && npm run dev`
- **Admin-gov standalone**: FAIL is pre-existing UI raw-enum display in education management audit trail; sequential run passed 15/15 — not introduced by TD-086 ops changes

## Governance regression guard

| Check | Result |
|-------|--------|
| RBAC weakened | false |
| Tenant isolation weakened | false |
| Privacy weakened | false |
| Governance boundaries weakened | false |
| Prisma schema changed | false |
| Migrations changed | false |
| Production API code changed | false |
