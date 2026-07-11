# TD-087 Report — Admin/Gov Standalone Raw Enum Fix

| Field | Value |
|-------|-------|
| **Task** | TD-087 |
| **Evidence** | `docs/evidence/td-087-admin-gov-raw-enum-fix/2026-07-11T08-40-00-td-087/` |
| **Final verdict** | **TD_087_GO_ADMIN_GOV_STANDALONE_RESTORED** |
| **Date** | 2026-07-11 |

## Summary

TD-086 reported admin-gov standalone 14/15 due to raw enum `NOT_STARTED` on the **Upravljanje edukacijama** screen. TD-087 maps education progress statuses, chart labels, audit actions, and notification event keys to Serbian/BHS labels via existing governance helpers. Standalone acceptance restored **15/15**; full sequential regression **6/6** confirmed.

## Root cause

Frontend displayed raw `progressStatus` (`NOT_STARTED`, `IN_PROGRESS`) and dot-notation audit keys (`education.report.read`) without calling `adminReportStatusLabel` / audit label helpers on `AdminEducationPage`.

## Fix

- `admin-gov-ux-labels.ts` — audit action/resource label functions
- `AdminEducationPage.tsx` — apply labels to progress rows, charts, notifications, audit viewer
- Unit tests — 24/24 pass

## Acceptance

| Metric | Result |
|--------|--------|
| Standalone admin-gov | **GO 15/15** |
| raw_enum | PASS |
| language | PASS |
| RBAC/tenant | PASS |

## Regression

All required suites pass; F4-9 had one transient 401 failure under parallel load, passed on isolated retry and in sequential runner.

## Compliance

No Prisma/migration changes. No certification workflow changes. No RBAC/privacy/governance weakening. No external pilot claims.

## Artifacts

- `TD_087_DISCOVERY.md`
- `TD_087_RAW_ENUM_FIX.md`
- `TD_087_ADMIN_GOV_RESULTS.md`
- `TD_087_RBAC_PRIVACY_RESULTS.md`
- `TD_087_REGRESSION_RESULTS.md`
- `summary.json`
