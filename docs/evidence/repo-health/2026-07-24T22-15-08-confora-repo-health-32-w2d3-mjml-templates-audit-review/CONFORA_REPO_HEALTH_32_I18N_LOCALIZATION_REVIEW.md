# CONFORA-REPO-HEALTH-32 — i18n / Localization Review

| Template | Finding |
|----------|---------|
| `audit…/hr.mjml` | **Byte-identical** to EN — silent EN-as-HR |
| `standard/v1/hr.mjml` | **Byte-identical** to EN — silent EN-as-HR |
| `report.mr…/hr.mjml` | Title localized (`Upravljanje — izvještaji`); body chrome still EN brand layout |

Subjects remain in `subjects.ts` (separate) with explicit EN fallback metadata for HR — templates must not claim bilingual authenticity without rework.

**`i18n_localization_findings_count`: 3**
