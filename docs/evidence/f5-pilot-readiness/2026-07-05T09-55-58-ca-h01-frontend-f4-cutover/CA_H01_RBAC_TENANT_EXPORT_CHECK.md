# CA-H01 RBAC / Tenant / Export Check

| Control | Status | Notes |
|---------|--------|-------|
| Reports/export read-only | PASS | POST export only; no GET export paths |
| Learner denial | PASS | AdminReportsPage route guarded; F5-5 unchanged |
| Wrong-tenant denial | PASS | Staff reports tenant-scoped on backend; F5-3/F5-5 live |
| Export POST flow | PASS | `exportReport` → POST `/v1/staff/reports/export` |
| Audit redaction | LINKED_PASS | docs/evidence/f4-9-faza4-smoke/2026-06-17T16-26-54/ |
| RBAC weakened | false | No guard changes |
| Tenant isolation weakened | false | No filter changes |
| Legacy aliases removed | false | Backend aliases preserved |
| Legacy blocks weakened | false | No backend block changes |

## Residual notes

- Row-level certification decision table is aggregate-only on AdminReportsPage; detailed decision rows remain on ISO staff reports (`/dashboard/iso/reports`).
- Education CSV exports remain on `/v1/admin/education/reports/*.csv` (outside F4-8f admin/reports gate scope).
