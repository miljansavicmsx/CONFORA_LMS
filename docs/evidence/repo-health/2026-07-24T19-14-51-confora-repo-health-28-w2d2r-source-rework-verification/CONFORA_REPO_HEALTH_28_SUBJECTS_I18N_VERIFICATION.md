# CONFORA-REPO-HEALTH-28 — Subjects / i18n Verification

| Check | Result |
|-------|--------|
| Catalog separate from event-keys | **yes** |
| Silent EN-for-all | **no** — HR/unknown set `usedFallback` + `subjectLocalized: false` |
| Explicit fallback metadata | **yes** (`usedFallback`, `fallbackFrom`, `subjectLocalized`, locales) |
| Fallback auditable | **yes** |
| Fake HR localization claim | **no** |
| Workflow conflation in subjects | **not implied** (distinct event titles; tested) |

**`subjects_catalog_separate`: true**  
**`subjects_explicit_fallback_metadata`: true**  
**`subjects_no_silent_locale_claim`: true**
