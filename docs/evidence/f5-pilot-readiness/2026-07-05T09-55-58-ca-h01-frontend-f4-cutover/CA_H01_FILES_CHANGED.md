# CA-H01 Files Changed

- `frontend-app/src/lib/admin-reports-api.ts`
- `frontend-app/src/pages/admin/AdminReportsPage.tsx`
- `frontend-app/src/lib/__tests__/admin-reports-api.test.ts`
- `scripts/ops/run-ca-h01-frontend-f4-cutover.mjs`
- `package.json`

## Summary

- Migrated AdminReportsPage report reads to `reports-client` canonical `/v1/staff/reports/*` GET paths.
- Migrated exports to POST `/v1/staff/reports/export` via `exportReport`.
- Removed all production `/v1/admin/reports/*` GET usage from admin-reports-api.ts and AdminReportsPage.tsx.
- Legacy backend aliases not removed; audit gate not bypassed.
