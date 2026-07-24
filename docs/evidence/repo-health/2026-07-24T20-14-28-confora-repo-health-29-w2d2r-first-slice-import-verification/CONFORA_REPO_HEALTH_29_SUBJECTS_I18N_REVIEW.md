# CONFORA-REPO-HEALTH-29 — Subjects / i18n Review

**File:** `packages/notification-templates/src/subjects.ts` (5960 B)

| Check | Result |
|-------|--------|
| Catalog separate from event-keys | **yes** |
| Explicit fallback metadata | **yes** |
| Silent HR/locale claim | **no** (`subjectLocalized: false` on fallback) |
| Fake localization claim | **no** |
| PII interpolation | **none** (static subject strings) |
| Recipient / channel / provider / tenant | **none** |
| Workflow decision logic | **none** |
| Boundary conflation | **not implied** (distinct subjects) |

**`subjects_catalog_separate`: true**  
**`subjects_explicit_fallback_metadata`: true**  
**`subjects_no_silent_locale_claim`: true**
