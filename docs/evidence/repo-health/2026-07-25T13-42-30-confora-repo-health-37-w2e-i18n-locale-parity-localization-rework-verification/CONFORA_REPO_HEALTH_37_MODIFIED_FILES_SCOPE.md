# CONFORA-REPO-HEALTH-37 — Modified Files Scope

## Expected vs observed

`git diff --name-only HEAD -- packages/i18n` → **14 files**.

| # | Path | Present |
|---|------|---------|
| 1 | `packages/i18n/locales/en/navigation.json` | yes |
| 2 | `packages/i18n/locales/hr/navigation.json` | yes |
| 3 | `packages/i18n/locales/sl/navigation.json` | yes |
| 4 | `packages/i18n/locales/bs/common.json` | yes |
| 5 | `packages/i18n/locales/sr/common.json` | yes |
| 6 | `packages/i18n/locales/sl/common.json` | yes |
| 7 | `packages/i18n/locales/hr/common.json` | yes |
| 8 | `packages/i18n/locales/bs/dashboard.json` | yes |
| 9 | `packages/i18n/locales/sr/dashboard.json` | yes |
| 10 | `packages/i18n/locales/hr/dashboard.json` | yes |
| 11 | `packages/i18n/locales/sl/dashboard.json` | yes |
| 12 | `packages/i18n/locales/bs/candidatePortal.json` | yes |
| 13 | `packages/i18n/locales/sr/candidatePortal.json` | yes |
| 14 | `packages/i18n/locales/sl/candidatePortal.json` | yes |

`EXTRA=` (empty) · `MISSING=` (empty) · `EXACT_MATCH=True`

## Staging

None of the 14 files are staged. `source_staged_after_verification: false`.

## Untracked under packages/i18n

None (no new files created by rework).
