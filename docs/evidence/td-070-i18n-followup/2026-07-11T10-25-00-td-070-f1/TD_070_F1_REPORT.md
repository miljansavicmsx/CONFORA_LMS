# TD-070-F1 Report — i18n Language Switcher & HR/SR/SL Completion

| Field | Value |
|-------|-------|
| **Task** | TD-070-F1 |
| **Evidence** | `docs/evidence/td-070-i18n-followup/2026-07-11T10-25-00-td-070-f1/` |
| **Final verdict** | **TD_070_F1_GO_WITH_DEFERRED_APP_WIDE_EXTRACTION** |
| **Date** | 2026-07-11 |

## Summary

Added a safe UI language switcher (en/bs/sr/hr/sl) with `localStorage` persistence, new `auth` and `shell` i18n namespaces, Slovenian locale pack, and candidate-portal status label mapping. Login and CPD/recertification surfaces respect locale without affecting auth, RBAC, or API contracts. Sequential pilot baseline **6/6 PASS**.

## Deliverables

- Language switcher on login + authenticated header
- Five locales with namespace parity tests
- Login i18n (`auth` namespace)
- Recertification / certificate selector status labels
- No governance regression

## Deferred

App-wide dashboard, sidebar, committee, register, and full `admin-gov-ux-labels` i18n migration — documented in discovery.

## Artifacts

- `TD_070_F1_DISCOVERY.md`
- `TD_070_F1_LANGUAGE_SWITCHER.md`
- `TD_070_F1_TRANSLATION_COVERAGE.md`
- `TD_070_F1_TEST_RESULTS.md`
- `TD_070_F1_REGRESSION_RESULTS.md`
- `summary.json`
