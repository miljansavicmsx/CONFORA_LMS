# TD-087 Raw Enum Fix

## Strategy

Map all user-visible education admin enums to Serbian/BHS labels using existing governance label helpers. No test suppression, no backend state machine changes.

## Changes

### 1. `frontend-app/src/lib/admin-gov-ux-labels.ts`

Added:

- `adminAuditActionLabel()` — maps `education.report.read`, `education.completion.recorded`, etc.
- `adminAuditResourceTypeLabel()` — maps `education.report`, `education.enrolment`, etc.
- `adminEducationEventKeyLabel()` — alias for notification event keys
- Safe fallbacks for unknown dot-notation keys (`Događaj edukacije` / `Audit događaj`)

Existing `adminReportStatusLabel()` already maps `NOT_STARTED` → `Nije započeto`, `IN_PROGRESS` → `U toku`.

### 2. `frontend-app/src/pages/admin/AdminEducationPage.tsx`

| Location | Before | After |
|----------|--------|-------|
| Enrolment list | `{row.progressStatus}` | `{adminReportStatusLabel(row.progressStatus)}` |
| Reports table Status column | `{r.progressStatus}` | `{adminReportStatusLabel(r.progressStatus)}` |
| Reports enrolment list | raw progressStatus | mapped label |
| Dashboard charts | raw API labels | `mapAdminChartRows()` |
| Notification rows | `{n.eventKey \|\| n.action}` | `{adminEducationEventKeyLabel(...)}` |
| Audit viewer | `{ev.action} · {ev.resourceType}` | mapped labels |
| Audit section description | English `education.report.*` text | Serbian user-facing description |

### 3. `frontend-app/src/lib/__tests__/admin-gov-ux-labels.test.ts`

Added tests for audit action/resource mapping and deny-list safety (24/24 pass).

## Not changed

- Prisma schema / migrations
- Certification workflow logic
- `RAW_ENUM_PATTERNS` in Playwright spec (check preserved)
- RBAC routes or auth guards
