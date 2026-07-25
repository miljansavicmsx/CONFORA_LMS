# CONFORA-REPO-HEALTH-38 — Commit Scope Review

## Rework commit

- **Hash:** `dbb50fe9b7722cb4b56eda46a250e0f71c468060`
- **Subject:** `fix(i18n): align locale parity and translations`
- **Parent:** `40928743` (`docs(repo): add i18n integrity review`)

## Files (exact 14)

```text
packages/i18n/locales/bs/candidatePortal.json
packages/i18n/locales/bs/common.json
packages/i18n/locales/bs/dashboard.json
packages/i18n/locales/en/navigation.json
packages/i18n/locales/hr/common.json
packages/i18n/locales/hr/dashboard.json
packages/i18n/locales/hr/navigation.json
packages/i18n/locales/sl/candidatePortal.json
packages/i18n/locales/sl/common.json
packages/i18n/locales/sl/dashboard.json
packages/i18n/locales/sl/navigation.json
packages/i18n/locales/sr/candidatePortal.json
packages/i18n/locales/sr/common.json
packages/i18n/locales/sr/dashboard.json
```

`EXACT=True` vs RH37 expected set · count **14**

## Absent from `dbb50fe9`

| Category | Present? |
|----------|----------|
| `packages/i18n/src/**` | no |
| `packages/i18n/package.json` / tests | no |
| root `package.json` / lock / workspace | no |
| `apps/**` / `packages/ui/**` | no |
| `packages/notification-templates/**` | no |
| database / auth / AI / audit / SDK / config | no |

`commit_scope_verified: true` · `out_of_scope_files_modified: []`
