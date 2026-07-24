# CONFORA-REPO-HEALTH-25 — i18n / Localization Review

## Findings count

**`i18n_localization_findings_count`: 4**

| ID | Finding | Severity |
|----|---------|----------|
| I18N-01 | `SUBJECT_EN` used for **all** locales; comment admits HR uses EN until localized | High — REWORK |
| I18N-02 | `audit.integrity.failed` `hr.mjml` **byte-identical** to `en.mjml` | Medium |
| I18N-03 | `standard/v1/hr.mjml` **byte-identical** to `en.mjml` | Medium |
| I18N-04 | `report.mr_monthly_digest` HR only localizes `<mj-title>`; body chrome still EN brand layout | Low–Medium |

## Locale strategy (as implemented)

- Declared locales: `en`, `hr`
- Fallback: unknown locale → `en`; missing event MJML → event `en` → standard locale → standard `en`
- Subjects: template-owned English map (product copy in package)
- Body vars: intended caller-owned (`heading`/`bodyText`/`footer`)

## Verdict

Event-key catalog is locale-agnostic (**OK**). Subjects + HR MJML authenticity require rework before claiming bilingual templates. Prefer product/service-owned localized subjects rather than package English defaults for HR.
