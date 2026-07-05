# CA-H01 — Frontend F4 Cutover Report

| Field | Value |
|-------|-------|
| **Verdict** | **CA_H01_GO_FRONTEND_F4_CUTOVER_CONFIRMED** |
| **Evidence** | docs/evidence/f5-pilot-readiness/2026-07-05T09-55-58-ca-h01-frontend-f4-cutover/ |
| **Prior F5-7** | docs/evidence/f5-pilot-readiness/2026-07-05T09-31-12-f5-7-final-go-no-go/ |

## Problem

`audit:f4-frontend-api` NO-GO due legacy GET `/v1/admin/reports/*` paths in AdminReportsPage and admin-reports-api.ts (CA-H01).

## Fix

1. Report reads → `reports-client` canonical staff paths (`/v1/staff/reports/overview`, `certification-pipeline`, `certificates`, `lifecycle`, `audit`, `catalog`).
2. Exports → POST `/v1/staff/reports/export` via `exportReport`.
3. Dashboard summary remains `/v1/admin/dashboard/summary` (not in F4-8f admin/reports gate).
4. Education CSV exports use existing `downloadAdminEducationCsv` (`/v1/admin/education/reports/*.csv`).

## Validation

| Command | Result |
|---------|--------|
| audit:f4-frontend-api | PASS (GO) |
| ops:f4-9-smoke-test | PASS 10/10 |
| ops:f4-9-smoke | LINKED_PASS docs/evidence/f4-9-faza4-smoke/2026-06-17T16-26-54/ |
| ops:f5-5-security-gdpr-audit | PASS 18/18 |
| vitest admin-reports-api | PASS |

## Failing paths

| Metric | Before | After |
|--------|--------|-------|
| Unique failing production paths | 12 | 0 |

## F5-7 re-run recommendation

**Re-run `npm run ops:f5-7-final-go-no-go`** — CA-H01 closed; expect FULL_INTERNAL_PILOT_GO candidate (external pilot still blocked by MFA, S17 browser, DPO).

## Non-claims

No staging/production/external pilot/DPO/legal approval claimed.
