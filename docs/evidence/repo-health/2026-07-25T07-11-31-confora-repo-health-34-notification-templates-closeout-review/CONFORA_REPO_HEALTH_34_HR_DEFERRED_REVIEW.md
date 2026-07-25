# CONFORA-REPO-HEALTH-34 — HR Deferred Review

## Status

| Check | Result |
|-------|--------|
| `hr.mjml` tracked | **0** |
| Untracked HR files present | **3** (`??`) |
| Silently shipped as authentic HR | **no** |
| Block reason | **i18n/localization only** (RH32 EN-as-HR / incomplete HR) |

## Loader behavior when HR missing

`readMjmlPreferEvent` falls back to EN event shell or EN standard with `mjmlUsedFallback: true` — auditable, not silent localization claim.

Subjects for HR already use explicit EN fallback metadata (`usedFallback`, `subjectLocalized: false`).

## Result

`hr_templates_remain_deferred: true` · `hr_i18n_deferred_pass: true`
