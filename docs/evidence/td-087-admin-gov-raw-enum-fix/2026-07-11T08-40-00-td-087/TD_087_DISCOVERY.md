# TD-087 Discovery — Admin/Gov Standalone Raw Enum Regression

| Field | Value |
|-------|-------|
| **Task** | TD-087 |
| **Prior verdict** | TD-086 `TD_086_GO_F49_REPEATABLE` |
| **TD-086 failure** | `ops:admin-gov-final-acceptance-1` standalone 14/15 |

## TD-086 evidence inspected

`docs/evidence/admin-governance-final-acceptance/2026-07-11T07-40-48-admin-gov-final-acceptance-1/`

## Failed screen

| Field | Value |
|-------|-------|
| **Route** | `/dashboard/admin/education` |
| **Playwright test** | `upravljanje edukacijama — title, boundary, translated statuses` |
| **Component** | `frontend-app/src/pages/admin/AdminEducationPage.tsx` |
| **Heading** | Upravljanje edukacijama |

## Raw enum value (primary)

**`NOT_STARTED`** — education **progress status** enum rendered without label mapping.

Playwright log (TD-086):

```
Expected substring: not "NOT_STARTED"
```

Body also contained raw `IN_PROGRESS` in enrolment/report rows and dot-notation audit keys (`education.report.read`, `education.completion.recorded`) in the audit viewer and notification list.

## Enum category

**Education progress / lifecycle status** (not certification decision, RBAC role, or identity review).

Secondary exposures (same screen):

- Audit actions: `education.report.read`, `education.completion.recorded`
- Audit resource types: `education.report`, `education.enrolment`
- Chart tooltips/legends: unmapped progress/course status labels from API

## Why sequential runner passed TD-085/086

Sequential regression **did** run admin-gov; TD-086 standalone failures were intermittent:

1. **Raw enum** — reproduced on education screen when data included `NOT_STARTED` progress rows (deterministic with local pilot DB).
2. **Later run (post partial fix)** — education test passed 14/15; failure moved to RBAC test worker crash (`code=3221226505`), a transient Playwright infra issue unrelated to enum mapping.

Sequential order does not skip the education screen; timing/state did not hide the enum — the UI mapping was the defect.

## Root cause classification

| Layer | Verdict |
|-------|---------|
| Frontend mapping | **YES** — `progressStatus`, audit `action`/`resourceType`, chart labels displayed raw |
| API DTO | No change needed — backend correctly returns enum codes |
| Fixture | No — real pilot enrolment data with `NOT_STARTED` progress |
| Test helper | No — `assertNoRawEnums` correctly flags `NOT_STARTED` in `RAW_ENUM_PATTERNS` |

## Governance impact

Fix is display-only label mapping via existing `adminReportStatusLabel` / new audit label helpers. No RBAC, tenant, privacy, or audit trail changes.
