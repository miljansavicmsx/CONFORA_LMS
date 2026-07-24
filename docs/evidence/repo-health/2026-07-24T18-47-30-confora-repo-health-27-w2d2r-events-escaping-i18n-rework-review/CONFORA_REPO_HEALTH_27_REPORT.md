# CONFORA-REPO-HEALTH-27 — Report

## Task

`CONFORA_REPO_HEALTH_27_W2D2R_EVENTS_ESCAPING_I18N_REWORK_REVIEW`  
**Evidence:** `docs/evidence/repo-health/2026-07-24T18-47-30-confora-repo-health-27-w2d2r-events-escaping-i18n-rework-review/`

## Baseline

HEAD `e46fab94`; remote OK; tracked + UI clean; `event-keys` tracked; `events`/`index`/MJML untracked.

## Findings

| Area | Result |
|------|--------|
| Unsafe interpolation | **confirmed** |
| Escaping rework | required |
| i18n rework | required (EN subjects for all locales; HR shells) |
| Recipient / provider / tenant routing / decisions | absent |
| Secrets / URLs | 0 / 0 |
| PII/tenant | 1 residual (opaque vars) |
| Workflow boundary blocking | 0 |

## Current GO/NO-GO

| Artifact | Recommendation |
|----------|----------------|
| `events.ts` | **NO-GO** |
| `index.ts` | **NO-GO** |
| MJML | **DEFER** |
| Future import candidate | **none** |

## Next

`IMPLEMENT_W2D2R_EVENTS_ESCAPING_I18N_REWORK_THEN_VERIFY_BEFORE_IMPORT`  
Tests **required** before import. MJML stay deferred after events rework.

## Final verdict

`CONFORA_REPO_HEALTH_27_AUDIT_ONLY_READY_FOR_REVIEW`
